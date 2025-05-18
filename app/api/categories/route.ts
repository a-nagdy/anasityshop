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
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
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
            const categoryData: any = {};

            // Extract fields from formData
            formData.forEach((value, key) => {
                // Skip files
                if (key !== 'image' && !(value instanceof File)) {
                    categoryData[key] = value;
                }
            });

            // Create a slug if not provided
            if (!categoryData.slug && categoryData.name) {
                categoryData.slug = categoryData.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }

            // Handle image upload if exists
            const image = formData.get('image') as File;
            if (image) {
                try {
                    const uploadResult = await uploadFile(image, 'categories');
                    categoryData.image = uploadResult.url;
                    categoryData.imageId = uploadResult.publicId;
                } catch (uploadError: any) {
                    return NextResponse.json(
                        { message: uploadError.message },
                        { status: 400 }
                    );
                }
            }

            // Create a new category
            const category = await Category.create(categoryData);
            return NextResponse.json(category, { status: 201 });
        } catch (error: any) {
            // Handle duplicate key errors
            if (error.code === 11000) {
                return NextResponse.json(
                    {
                        message: 'Duplicate value error',
                        field: Object.keys(error.keyPattern)[0],
                        value: error.keyValue[Object.keys(error.keyPattern)[0]],
                    },
                    { status: 400 }
                );
            }

            // Handle validation errors
            if (error.name === 'ValidationError') {
                const errors: any = {};

                // Extract all validation errors
                Object.keys(error.errors).forEach((field) => {
                    errors[field] = error.errors[field].message;
                });

                return NextResponse.json(
                    { message: 'Validation error', errors },
                    { status: 400 }
                );
            }

            return NextResponse.json({ message: error.message }, { status: 500 });
        }
    });
} 