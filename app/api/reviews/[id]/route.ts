import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, isAdmin } from '../../../../middleware/authMiddleware';
import { ApiResponseHelper } from '../../../../utils/apiResponse';
import connectToDatabase from '../../../../utils/db';
import Review from '../../models/Review';

// Get specific review (Admin only)
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return authMiddleware(req, async (req, user) => {
        const adminCheckResult = isAdmin(user);
        if (adminCheckResult) return adminCheckResult;

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                ApiResponseHelper.validationError({ id: 'Invalid review ID format' }),
                { status: 400 }
            );
        }

        try {
            await connectToDatabase();

            const review = await Review.findById(id)
                .populate('product', 'name image sku')
                .populate('user', 'firstName lastName email')
                .populate('reviewedBy', 'firstName lastName')
                .lean();

            if (!review) {
                return NextResponse.json(
                    ApiResponseHelper.notFound('Review'),
                    { status: 404 }
                );
            }

            return NextResponse.json(
                ApiResponseHelper.success(review, 'Review retrieved successfully')
            );

        } catch (error: unknown) {
            console.error('Review GET error:', error);
            return NextResponse.json(
                ApiResponseHelper.serverError('Failed to retrieve review'),
                { status: 500 }
            );
        }
    });
}

// Update review (Admin only - for approval/rejection)
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return authMiddleware(req, async (req, user) => {
        const adminCheckResult = isAdmin(user);
        if (adminCheckResult) return adminCheckResult;

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                ApiResponseHelper.validationError({ id: 'Invalid review ID format' }),
                { status: 400 }
            );
        }

        try {
            await connectToDatabase();

            const body = await req.json();
            const { status, adminNotes } = body;

            // Validate status
            if (!['pending', 'approved', 'rejected'].includes(status)) {
                return NextResponse.json(
                    ApiResponseHelper.validationError({ status: 'Invalid status' }),
                    { status: 400 }
                );
            }

            const updateData: Record<string, unknown> = {
                status,
                reviewedBy: user._id,
                reviewedAt: new Date()
            };

            if (adminNotes) {
                updateData.adminNotes = adminNotes.trim();
            }

            const review = await Review.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            )
                .populate('product', 'name image sku')
                .populate('user', 'firstName lastName email')
                .populate('reviewedBy', 'firstName lastName');

            if (!review) {
                return NextResponse.json(
                    ApiResponseHelper.notFound('Review'),
                    { status: 404 }
                );
            }

            const statusMessages = {
                approved: 'Review approved successfully',
                rejected: 'Review rejected successfully',
                pending: 'Review status reset to pending'
            };

            return NextResponse.json(
                ApiResponseHelper.success(review, statusMessages[status as keyof typeof statusMessages])
            );

        } catch (error: unknown) {
            console.error('Review update error:', error);
            return NextResponse.json(
                ApiResponseHelper.serverError('Failed to update review'),
                { status: 500 }
            );
        }
    });
}

// Delete review (Admin only)
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return authMiddleware(req, async (req, user) => {
        const adminCheckResult = isAdmin(user);
        if (adminCheckResult) return adminCheckResult;

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                ApiResponseHelper.validationError({ id: 'Invalid review ID format' }),
                { status: 400 }
            );
        }

        try {
            await connectToDatabase();

            const review = await Review.findByIdAndDelete(id);

            if (!review) {
                return NextResponse.json(
                    ApiResponseHelper.notFound('Review'),
                    { status: 404 }
                );
            }

            return NextResponse.json(
                ApiResponseHelper.success(null, 'Review deleted successfully')
            );

        } catch (error: unknown) {
            console.error('Review delete error:', error);
            return NextResponse.json(
                ApiResponseHelper.serverError('Failed to delete review'),
                { status: 500 }
            );
        }
    });
} 