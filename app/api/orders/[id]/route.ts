import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, isAdmin } from '../../../../middleware/authMiddleware';
import connectToDatabase from '../../../../utils/db';
import Order from '../../models/Order';

// Get order by ID
export function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return authMiddleware(req, async (req, user) => {
        try {
            const { id } = await params;

            // Check if ID is valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { message: 'Invalid order ID format' },
                    { status: 400 }
                );
            }

            await connectToDatabase();

            // Find order by ID
            const order = await Order.findById(id)
                .populate('user', 'firstName lastName email')
                .populate({
                    path: 'items.product',
                    select: 'name price image',
                });

            if (!order) {
                return NextResponse.json(
                    { message: 'Order not found' },
                    { status: 404 }
                );
            }

            // Check if user is authorized to view this order
            if (
                user.role !== 'admin' &&
                user.role !== 'super-admin' &&
                order.user._id.toString() !== user._id.toString()
            ) {
                return NextResponse.json(
                    { message: 'Not authorized to view this order' },
                    { status: 403 }
                );
            }

            return NextResponse.json(order);
        } catch (error) {
            console.error('Error fetching order:', error);
            return NextResponse.json(
                { message: error instanceof Error ? error.message : 'An error occurred' },
                { status: 500 }
            );
        }
    });
}

// Update order - Admin only
export function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return authMiddleware(req, async (req, user) => {
        // Check if user is admin
        const adminCheckResult = isAdmin(user);
        if (adminCheckResult) return adminCheckResult;

        try {
            const { id } = await params;

            // Check if ID is valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { message: 'Invalid order ID format' },
                    { status: 400 }
                );
            }

            await connectToDatabase();

            // Get update data from request
            const updateData = await req.json();

            // Find order by ID
            const order = await Order.findById(id);

            if (!order) {
                return NextResponse.json(
                    { message: 'Order not found' },
                    { status: 404 }
                );
            }

            // Update order
            const updatedOrder = await Order.findByIdAndUpdate(
                id,
                {
                    ...updateData,
                    ...(updateData.status === 'delivered' ? { isDelivered: true, deliveredAt: new Date() } : {}),
                    ...(updateData.status === 'cancelled' ? { isCancelled: true, cancelledAt: new Date() } : {}),
                    ...(updateData.isPaid && !order.isPaid ? { paidAt: new Date() } : {}),
                },
                { new: true, runValidators: true }
            )
                .populate('user', 'firstName lastName email')
                .populate({
                    path: 'items.product',
                    select: 'name price image',
                });

            return NextResponse.json(updatedOrder);
        } catch (error) {
            console.error('Error updating order:', error);
            return NextResponse.json(
                { message: error instanceof Error ? error.message : 'An error occurred' },
                { status: 500 }
            );
        }
    });
}

// Delete order - Admin only
export function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return authMiddleware(req, async (req, user) => {
        // Check if user is admin
        const adminCheckResult = isAdmin(user);
        if (adminCheckResult) return adminCheckResult;

        try {
            const { id } = await params;

            // Check if ID is valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { message: 'Invalid order ID format' },
                    { status: 400 }
                );
            }

            await connectToDatabase();

            // Find order by ID
            const order = await Order.findById(id);

            if (!order) {
                return NextResponse.json(
                    { message: 'Order not found' },
                    { status: 404 }
                );
            }

            // Check if order can be deleted (only pending orders)
            if (order.status !== 'pending') {
                return NextResponse.json(
                    { message: 'Only pending orders can be deleted' },
                    { status: 400 }
                );
            }

            // Delete order
            await Order.findByIdAndDelete(id);

            return NextResponse.json(
                { message: 'Order deleted successfully' },
                { status: 200 }
            );
        } catch (error) {
            console.error('Error deleting order:', error);
            return NextResponse.json(
                { message: error instanceof Error ? error.message : 'An error occurred' },
                { status: 500 }
            );
        }
    });
} 