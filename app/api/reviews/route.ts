import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { ApiResponseHelper } from '../../../utils/apiResponse';
import connectToDatabase from '../../../utils/db';
import { Validator } from '../../../utils/validation';
import Product from '../models/Product';
import Review from '../models/Review';

// Get all reviews (Admin only) or reviews for a specific product
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');
        const status = searchParams.get('status') || 'approved'; // default to approved reviews
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const statsOnly = searchParams.get('statsOnly') === 'true';

        // Build query
        const query: Record<string, unknown> = {};
        if (productId) {
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return NextResponse.json(
                    ApiResponseHelper.error('Invalid product ID format'),
                    { status: 400 }
                );
            }
            query.product = productId;
        }

        // Add status filter only if not getting all statuses
        if (status && status !== 'all') {
            query.status = status;
        }

        // If only stats are requested
        if (statsOnly && productId) {
            const [reviewCount, averageRatingResult] = await Promise.all([
                Review.countDocuments({ product: productId, status: 'approved' }),
                Review.aggregate([
                    { $match: { product: new mongoose.Types.ObjectId(productId), status: 'approved' } },
                    { $group: { _id: null, averageRating: { $avg: '$rating' } } }
                ])
            ]);

            const averageRating = averageRatingResult.length > 0
                ? Math.round(averageRatingResult[0].averageRating * 10) / 10
                : 0;

            return NextResponse.json(
                ApiResponseHelper.success({
                    reviewCount,
                    averageRating
                })
            );
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get reviews with pagination
        const [reviews, total] = await Promise.all([
            Review.find(query)
                .populate('user', 'firstName lastName email')
                .populate('product', 'name sku')
                .populate('reviewedBy', 'firstName lastName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Review.countDocuments(query)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return NextResponse.json(
            ApiResponseHelper.success({
                reviews,
                pagination: {
                    currentPage: page,
                    totalPages,
                    total,
                    hasNext,
                    hasPrev
                }
            })
        );

    } catch (error: unknown) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            ApiResponseHelper.serverError(
                error instanceof Error ? error.message : 'Failed to fetch reviews'
            ),
            { status: 500 }
        );
    }
}

// Create a new review (Authenticated users only)
export async function POST(req: NextRequest) {
    return authMiddleware(req, async (req, user) => {
        try {
            await connectToDatabase();

            const body = await req.json();

            // Validate input
            const validation = Validator.validate(body, {
                productId: { required: true, type: 'objectId' },
                rating: { required: true, type: 'number', min: 1, max: 5 },
                comment: { required: true, type: 'string', min: 10, max: 1000 },
                title: { type: 'string', max: 100 }
            });

            if (!validation.isValid) {
                return NextResponse.json(
                    ApiResponseHelper.validationError(validation.errors),
                    { status: 400 }
                );
            }

            const { productId, rating, comment, title } = body;

            // Check if product exists
            const product = await Product.findById(productId);
            if (!product) {
                return NextResponse.json(
                    ApiResponseHelper.error('Product not found'),
                    { status: 404 }
                );
            }

            // Check if user already reviewed this product
            const existingReview = await Review.findOne({
                product: productId,
                user: user._id
            });

            if (existingReview) {
                return NextResponse.json(
                    ApiResponseHelper.error('You have already reviewed this product'),
                    { status: 400 }
                );
            }

            // Check if user actually purchased this product (optional verification)
            // This would require an Order model check - implement later if needed

            // Create the review
            const review = new Review({
                product: productId,
                user: user._id,
                rating: Math.round(rating), // Ensure integer rating
                comment: comment.trim(),
                title: title?.trim() || '',
                status: 'pending', // All reviews start as pending
                verified: false // TODO: Check against orders
            });

            await review.save();

            // Populate user data for response
            await review.populate('user', 'firstName lastName');

            return NextResponse.json(
                ApiResponseHelper.success(review, 'Review submitted successfully! It will be reviewed by our team before being published.'),
                { status: 201 }
            );

        } catch (error: unknown) {
            console.error('Review creation error:', error);

            if (error instanceof Error && error.message.includes('duplicate key')) {
                return NextResponse.json(
                    ApiResponseHelper.error('You have already reviewed this product'),
                    { status: 400 }
                );
            }

            return NextResponse.json(
                ApiResponseHelper.serverError('Failed to create review'),
                { status: 500 }
            );
        }
    });
} 