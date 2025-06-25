import { CartItem, PopulatedProduct } from '@/app/types/cart';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../../middleware/authMiddleware';
import connectToDatabase from '../../../utils/db';
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

            // If not admin, only show user's orders
            if (user.role !== 'admin' && user.role !== 'super-admin') {
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

            // Get order data from request
            const orderData = await req.json();

            // Start a transaction
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                // Get user's cart if items aren't provided
                if (!orderData.items || orderData.items.length === 0) {
                    const cart = await Cart.findOne({ user: user._id }).populate('items.product');

                    if (!cart || cart.items.length === 0) {
                        return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
                    }

                    // Transform cart items to order items
                    orderData.items = cart.items.map((item: CartItem) => ({
                        product: item.product._id,
                        name: (item.product as PopulatedProduct).name,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.totalPrice,
                        color: item.color,
                        size: item.size,
                        image: (item.product as PopulatedProduct).image,
                    }));

                    // Set order prices from cart
                    orderData.itemsPrice = cart.total;
                }

                // Set user ID if not provided
                if (!orderData.user) {
                    orderData.user = user._id;
                }

                // Calculate totals if not provided
                if (!orderData.total) {
                    // Calculate shipping price (simplified, could be more complex in real app)
                    const shippingPrice = orderData.shippingPrice || 10;

                    // Calculate tax price (simplified, could be based on location)
                    const taxRate = 0.15; // 15% tax rate
                    const taxPrice = orderData.taxPrice || parseFloat((orderData.itemsPrice * taxRate).toFixed(2));

                    // Calculate total price
                    const total = orderData.itemsPrice + shippingPrice + taxPrice;

                    // Set prices
                    orderData.shippingPrice = shippingPrice;
                    orderData.taxPrice = taxPrice;
                    orderData.total = total;
                }

                // Create new order
                const order = await Order.create([orderData], { session });

                // Update product quantities
                for (const item of orderData.items) {
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