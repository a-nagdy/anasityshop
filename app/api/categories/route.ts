import { CategoryData, MongooseError, ValidationError } from '@/app/types/mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, isAdmin } from '../../../middleware/authMiddleware';
import connectToDatabase from '../../../utils/db';
import { Validator } from '../../../utils/validation';
// No longer using file upload with JSON approach
import mongoose from 'mongoose';
import Category from '../models/Category';

// Get all categories
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // Check if we should only return active categories
        const url = new URL(req.url);
        const activeOnly = url.searchParams.get('active') === 'true';
        const parentOnly = url.searchParams.get('parentOnly') === 'true';
        const featured = url.searchParams.get('featured') === 'true';
        const categoryIds = url.searchParams.get('categoryIds');
        const limit = url.searchParams.get('limit') || 6;

        // Build query based on parameters
        const query: { active?: boolean; parent?: null; _id?: { $in: string[] } | string, limit?: number } = {};
        let categoriesQuery;
        if (activeOnly) {
            query.active = true;
        }

        if (parentOnly) {
            query.parent = null; // Only root categories
        }

        if (featured) {
            // For featured categories, return active categories with images
            query.active = true;
        }

        if (categoryIds) {
            const ids = categoryIds.split(',');
            query._id = { $in: ids };
            categoriesQuery = Category.find(query)
                .populate('parent', 'name')
                .populate({
                    path: 'products',
                    options: { limit: parseInt(limit as string) }
                })
                .sort({ name: 1 });
        } else {
            // Populate the parent field to get parent category details
            categoriesQuery = Category.find(query)
                .populate('parent', 'name')
                .sort({ name: 1 });

        }

        // Only try to populate products if the Product model exists
        if (mongoose.models.Product) {
            categoriesQuery = categoriesQuery.populate('products');
        }

        const categories = await categoriesQuery;

        if (!categories || categories.length === 0) {
            return NextResponse.json({ categories: [] });
        }

        return NextResponse.json({ categories });
    } catch (error: unknown) {
        return NextResponse.json({ message: error instanceof Error ? error.message : 'An error occurred' }, { status: 500 });
    }
}

// Create new category - Admin only
export async function POST(req: NextRequest) {
    return authMiddleware(req, async (req, user) => {
        // Check if user is admin
        const adminCheckResult = isAdmin(user);
        if (adminCheckResult) return adminCheckResult;

        try {
            await connectToDatabase();

            const categoryData: CategoryData = await req.json();
            const sanitizedData = Validator.sanitizeInput(categoryData) as CategoryData;

            if (!sanitizedData.slug && sanitizedData.name) {
                sanitizedData.slug = (sanitizedData.name as string)
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }

            const category = await Category.create(sanitizedData);
            return NextResponse.json(category, { status: 201 });
        } catch (error: unknown) {
            // Handle validation errors
            if (error instanceof Error && error.name === 'ValidationError') {
                const mongooseError = error as ValidationError;
                const errors: Record<string, string> = {};

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

            return NextResponse.json(
                { message: error instanceof Error ? error.message : 'An error occurred' },
                { status: 500 }
            );
        }
    });
}