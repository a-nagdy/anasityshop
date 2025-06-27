import { CartItem } from '@/app/types/cart';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../../../middleware/authMiddleware';
import { generateCartItemKey, normalizeVariants } from '../../../../utils/cartUtils';
import connectToDatabase from '../../../../utils/db';
import Cart from '../../models/Cart';
import Product from '../../models/Product';

// Update cart item
export function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    return authMiddleware(req, async (req, user) => {
        try {
            const { productId } = await params;

            // Validate product ID
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
            }

            await connectToDatabase();

            // Get request body
            const { quantity, color, size } = await req.json();

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
            const cart = await Cart.findOne({ user: user._id });

            if (!cart) {
                return NextResponse.json({ message: 'Cart not found' }, { status: 404 });
            }

            // Generate cart item key for identification
            const variants = normalizeVariants({ color, size });
            const cartItemKey = generateCartItemKey(productId, variants);

            // Find the cart item using the cart item key OR fallback to old method
            let itemIndex = cart.items.findIndex(
                (item: CartItem) => item.cartItemKey === cartItemKey
            );

            // Fallback: If not found by cartItemKey, try old method for backward compatibility
            if (itemIndex === -1) {
                itemIndex = cart.items.findIndex(
                    (item: CartItem) =>
                        item.product.toString() === productId &&
                        (item.color || '') === (color || '') &&
                        (item.size || '') === (size || '')
                );

                // If found with old method, update it with cartItemKey
                if (itemIndex > -1) {
                    cart.items[itemIndex].cartItemKey = cartItemKey;
                    if (!cart.items[itemIndex].variants) {
                        cart.items[itemIndex].variants = variants;
                    }
                }
            }

            if (itemIndex === -1) {
                return NextResponse.json({ message: 'Item not found in cart' }, { status: 404 });
            }

            // Calculate item price and total
            const price = product.discountPrice || product.price;
            const totalPrice = price * quantity;

            // Update item quantity and prices
            cart.items[itemIndex].quantity = quantity;
            cart.items[itemIndex].price = price;
            cart.items[itemIndex].totalPrice = totalPrice;

            // Save cart
            await cart.save();

            // Return updated cart with populated product details
            const updatedCart = await Cart.findById(cart._id).populate({
                path: 'items.product',
                select: 'name price image status quantity',
            });

            return NextResponse.json(updatedCart);
        } catch (error) {
            console.error('Error updating cart item:', error);
            return NextResponse.json(
                { message: error instanceof Error ? error.message : 'An error occurred' },
                { status: 500 }
            );
        }
    });
}

// Remove item from cart
export function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    return authMiddleware(req, async (req, user) => {
        try {
            const { productId } = await params;

            // Validate product ID
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
            }

            await connectToDatabase();

            // Get color and size from query params
            const url = new URL(req.url);
            const color = url.searchParams.get('color') || '';
            const size = url.searchParams.get('size') || '';

            // Find user's cart
            const cart = await Cart.findOne({ user: user._id });

            if (!cart) {
                return NextResponse.json({ message: 'Cart not found' }, { status: 404 });
            }

            // Generate cart item key for identification
            const variants = normalizeVariants({ color, size });
            const cartItemKey = generateCartItemKey(productId, variants);

            // Find and remove the cart item using the cart item key OR fallback to old method
            const initialItemsCount = cart.items.length;

            // Try to remove by cartItemKey first
            cart.items = cart.items.filter(
                (item: CartItem) => item.cartItemKey !== cartItemKey
            );

            // Fallback: If nothing was removed, try old method for backward compatibility
            if (cart.items.length === initialItemsCount) {
                cart.items = cart.items.filter(
                    (item: CartItem) => !(
                        item.product.toString() === productId &&
                        (item.color || '') === (color || '') &&
                        (item.size || '') === (size || '')
                    )
                );
            }

            // Check if any item was removed
            if (cart.items.length === initialItemsCount) {
                return NextResponse.json({ message: 'Item not found in cart' }, { status: 404 });
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
            console.error('Error removing cart item:', error);
            return NextResponse.json(
                { message: error instanceof Error ? error.message : 'An error occurred' },
                { status: 500 }
            );
        }
    });
} 