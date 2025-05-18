import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../../middleware/authMiddleware';
import connectToDatabase from '../../../utils/db';
import Cart from '../models/Cart';
import Product from '../models/Product';

// Get user's cart
export function GET(req: NextRequest) {
    return authMiddleware(req, async (req, user) => {
        try {
            await connectToDatabase();

            // Find user's cart
            let cart = await Cart.findOne({ user: user._id })
                .populate({
                    path: 'items.product',
                    select: 'name price image status quantity',
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
            }

            return NextResponse.json(cart);
        } catch (error) {
            console.error('Error fetching cart:', error);
            return NextResponse.json(
                { message: error instanceof Error ? error.message : 'An error occurred' },
                { status: 500 }
            );
        }
    });
}

// Add to cart or update cart item
export function POST(req: NextRequest) {
    return authMiddleware(req, async (req, user) => {
        try {
            await connectToDatabase();

            // Get request body
            const { productId, quantity, color, size } = await req.json();

            // Validate product ID
            if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
                return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
            }

            // Validate quantity
            if (!quantity || quantity < 1) {
                return NextResponse.json({ message: 'Quantity must be at least 1' }, { status: 400 });
            }

            // Get product details
            const product = await Product.findById(productId);
            if (!product) {
                return NextResponse.json({ message: 'Product not found' }, { status: 404 });
            }

            // Check if product is in stock
            if (product.status === 'out of stock' || product.quantity < quantity) {
                return NextResponse.json({ message: 'Product is out of stock or has insufficient quantity' }, { status: 400 });
            }

            // Find user's cart
            let cart = await Cart.findOne({ user: user._id });

            // If cart doesn't exist, create one
            if (!cart) {
                cart = new Cart({
                    user: user._id,
                    items: [],
                });
            }

            // Check if product already exists in cart
            const existingItemIndex = cart.items.findIndex(
                item => item.product.toString() === productId &&
                    item.color === (color || '') &&
                    item.size === (size || '')
            );

            // Calculate item price and total
            const price = product.discountPrice || product.price;
            const totalPrice = price * quantity;

            if (existingItemIndex > -1) {
                // Update existing item
                cart.items[existingItemIndex].quantity = quantity;
                cart.items[existingItemIndex].price = price;
                cart.items[existingItemIndex].totalPrice = totalPrice;
            } else {
                // Add new item
                cart.items.push({
                    product: productId,
                    quantity,
                    color: color || '',
                    size: size || '',
                    price,
                    totalPrice,
                });
            }

            // Save cart
            await cart.save();

            // Return updated cart with populated product details
            const updatedCart = await Cart.findById(cart._id).populate({
                path: 'items.product',
                select: 'name price image status quantity',
            });

            return NextResponse.json(updatedCart);
        } catch (error) {
            console.error('Error updating cart:', error);
            return NextResponse.json(
                { message: error instanceof Error ? error.message : 'An error occurred' },
                { status: 500 }
            );
        }
    });
}

// Clear cart
export function DELETE(req: NextRequest) {
    return authMiddleware(req, async (req, user) => {
        try {
            await connectToDatabase();

            // Find user's cart
            const cart = await Cart.findOne({ user: user._id });

            if (!cart) {
                return NextResponse.json({ message: 'Cart not found' }, { status: 404 });
            }

            // Clear cart items
            cart.items = [];
            await cart.save();

            return NextResponse.json({ message: 'Cart cleared successfully' });
        } catch (error) {
            console.error('Error clearing cart:', error);
            return NextResponse.json(
                { message: error instanceof Error ? error.message : 'An error occurred' },
                { status: 500 }
            );
        }
    });
} 