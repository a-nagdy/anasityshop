import { MongooseError, ProductData, ValidationError } from '@/app/types/mongoose';
import mongoose, { PipelineStage } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, isAdmin } from '../../../middleware/authMiddleware';
import { ApiResponseHelper } from '../../../utils/apiResponse';
import { cacheHelper } from '../../../utils/cache';
import connectToDatabase from '../../../utils/db';
import { determineProductStatus } from '../../../utils/productStatus';
import { Validator } from '../../../utils/validation';
import Product from '../models/Product';

// Validation schemas
const productQuerySchema = {
    page: { type: 'number' as const, min: 1 },
    limit: { type: 'number' as const, min: 1, max: 100 },
    featured: { type: 'boolean' as const },
    bestseller: { type: 'boolean' as const },
    new: { type: 'boolean' as const },
    sale: { type: 'boolean' as const },
    category: { type: 'objectId' as const },
    search: { type: 'string' as const, min: 1, max: 100 },
    sort: { type: 'string' as const },
    status: { type: 'string' as const }
};

const productCreateSchema = {
    name: { required: true, type: 'string' as const, min: 1, max: 100 },
    description: { required: true, type: 'string' as const, min: 10, max: 2000 },
    price: { required: true, type: 'number' as const, min: 0 },
    category: { required: true, type: 'objectId' as const },
    quantity: { required: true, type: 'number' as const, min: 0 },
    discountPrice: { type: 'number' as const, min: 0 },
    featured: { type: 'boolean' as const },
    active: { type: 'boolean' as const }
};

// Get all products with optimized queries and caching
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const url = new URL(req.url);
        const queryParams = Object.fromEntries(url.searchParams.entries());

        // Convert string parameters to appropriate types
        const processedParams = {
            page: parseInt(queryParams.page || '1'),
            limit: Math.min(parseInt(queryParams.limit || '12'), 100),
            featured: queryParams.featured === 'true',
            bestseller: queryParams.bestseller === 'true',
            new: queryParams.new === 'true',
            sale: queryParams.sale === 'true',
            category: queryParams.category,
            search: queryParams.search,
            sort: queryParams.sort || '-createdAt',
            status: queryParams.status,
            productIds: queryParams.productIds?.split(',')
        };

        // Validate query parameters
        const { isValid, errors } = Validator.validate(processedParams, productQuerySchema);
        if (!isValid) {
            return NextResponse.json(
                ApiResponseHelper.validationError(errors),
                { status: 400 }
            );
        }

        const { page, limit, featured, bestseller, new: newProducts, sale, category, search, sort, status, productIds } = processedParams;
        const skip = (page - 1) * limit;

        // Generate cache key
        const cacheKey = cacheHelper.keys.products(processedParams);

        // Try to get from cache first
        const cachedResult = await cacheHelper.withCache(
            cacheKey,
            async () => {
                // Build aggregation pipeline for better performance
                const pipeline: PipelineStage[] = [];

                // Match stage
                const matchStage: PipelineStage = {
                    $match: {
                        active: true,
                        status: { $ne: 'draft' }
                    }
                };

                if (productIds && productIds.length > 0) {
                    matchStage.$match._id = { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) };
                } else {
                    matchStage.$match.active = true;
                    matchStage.$match.status = { $ne: 'draft' };
                }

                if (featured) matchStage.$match.featured = true;
                if (category) matchStage.$match.category = new mongoose.Types.ObjectId(category);
                if (status) matchStage.$match.status = status;

                // Handle special filters
                if (bestseller) {
                    matchStage.$match.sold = { $gte: 10 };
                }
                if (newProducts) {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    matchStage.$match.createdAt = { $gte: thirtyDaysAgo };
                }
                if (sale) {
                    matchStage.$match.discountPrice = { $exists: true, $ne: null };
                }

                // Search functionality
                if (search) {
                    matchStage.$match.$text = { $search: search };
                }

                pipeline.push({ $match: matchStage });

                // Lookup category information
                pipeline.push({
                    $lookup: {
                        from: 'categories',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'category',
                        pipeline: [{ $project: { name: 1, slug: 1 } }]
                    }
                });

                // Unwind category
                pipeline.push({
                    $unwind: { path: '$category', preserveNullAndEmptyArrays: true }
                });

                // Add computed fields
                pipeline.push({
                    $addFields: {
                        finalPrice: { $ifNull: ['$discountPrice', '$price'] },
                        hasDiscount: { $ne: ['$discountPrice', null] },
                        discountPercentage: {
                            $cond: {
                                if: { $ne: ['$discountPrice', null] },
                                then: {
                                    $multiply: [
                                        { $divide: [{ $subtract: ['$price', '$discountPrice'] }, '$price'] },
                                        100
                                    ]
                                },
                                else: 0
                            }
                        }
                    }
                });

                // Sort stage
                const sortStage: PipelineStage = {
                    $sort: {
                        finalPrice: 1,
                        name: 1,
                        sold: -1,
                        createdAt: -1
                    }
                };
                switch (sort) {
                    case 'price_asc':
                        sortStage.$sort.finalPrice = 1;
                        break;
                    case 'price_desc':
                        sortStage.$sort.finalPrice = -1;
                        break;
                    case 'name_asc':
                        sortStage.$sort.name = 1;
                        break;
                    case 'name_desc':
                        sortStage.$sort.name = -1;
                        break;
                    case 'popular':
                        sortStage.$sort.sold = -1;
                        break;
                    default:
                        sortStage.$sort.createdAt = -1;
                }
                pipeline.push({ $sort: sortStage.$sort });

                // Count total documents
                const countPipeline = [...pipeline, { $count: 'total' }];
                const countResult = await Product.aggregate(countPipeline);
                const total = countResult[0]?.total || 0;

                // Add pagination
                pipeline.push({ $skip: skip });
                pipeline.push({ $limit: limit });

                // Select fields to return
                pipeline.push({
                    $project: {
                        name: 1,
                        slug: 1,
                        description: 1,
                        price: 1,
                        discountPrice: 1,
                        finalPrice: 1,
                        hasDiscount: 1,
                        discountPercentage: 1,
                        image: 1,
                        images: { $slice: ['$images', 3] }, // Limit images for list view
                        category: 1,
                        status: 1,
                        quantity: 1,
                        sold: 1,
                        featured: 1,
                        ratings: { $size: { $ifNull: ['$ratings', []] } },
                        totalRating: 1,
                        createdAt: 1
                    }
                });

                // Execute query
                const products = await Product.aggregate(pipeline);

                const pagination = {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                };

                return { products, pagination };
            },
            300000 // Cache for 5 minutes
        );

        return NextResponse.json(
            ApiResponseHelper.success(
                cachedResult.products,
                'Products retrieved successfully',
                cachedResult.pagination
            )
        );

    } catch (error: unknown) {
        console.error('Products GET error:', error);
        return NextResponse.json(
            ApiResponseHelper.serverError('Failed to retrieve products'),
            { status: 500 }
        );
    }
}

// Create a new product - Admin only with enhanced validation
export async function POST(req: NextRequest) {
    return authMiddleware(req, async (req, user) => {
        // Check if user is admin
        const adminCheckResult = isAdmin(user);
        if (adminCheckResult) return adminCheckResult;

        try {
            await connectToDatabase();

            // Get and sanitize JSON data
            const rawData = await req.json();
            const productData = Validator.sanitizeInput(rawData) as ProductData;

            // Validate input
            const { isValid, errors } = Validator.validate(productData, productCreateSchema);
            if (!isValid) {
                return NextResponse.json(
                    ApiResponseHelper.validationError(errors),
                    { status: 400 }
                );
            }

            // Create a slug if not provided
            if (!productData.slug && productData.name) {
                productData.slug = productData.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }

            // Check if slug already exists
            const existingProduct = await Product.findOne({ slug: productData.slug });
            if (existingProduct) {
                return NextResponse.json(
                    ApiResponseHelper.error('Product slug already exists'),
                    { status: 400 }
                );
            }

            // Validate category exists
            const Category = mongoose.models.Category;
            if (Category) {
                const categoryExists = await Category.findById(productData.category);
                if (!categoryExists) {
                    return NextResponse.json(
                        ApiResponseHelper.error('Category not found'),
                        { status: 400 }
                    );
                }
            }

            // Set product status based on quantity and active state
            if (productData.quantity !== undefined) {
                const active = productData.active !== undefined ? productData.active : true;
                productData.status = determineProductStatus(Number(productData.quantity), active);
            }

            // Parse color and size arrays if they're strings
            if (typeof productData.color === 'string') {
                try {
                    productData.color = JSON.parse(productData.color || '[]');
                } catch {
                    productData.color = [productData.color as string];
                }
            }

            if (typeof productData.size === 'string') {
                try {
                    productData.size = JSON.parse(productData.size || '[]');
                } catch {
                    productData.size = [productData.size as string];
                }
            }

            // Create product
            const product = await Product.create(productData);

            // Invalidate related caches
            cacheHelper.invalidateByPattern('products:.*');
            cacheHelper.invalidateByPattern('categories:.*');
            cacheHelper.invalidateByPattern('homepage:.*');

            return NextResponse.json(
                ApiResponseHelper.success(product, 'Product created successfully'),
                { status: 201 }
            );

        } catch (error: unknown) {
            console.error('Product creation error:', error);

            // Handle validation errors
            if (error instanceof Error && error.name === 'ValidationError') {
                const mongooseError = error as ValidationError;
                const errors: Record<string, string> = {};
                Object.keys(mongooseError.errors).forEach((field) => {
                    errors[field] = mongooseError.errors[field].message;
                });

                return NextResponse.json(
                    ApiResponseHelper.validationError(errors),
                    { status: 400 }
                );
            }

            // Handle duplicate key errors
            if (error instanceof Error && error.name === 'MongooseError') {
                const mongooseError = error as MongooseError;
                if (mongooseError.code === 11000) {
                    const field = Object.keys(mongooseError.keyPattern || {})[0];
                    return NextResponse.json(
                        ApiResponseHelper.error(`${field} already exists`),
                        { status: 400 }
                    );
                }
            }

            return NextResponse.json(
                ApiResponseHelper.serverError('Failed to create product'),
                { status: 500 }
            );
        }
    });
} 