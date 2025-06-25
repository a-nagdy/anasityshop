import { CartItem, CartResponse, EnhancedCartItem } from '@/app/types/cart';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { ApiResponseHelper } from '../../../utils/apiResponse';
import connectToDatabase from '../../../utils/db';
import { Validator } from '../../../utils/validation';
import Cart from '../models/Cart';
import Product from '../models/Product';

// Cart validation schemas
const addToCartSchema = {
    productId: { required: true, type: 'objectId' as const },
    quantity: { required: true, type: 'number' as const, min: 1, max: 99 },
    color: { type: 'string' as const, max: 50 },
    size: { type: 'string' as const, max: 20 }
};

// Get user's cart with optimized population
export function GET(req: NextRequest) {
    return authMiddleware(req, async (req, user) => {
        try {
            await connectToDatabase();

            // Find user's cart with optimized field selection
            let cart = await Cart.findOne({ user: user._id })
                .populate({
                    path: 'items.product',
                    select: 'name price discountPrice image status quantity active slug',
                    match: { active: true } // Only populate active products
                });

            // If cart doesn't exist, create an empty one
            if (!cart) {
                cart = new Cart({
                    user: user._id,
                    items: [],
                    totalItems: 0,
                    totalPrice: 0,
                });
                await cart.save();
            } else {
                // Filter out items with inactive/deleted products
                const validItems = cart.items.filter((item: CartItem) =>
                    item.product && (item.product as unknown as { active: boolean }).active
                );

                // Update cart if items were filtered out
                if (validItems.length !== cart.items.length) {
                    cart.items = validItems;
                    await cart.save();
                }
            }

            // Calculate current totals and validate stock
            const updatedItems: EnhancedCartItem[] = cart.items.map((item: CartItem) => {
                const product = item.product as unknown as { price: number; discountPrice?: number; quantity: number };
                const currentPrice = product.discountPrice || product.price;

                return {
                    ...(item.toObject ? item.toObject() : item),
                    product: item.product,
                    quantity: item.quantity,
                    price: item.price,
                    totalPrice: item.totalPrice,
                    color: item.color,
                    size: item.size,
                    currentPrice,
                    inStock: product.quantity >= item.quantity,
                    availableQuantity: product.quantity
                } as EnhancedCartItem;
            });

            const response: CartResponse = {
                ...cart.toObject(),
                items: updatedItems,
                summary: {
                    subtotal: updatedItems.reduce((sum: number, item: EnhancedCartItem) => sum + item.totalPrice, 0),
                    totalItems: updatedItems.reduce((sum: number, item: EnhancedCartItem) => sum + item.quantity, 0)
                }
            };

            return NextResponse.json(
                ApiResponseHelper.success(response, 'Cart retrieved successfully')
            );

        } catch (error) {
            console.error('Error fetching cart:', error);
            return NextResponse.json(
                ApiResponseHelper.serverError('Failed to retrieve cart'),
                { status: 500 }
            );
        }
    });
}

// Add to cart or update cart item with transaction safety
export function POST(req: NextRequest) {
    return authMiddleware(req, async (req, user) => {
        const session = await mongoose.startSession();

        try {
            await connectToDatabase();
            session.startTransaction();

            // Get and validate request body
            const rawData = await req.json();
            const sanitizedData = Validator.sanitizeInput(rawData) as {
                productId: string;
                quantity: number;
                color?: string;
                size?: string;
            };
            const { productId, quantity, color, size } = sanitizedData;

            // Validate input
            const { isValid, errors } = Validator.validate(
                { productId, quantity, color, size },
                addToCartSchema
            );
            if (!isValid) {
                return NextResponse.json(
                    ApiResponseHelper.validationError(errors),
                    { status: 400 }
                );
            }

            // Get product details with stock check
            const product = await Product.findOne({
                _id: productId,
                active: true,
                status: { $nin: ['draft', 'out of stock'] }
            }).session(session);

            if (!product) {
                return NextResponse.json(
                    ApiResponseHelper.error('Product not found or unavailable'),
                    { status: 404 }
                );
            }

            // Check stock availability
            if (product.quantity < quantity) {
                return NextResponse.json(
                    ApiResponseHelper.error(
                        `Only ${product.quantity} items available in stock`,
                        { availableQuantity: product.quantity }
                    ),
                    { status: 400 }
                );
            }

            // Find or create user's cart
            let cart = await Cart.findOne({ user: user._id }).session(session);
            if (!cart) {
                cart = new Cart({
                    user: user._id,
                    items: []
                });
            }

            // Check if product already exists in cart with same variants
            const existingItemIndex = cart.items.findIndex(
                (item: CartItem) =>
                    item.product.toString() === productId &&
                    (item.color || '') === (color || '') &&
                    (item.size || '') === (size || '')
            );

            // Calculate pricing
            const price = product.discountPrice || product.price;
            const totalItemQuantity = existingItemIndex > -1
                ? cart.items[existingItemIndex].quantity + quantity
                : quantity;

            // Validate total quantity doesn't exceed stock
            if (totalItemQuantity > product.quantity) {
                return NextResponse.json(
                    ApiResponseHelper.error(
                        `Cannot add ${quantity} items. Total would exceed available stock (${product.quantity})`
                    ),
                    { status: 400 }
                );
            }

            if (existingItemIndex > -1) {
                // Update existing item
                cart.items[existingItemIndex].quantity = totalItemQuantity;
                cart.items[existingItemIndex].price = price;
                cart.items[existingItemIndex].totalPrice = price * totalItemQuantity;
            } else {
                // Add new item
                cart.items.push({
                    product: productId,
                    quantity,
                    color: color || '',
                    size: size || '',
                    price,
                    totalPrice: price * quantity,
                });
            }

            // Save cart with session
            await cart.save({ session });
            await session.commitTransaction();

            // Return updated cart with populated product details
            const updatedCart = await Cart.findById(cart._id).populate({
                path: 'items.product',
                select: 'name price discountPrice image status quantity slug',
            });

            return NextResponse.json(
                ApiResponseHelper.success(updatedCart, 'Item added to cart successfully')
            );

        } catch (error) {
            await session.abortTransaction();
            console.error('Error updating cart:', error);

            return NextResponse.json(
                ApiResponseHelper.serverError('Failed to update cart'),
                { status: 500 }
            );
        } finally {
            session.endSession();
        }
    });
}

// Clear cart with confirmation
export function DELETE(req: NextRequest) {
    return authMiddleware(req, async (req, user) => {
        try {
            await connectToDatabase();

            // Find and clear user's cart
            const cart = await Cart.findOneAndUpdate(
                { user: user._id },
                {
                    items: [],
                    totalItems: 0,
                    totalPrice: 0
                },
                {
                    new: true,
                    upsert: true // Create if doesn't exist
                }
            );

            return NextResponse.json(
                ApiResponseHelper.success(cart, 'Cart cleared successfully')
            );

        } catch (error) {
            console.error('Error clearing cart:', error);
            return NextResponse.json(
                ApiResponseHelper.serverError('Failed to clear cart'),
                { status: 500 }
            );
        }
    });
} 