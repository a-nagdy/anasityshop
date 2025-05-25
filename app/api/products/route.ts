import { MongooseError, ProductData, ValidationError } from '@/app/types/mongoose';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, isAdmin } from '../../../middleware/authMiddleware';
import connectToDatabase from '../../../utils/db';
import { determineProductStatus } from '../../../utils/productStatus';
import Product from '../models/Product';

// Get all products
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Get query parameters for filtering
        const featured = url.searchParams.get('featured') === 'true';
        const bestseller = url.searchParams.get('bestseller') === 'true';
        const newProducts = url.searchParams.get('new') === 'true';
        const sale = url.searchParams.get('sale') === 'true';
        const productIds = url.searchParams.get('productIds');

        // Build query based on parameters
        const query: { active?: boolean; parent?: null; _id?: { $in: string[] } | string, limit?: number, sold?: { $gte: number }, createdAt?: { $gte: Date }, discountPrice?: { $exists: boolean, $ne: null }, status?: { $ne: string }, featured?: boolean } = {};
        if (featured) {
            query.featured = true;
        }

        if (bestseller) {
            // Assuming bestsellers are products with high sold count
            // You can adjust this logic based on your business requirements
            query.sold = { $gte: 10 }; // Products sold 10 or more times
        }

        if (newProducts) {
            // Products created in the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            query.createdAt = { $gte: thirtyDaysAgo };
        }

        if (sale) {
            // Products with discount price
            query.discountPrice = { $exists: true, $ne: null };
        }

        if (productIds) {
            const ids = productIds.split(',');
            query._id = { $in: ids };
        }

        // Only show active products unless specifically querying by IDs
        if (!productIds) {
            query.active = true;
            query.status = { $ne: 'draft' };
        }

        const products = await Product.find(query)
            .populate('category', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Sort by newest first

        if (!products || products.length === 0) {
            return NextResponse.json({ message: 'No products found' }, { status: 404 });
        }

        const totalProducts = await Product.countDocuments(query);
        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts,
        };

        return NextResponse.json({ products, pagination });
    } catch (error: unknown) {
        return NextResponse.json({ message: error instanceof Error ? error.message : 'An error occurred' }, { status: 500 });
    }
}

// Create a new product - Admin only
export async function POST(req: NextRequest) {
    return authMiddleware(req, async (req, user) => {
        // Check if user is admin
        const adminCheckResult = isAdmin(user);
        if (adminCheckResult) return adminCheckResult;

        try {
            await connectToDatabase();

            // Get JSON data
            const productData: ProductData = await req.json();

            // Create a slug if not provided
            if (!productData.slug && productData.name) {
                productData.slug = (productData.name as string)
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }

            // Validate category ID if provided
            if (productData.category) {
                if (!mongoose.Types.ObjectId.isValid(productData.category as string)) {
                    return NextResponse.json(
                        { message: 'Invalid category ID format' },
                        { status: 400 }
                    );
                }
            }

            // With JSON approach, we expect image URLs to be provided directly
            // The actual file upload should be handled by the client using the upload API endpoint

            // Set product status based on quantity and active state
            if (productData.quantity !== undefined) {
                const active = productData.active !== undefined ? productData.active : true;
                productData.status = determineProductStatus(productData.quantity as number, active as boolean);
            }

            // Parse JSON strings if they exist
            if (typeof productData.color === 'string') {
                try {
                    productData.color = JSON.parse(productData.color);
                } catch {
                    // If it's not valid JSON, treat it as a single value
                    productData.color = [productData.color as string];
                }
            }

            if (typeof productData.size === 'string') {
                try {
                    productData.size = JSON.parse(productData.size);
                } catch {
                    // If it's not valid JSON, treat it as a single value
                    productData.size = [productData.size as string];
                }
            }

            // Create a new product
            const product = await Product.create(productData);
            return NextResponse.json(product, { status: 201 });

        } catch (error: unknown) {
            // Handle validation errors
            if (error instanceof Error && error.name === 'ValidationError') {
                const errors: Record<string, string> = {};
                const mongooseError = error as ValidationError;
                // Extract all validation errors
                Object.keys(mongooseError.errors).forEach((field) => {
                    errors[field] = mongooseError.errors[field].message;
                });

                return NextResponse.json(
                    { message: 'Validation error', errors },
                    { status: 400 }
                );
            }

            // Handle duplicate key errors
            if (error instanceof Error && error.name === 'MongooseError') {
                const mongooseError = error as MongooseError;
                if (mongooseError.code === 11000) {
                    return NextResponse.json(
                        {
                            message: 'Duplicate value error',
                            field: Object.keys(mongooseError.keyPattern || {})[0],
                            value: mongooseError.keyValue?.[Object.keys(mongooseError.keyPattern || {})[0]],
                        },
                        { status: 400 }
                    );
                }
            }

            return NextResponse.json({ message: error instanceof Error ? error.message : 'An error occurred' }, { status: 500 });
        }
    });
} 