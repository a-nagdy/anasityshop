import { ProductData } from '@/app/types/mongoose';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, isAdmin } from '../../../middleware/authMiddleware';
import { ApiResponseHelper } from '../../../utils/apiResponse';
import { cacheHelper } from '../../../utils/cache';
import connectToDatabase from '../../../utils/db';
import { determineProductStatus } from '../../../utils/productStatus';
import { Validator } from '../../../utils/validation';
import Product from '../models/Product';

// Validation schemas - removing unused schema
// const productQuerySchema = { ... } // Removed unused variable

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

// Get all products with simplified queries for better reliability
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

        console.log('Products API - Query params:', processedParams);

        const { page, limit, featured, bestseller, new: newProducts, sale, category, search, sort, status, productIds } = processedParams;
        const skip = (page - 1) * limit;

        // Generate cache key
        const cacheKey = `products_${JSON.stringify(processedParams)}`;

        // Try to get from cache first (reduced cache time for debugging)
        const cachedResult = await cacheHelper.withCache(
            cacheKey,
            async () => {
                // Build query filter
                const filter: Record<string, unknown> = {};

                // Basic filters
                if (productIds && productIds.length > 0) {
                    filter._id = { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) };
                } else {
                    // Only apply active/status filters if not fetching specific product IDs
                    filter.active = true;
                    if (status) {
                        filter.status = status;
                    } else {
                        filter.status = { $ne: 'draft' };
                    }
                }

                if (featured) filter.featured = true;
                if (category) {
                    try {
                        filter.category = new mongoose.Types.ObjectId(category);
                    } catch {
                        console.error('Invalid category ID:', category);
                        // Return empty result for invalid category ID
                        return { products: [], pagination: { page, limit, total: 0, totalPages: 0 } };
                    }
                }

                // Handle special filters
                if (bestseller) {
                    filter.sold = { $gte: 10 };
                }
        if (newProducts) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    filter.createdAt = { $gte: thirtyDaysAgo };
        }
        if (sale) {
                    filter.discountPrice = { $exists: true, $ne: null };
        }

                // Search functionality
                if (search) {
                    filter.$or = [
                        { name: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } }
                    ];
        }

                console.log('Products API - Filter:', JSON.stringify(filter, null, 2));

                // Count total documents
                const total = await Product.countDocuments(filter);

                // Build sort object
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let sortObj: any = { createdAt: -1 };
                switch (sort) {
                    case 'price_asc':
                        sortObj = { price: 1 };
                        break;
                    case 'price_desc':
                        sortObj = { price: -1 };
                        break;
                    case 'name_asc':
                        sortObj = { name: 1 };
                        break;
                    case 'name_desc':
                        sortObj = { name: -1 };
                        break;
                    case 'popular':
                        sortObj = { sold: -1 };
                        break;
                    case '-createdAt':
                    default:
                        sortObj = { createdAt: -1 };
        }

                // Execute query with population
                const products = await Product.find(filter)
                    .populate('category', 'name slug')
                    .sort(sortObj)
            .skip(skip)
            .limit(limit)
                    .select({
                        name: 1,
                        slug: 1,
                        description: 1,
                        price: 1,
                        discountPrice: 1,
                        image: 1,
                        images: 1,
                        category: 1,
                        status: 1,
                        quantity: 1,
                        sold: 1,
                        featured: 1,
                        ratings: 1,
                        totalRating: 1,
                        createdAt: 1,
                        active: 1,
                        color: 1,
                        size: 1
                    })
                    .lean();

                // Add computed fields
                const enrichedProducts = products.map(product => ({
                    ...product,
                    finalPrice: product.discountPrice || product.price,
                    hasDiscount: Boolean(product.discountPrice),
                    discountPercentage: product.discountPrice
                        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                        : 0
                }));

        const pagination = {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                };

                console.log(`Products API - Found ${enrichedProducts.length} products, total: ${total}`);

                return { products: enrichedProducts, pagination };
            },
            60000 // Cache for 1 minute (reduced for debugging)
        );

        return NextResponse.json({
            success: true,
            message: 'Products retrieved successfully',
            data: {
                products: cachedResult.products,
                pagination: cachedResult.pagination
            }
        });

    } catch (error: unknown) {
        console.error('Products GET error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to retrieve products',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
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

            // Create the product
            const product = new Product(productData);
            await product.save();

            // Populate category information
            await product.populate('category', 'name slug');

            // Clear cache
            cacheHelper.invalidateByPattern('products_*');

            return NextResponse.json(
                ApiResponseHelper.success(product, 'Product created successfully'),
                { status: 201 }
            );

        } catch (error: unknown) {
            console.error('Product creation error:', error);

            if (error instanceof Error) {
                return NextResponse.json(
                    ApiResponseHelper.error(error.message),
                    { status: 400 }
                );
            }

                    return NextResponse.json(
                ApiResponseHelper.serverError('Failed to create product'),
                { status: 500 }
            );
        }
    });
} 