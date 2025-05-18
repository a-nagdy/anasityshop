import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, isAdmin } from '../../../../middleware/authMiddleware';
import connectToDatabase from '../../../../utils/db';
import { deleteFile, uploadFile } from '../../../../utils/fileUpload';
import Category from '../../models/Category';

// Get category by ID
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

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
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }
}

// Update category by ID - Admin only
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return authMiddleware(req, async (req, user) => {
        // Check if user is admin
        const adminCheckResult = isAdmin(user);
        if (adminCheckResult) return adminCheckResult;

        const { id } = params;

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
            const updateData: any = {};

            // Extract fields from formData
            formData.forEach((value, key) => {
                // Skip files
                if (key !== 'image' && !(value instanceof File)) {
                    updateData[key] = value;
                }
            });

            // Handle slug update if name is changed but slug isn't provided
            if (updateData.name && !updateData.slug) {
                updateData.slug = updateData.name
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

                    const uploadResult = await uploadFile(image, 'categories');
                    updateData.image = uploadResult.url;
                    updateData.imageId = uploadResult.publicId;
                } catch (uploadError: any) {
                    return NextResponse.json(
                        { message: uploadError.message },
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

            return NextResponse.json(
                { message: error.message },
                { status: 500 }
            );
        }
    });
}

// Delete category by ID - Admin only
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return authMiddleware(req, async (req, user) => {
        // Check if user is admin
        const adminCheckResult = isAdmin(user);
        if (adminCheckResult) return adminCheckResult;

        const { id } = params;

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
            } catch (deleteError: any) {
                console.error('Error deleting category image:', deleteError);
                // Continue with category deletion even if image deletion fails
            }

            // Delete the category
            await Category.findByIdAndDelete(id);

            return NextResponse.json(
                { message: 'Category deleted successfully' },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { message: error.message },
                { status: 500 }
            );
        }
    });
} 