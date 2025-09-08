import { CartItem, PopulatedProduct } from '@/app/types/cart';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, hasPermission } from '../../../middleware/authMiddleware';
import connectToDatabase from '../../../utils/db';
import { Validator } from '../../../utils/validation';
import Cart from '../models/Cart';
import Order from '../models/Order';
import Product from '../models/Product';

// Get orders - Admins get all orders, users get only their own
export function GET(req: NextRequest) {
    return authMiddleware(req, async (req, user) => {
        try {
            await connectToDatabase();

            const url = new URL(req.url);
            const page = parseInt(url.searchParams.get('page') || '1');
            const limit = parseInt(url.searchParams.get('limit') || '10');
            const skip = (page - 1) * limit;

            let query: Record<string, string | boolean | mongoose.Types.ObjectId> = {};

            const hasAdminAccess = hasPermission(user, 'manage_orders') === null;

            if (!hasAdminAccess) {
                query = { user: user._id };
            }

            // Get optional filters from query params
            const status = url.searchParams.get('status');
            const isPaid = url.searchParams.get('isPaid');
            const isDelivered = url.searchParams.get('isDelivered');

            if (status) {
                query = { ...query, status };
            }

            if (isPaid === 'true') {
                query = { ...query, isPaid: true };
            } else if (isPaid === 'false') {
                query = { ...query, isPaid: false };
            }

            if (isDelivered === 'true') {
                query = { ...query, isDelivered: true };
            } else if (isDelivered === 'false') {
                query = { ...query, isDelivered: false };
            }

            // Get total count for pagination
            const totalOrders = await Order.countDocuments(query);

            // Get orders with pagination
            const orders = await Order.find(query)
                .populate('user', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            // Return orders with pagination info
            return NextResponse.json({
                orders,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalOrders / limit),
                    totalOrders,
                },
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
            return NextResponse.json(
                { message: error instanceof Error ? error.message : 'An error occurred' },
                { status: 500 }
            );
        }
    });
}

// Create a new order
export function POST(req: NextRequest) {
    return authMiddleware(req, async (req, user) => {
        try {
            await connectToDatabase();

            const orderData = await req.json();
            console.log('Received order data:', JSON.stringify(orderData, null, 2));

            // Sanitize the data but preserve the items array structure
            const sanitizedData = Validator.sanitizeInput(orderData) as typeof orderData;

            // Fix the items array if it was converted to an object
            if (sanitizedData.items && typeof sanitizedData.items === 'object' && !Array.isArray(sanitizedData.items)) {
                sanitizedData.items = Object.values(sanitizedData.items);
            }

            console.log('Sanitized data:', JSON.stringify(sanitizedData, null, 2));

            // Start a transaction
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                // Get user's cart if items aren't provided
                if (!sanitizedData.items || sanitizedData.items.length === 0) {
                    const cart = await Cart.findOne({ user: user._id }).populate('items.product');

                    if (!cart || cart.items.length === 0) {
                        return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
                    }

                    // Transform cart items to order items (align with schema field names)
                    sanitizedData.items = cart.items.map((item: CartItem) => ({
                        product: item.product._id,
                        name: (item.product as PopulatedProduct).name,
                        quantity: item.quantity,
                        price: item.price,
                        totalPrice: item.totalPrice,
                        color: item.color,
                        size: item.size,
                        image: (item.product as PopulatedProduct).image,
                    }));

                    // Set order prices from cart
                    sanitizedData.itemsPrice = cart.total;
                }

                // Set user ID if not provided
                if (!sanitizedData.user) {
                    sanitizedData.user = user._id;
                }

                // Ensure item totals exist and calculate missing ones
                if (sanitizedData.items && sanitizedData.items.length > 0) {
                    sanitizedData.items = sanitizedData.items.map((it: { product: string; name: string; quantity: number; price: number; totalPrice?: number; color?: string; size?: string; image?: string; }) => ({
                        ...it,
                        totalPrice: it.totalPrice ?? (it.quantity * it.price),
                    }));
                }

                // Calculate totals if not provided
                if (!sanitizedData.totalPrice) {
                    // Calculate shipping price (simplified, could be more complex in real app)
                    const shippingPrice = orderData.shippingPrice || sanitizedData.shippingPrice || 10;

                    // Calculate tax price (simplified, could be based on location)
                    const taxRate = 0.15; // 15% tax rate
                    const taxPrice = orderData.taxPrice || sanitizedData.taxPrice || parseFloat(((sanitizedData.itemsPrice || 0) * taxRate).toFixed(2));

                    // Calculate total price
                    const total = (sanitizedData.itemsPrice || 0) + shippingPrice + taxPrice;

                    // Set prices
                    sanitizedData.shippingPrice = shippingPrice;
                    sanitizedData.taxPrice = taxPrice;
                    sanitizedData.totalPrice = total;
                }

                // Create new order
                console.log('Final data being sent to Order.create:', JSON.stringify(sanitizedData, null, 2));
                const order = await Order.create([sanitizedData], { session });

                // Update product quantities
                for (const item of sanitizedData.items) {
                    await Product.findByIdAndUpdate(
                        item.product,
                        {
                            $inc: { quantity: -item.quantity, sold: item.quantity },
                        },
                        { session }
                    );
                }

                // Clear cart if order was created from cart
                if (!orderData.keepCart) {
                    await Cart.findOneAndUpdate(
                        { user: user._id },
                        { items: [], totalItems: 0, total: 0 },
                        { session }
                    );
                }

                // Commit transaction
                await session.commitTransaction();

                // Return created order
                return NextResponse.json(order[0], { status: 201 });
            } catch (transactionError) {
                // Abort transaction on error
                await session.abortTransaction();
                throw transactionError;
            } finally {
                // End session
                session.endSession();
            }
        } catch (error) {
            console.error('Error creating order:', error);
            return NextResponse.json(
                { message: error instanceof Error ? error.message : 'An error occurred' },
                { status: 500 }
            );
        }
    });
}