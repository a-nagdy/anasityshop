import { CategoryData, MongooseError, ValidationError } from '@/app/types/mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, isAdmin } from '../../../middleware/authMiddleware';
import connectToDatabase from '../../../utils/db';
import { uploadFile } from '../../../utils/fileUpload';
import Category from '../models/Category';

// Get all categories
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // Check if we should only return active categories
        const url = new URL(req.url);
        const activeOnly = url.searchParams.get('active') === 'true';

        const query = activeOnly ? { active: true } : {};
        const categories = await Category.find(query).sort({ name: 1 });

        if (!categories || categories.length === 0) {
            return NextResponse.json({ message: 'No categories found' }, { status: 404 });
        }

        return NextResponse.json(categories);
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

            // Get form data
            const formData = await req.formData();

            // Parse category data
            const categoryData: CategoryData = {};

            // Extract fields from formData
            formData.forEach((value, key) => {
                // Skip files
                if (key !== 'image' && !(value instanceof File)) {
                    categoryData[key] = value;
                }
            });

            // Create a slug if not provided
            if (!categoryData.slug && categoryData.name) {
                categoryData.slug = (categoryData.name as string)
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }

            // Handle image upload if exists
            const image = formData.get('image') as File;
            if (image) {
                try {
                    // Convert File to FileBuffer
                    const arrayBuffer = await image.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const fileBuffer = {
                        buffer,
                        mimetype: image.type,
                        name: image.name,
                        file: image
                    };

                    const uploadResult = await uploadFile(fileBuffer, 'categories');
                    categoryData.image = uploadResult.url;
                    categoryData.imageId = uploadResult.publicId;
                } catch (uploadError: unknown) {
                    return NextResponse.json(
                        { message: uploadError instanceof Error ? uploadError.message : 'An error occurred' },
                        { status: 400 }
                    );
                }
            }

            // Create a new category
            const category = await Category.create(categoryData);
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