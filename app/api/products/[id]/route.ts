import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, isAdmin } from '../../../../middleware/authMiddleware';
import connectToDatabase from '../../../../utils/db';
import { deleteFile } from '../../../../utils/fileUpload';
import { determineProductStatus } from '../../../../utils/productStatus';
import { MongooseError, ProductData, ValidationError } from '../../../types/mongoose';
import Product from '../../models/Product';
// Get product by ID or SKU
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json(
            { message: 'Product ID or SKU is required' },
            { status: 400 }
        );
    }

    try {
        await connectToDatabase();

        let product;

        // Check if it's a valid MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(id)) {
            // Search by ID
            product = await Product.findById(id)
                .populate('category', 'name slug')
                .select({
                    name: 1,
                    sku: 1,
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
                    weight: 1,
                    dimensions: 1,
                    material: 1,
                    warranty: 1,
                    ratings: 1,
                    totalRating: 1,
                    reviewCount: 1,
                    createdAt: 1,
                    active: 1,
                    color: 1,
                    size: 1
                });
        } else {
            // Search by SKU
            product = await Product.findOne({
                sku: id.toLowerCase(),
                active: true,
                status: { $ne: 'draft' }
            })
                .populate('category', 'name slug')
                .select({
                    name: 1,
                    sku: 1,
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
                    weight: 1,
                    dimensions: 1,
                    material: 1,
                    warranty: 1,
                    ratings: 1,
                    totalRating: 1,
                    reviewCount: 1,
                    createdAt: 1,
                    active: 1,
                    color: 1,
                    size: 1
                });
        }

        if (!product) {
            return NextResponse.json(
                { message: 'Product not found' },
                { status: 404 }
            );
        }

        // Add computed fields
        const enrichedProduct = {
            ...product.toObject(),
            finalPrice: product.discountPrice || product.price,
            hasDiscount: Boolean(product.discountPrice),
            discountPercentage: product.discountPrice
                ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                : 0
        };

        return NextResponse.json(enrichedProduct);
    } catch (error: unknown) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'An error occurred' },
            { status: 500 }
        );
    }
}

// Update product by ID - Admin only
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
                { message: 'Invalid product ID format' },
                { status: 400 }
            );
        }

        try {
            await connectToDatabase();

            // Find the product to update
            const product = await Product.findById(id);
            if (!product) {
                return NextResponse.json(
                    { message: 'Product not found' },
                    { status: 404 }
                );
            }

            // Get JSON data
            const updateData: ProductData = await req.json();

            // Handle slug update if name is changed but slug isn't provided
            if (updateData.name && !updateData.slug) {
                updateData.slug = (updateData.name as string)
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }

            // Validate category ID if provided
            if (
                updateData.category &&
                !mongoose.Types.ObjectId.isValid(updateData.category as string)
            ) {
                return NextResponse.json(
                    { message: 'Invalid category ID format' },
                    { status: 400 }
                );
            }

            // With JSON approach, we expect image URLs to be provided directly
            // The actual file upload should be handled by the client using the upload API endpoint

            // Handle image removal if specified in the updateData
            if (updateData.removeImages && Array.isArray(updateData.removeImages) && updateData.removeImages.length > 0) {
                const imagesToRemove = updateData.removeImages;
                const imageIdsToRemove: string[] = [];

                // Build a map of image URLs to their IDs for faster lookup
                const imageMap: Record<string, string> = {};
                if (
                    product.images &&
                    product.imageIds &&
                    product.images.length === product.imageIds.length
                ) {
                    for (let i = 0; i < product.images.length; i++) {
                        imageMap[product.images[i]] = product.imageIds[i];
                    }
                }

                // Delete the files from Cloudinary
                for (const imgPath of imagesToRemove) {
                    const imgId = imageMap[imgPath];
                    if (imgPath) {
                        try {
                            await deleteFile(imgPath, imgId);
                            if (imgId) imageIdsToRemove.push(imgId);
                        } catch (error) {
                            console.error('Error deleting image:', error);
                        }
                    }
                }

                // Update images array
                if (product.images && product.images.length > 0) {
                    updateData.images = product.images.filter(
                        (img: string) => !imagesToRemove.includes(img)
                    );

                    // Also update imageIds array if available
                    if (product.imageIds && product.imageIds.length > 0) {
                        updateData.imageIds = product.imageIds.filter(
                            (id: string) => !imageIdsToRemove.includes(id)
                        );
                    }
                }

                // Remove the removeImages field as it's not part of the Product model
                delete updateData.removeImages;
            }

            // Parse JSON strings if they exist
            // Handle images array
            if (updateData.images) {
                if (typeof updateData.images === 'string') {
                    try {
                        updateData.images = JSON.parse(updateData.images);
                    } catch {
                        updateData.images = updateData.images.split(',').map(img => img.trim());
                    }
                }

                if (Array.isArray(updateData.images)) {
                    updateData.images = updateData.images
                        .filter(img => typeof img === 'string' && img.trim() !== '')
                        .map(img => img.trim());
                } else {
                    updateData.images = [];
                }
            }

            if (typeof updateData.color === 'string' && updateData.color.trim()) {
                updateData.color = updateData.color.split(',').map(item => item.trim()).filter(Boolean);
            } else if (!Array.isArray(updateData.color)) {
                updateData.color = [];
            }

            if (typeof updateData.size === 'string' && updateData.size.trim()) {
                updateData.size = updateData.size.split(',').map(item => item.trim()).filter(Boolean);
            } else if (!Array.isArray(updateData.size)) {
                updateData.size = [];
            }

            // Update product status if quantity is changed
            if (updateData.quantity !== undefined) {
                const active = updateData.active !== undefined ? updateData.active : product.active;

                updateData.status = determineProductStatus(updateData.quantity as number, active as boolean);
            }

            // Update the product with new values
            const updatedProduct = await Product.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            return NextResponse.json(updatedProduct);
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

// Delete product by ID - Admin only
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
                { message: 'Invalid product ID format' },
                { status: 400 }
            );
        }

        try {
            await connectToDatabase();

            // Find the product to delete
            const product = await Product.findById(id);

            if (!product) {
                return NextResponse.json(
                    { message: 'Product not found' },
                    { status: 404 }
                );
            }

            // Delete all associated images
            try {
                // Delete main image
                if (product.image) {
                    await deleteFile(product.image, product.imageId);
                }

                // Delete additional images
                if (product.images && product.images.length > 0) {
                    const deletePromises = product.images.map((imgUrl: string, index: number) => {
                        const imgId = product.imageIds?.[index];
                        return deleteFile(imgUrl, imgId);
                    });

                    await Promise.all(deletePromises);
                }
            } catch (deleteError: unknown) {
                console.error('Error deleting product images:', deleteError);
                // Continue with product deletion even if image deletion fails
            }

            // Delete the product
            await Product.findByIdAndDelete(id);

            return NextResponse.json(
                { message: 'Product deleted successfully' },
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