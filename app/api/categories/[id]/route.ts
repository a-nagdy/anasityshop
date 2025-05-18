import { CategoryData, MongooseError, ValidationError } from '@/app/types/mongoose';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, isAdmin } from '../../../../middleware/authMiddleware';
import connectToDatabase from '../../../../utils/db';
import { deleteFile, uploadFile } from '../../../../utils/fileUpload';
import Category from '../../models/Category';

// Get category by ID
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Check if we're looking up by ID or slug
    const isObjectId = mongoose.Types.ObjectId.isValid(id);

    try {
        await connectToDatabase();

        let category;
        if (isObjectId) {
            category = await Category.findById(id);
        } else {
            // Treat id as slug
            category = await Category.findOne({ slug: id });
        }

        if (!category) {
            return NextResponse.json(
                { message: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error: unknown) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'An error occurred' },
            { status: 500 }
        );
    }
}

// Update category by ID - Admin only
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return authMiddleware(req, async (req, user) => {
        // Check if user is admin
        const adminCheckResult = isAdmin(user);
        if (adminCheckResult) return adminCheckResult;

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { message: 'Invalid category ID format' },
                { status: 400 }
            );
        }

        try {
            await connectToDatabase();

            // Find the category to update
            const category = await Category.findById(id);
            if (!category) {
                return NextResponse.json(
                    { message: 'Category not found' },
                    { status: 404 }
                );
            }

            // Get form data
            const formData = await req.formData();

            // Parse category data
            const updateData: CategoryData = {};

            // Extract fields from formData
            formData.forEach((value, key) => {
                // Skip files
                if (key !== 'image' && !(value instanceof File)) {
                    updateData[key] = value;
                }
            });

            // Handle slug update if name is changed but slug isn't provided
            if (updateData.name && !updateData.slug) {
                updateData.slug = (updateData.name as string)
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }

            // Handle image upload if exists
            const image = formData.get('image') as File;
            if (image) {
                try {
                    // Delete old image if it exists
                    if (category.image && category.imageId) {
                        await deleteFile(category.image, category.imageId);
                    } else if (category.image) {
                        await deleteFile(category.image);
                    }

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
                    updateData.image = uploadResult.url;
                    updateData.imageId = uploadResult.publicId;
                } catch (uploadError: unknown) {
                    return NextResponse.json(
                        { message: uploadError instanceof Error ? uploadError.message : 'An error occurred' },
                        { status: 400 }
                    );
                }
            }

            // Update the category
            const updatedCategory = await Category.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            return NextResponse.json(updatedCategory);
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

// Delete category by ID - Admin only
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return authMiddleware(req, async (req, user) => {
        // Check if user is admin
        const adminCheckResult = isAdmin(user);
        if (adminCheckResult) return adminCheckResult;

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { message: 'Invalid category ID format' },
                { status: 400 }
            );
        }

        try {
            await connectToDatabase();

            // Find the category to delete
            const category = await Category.findById(id);

            if (!category) {
                return NextResponse.json(
                    { message: 'Category not found' },
                    { status: 404 }
                );
            }

            // Check if category has products
            const Product = mongoose.models.Product;
            if (Product) {
                const productsCount = await Product.countDocuments({ category: id });

                if (productsCount > 0) {
                    return NextResponse.json(
                        {
                            message: `Cannot delete category with ${productsCount} products. Remove or reassign products first.`,
                        },
                        { status: 400 }
                    );
                }
            }

            // Delete associated image
            try {
                if (category.image) {
                    await deleteFile(category.image, category.imageId);
                }
            } catch (deleteError: unknown) {
                console.error('Error deleting category image:', deleteError);
                // Continue with category deletion even if image deletion fails
            }

            // Delete the category
            await Category.findByIdAndDelete(id);

            return NextResponse.json(
                { message: 'Category deleted successfully' },
                { status: 200 }
            );
        } catch (error: unknown) {
            return NextResponse.json(
                { message: error instanceof Error ? error.message : 'An error occurred' },
                { status: 500 }
            );
        }
    });
} 