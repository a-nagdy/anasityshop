import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, isAdmin } from '../../../../middleware/authMiddleware';
import connectToDatabase from '../../../../utils/db';
import { deleteFile, uploadFile } from '../../../../utils/fileUpload';
import { MongooseError, ProductData, ValidationError } from '../../../types/mongoose';
import Product from '../../models/Product';
// Get product by ID
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
            { message: 'Invalid product ID format' },
            { status: 400 }
        );
    }

    try {
        await connectToDatabase();
        const product = await Product.findById(id).populate('category', 'name');

        if (!product) {
            return NextResponse.json(
                { message: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
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

            // Get form data
            const formData = await req.formData();

            // Parse product data
            const updateData: ProductData = {};

            // Extract fields from formData
            formData.forEach((value, key) => {
                // Skip files and special fields
                if (
                    key !== 'image' &&
                    key !== 'images' &&
                    key !== 'removeImages' &&
                    !(value instanceof File)
                ) {
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

            // Handle main image upload
            const mainImage = formData.get('image') as File;
            if (mainImage) {
                try {
                    // Delete old image if it exists
                    if (product.image && product.imageId) {
                        await deleteFile(product.image, product.imageId);
                    } else if (product.image) {
                        await deleteFile(product.image);
                    }

                    // Convert File to FileBuffer
                    const arrayBuffer = await mainImage.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const fileBuffer = {
                        buffer,
                        mimetype: mainImage.type,
                        name: mainImage.name,
                        file: mainImage
                    };

                    const uploadResult = await uploadFile(fileBuffer, 'products');
                    updateData.image = uploadResult.url;
                    updateData.imageId = uploadResult.publicId;
                } catch (uploadError: unknown) {
                    return NextResponse.json(
                        { message: uploadError instanceof Error ? uploadError.message : 'An error occurred' },
                        { status: 400 }
                    );
                }
            }

            // Handle image removal if specified
            const removeImages = formData.getAll('removeImages');
            if (removeImages && removeImages.length > 0) {
                const imagesToRemove = removeImages.map(item => item.toString());
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

                // Delete the files
                for (const imgPath of imagesToRemove) {
                    const imgId = imageMap[imgPath];
                    await deleteFile(imgPath, imgId);
                    if (imgId) imageIdsToRemove.push(imgId);
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
            }

            // Handle new additional images
            const additionalImages = formData.getAll('images');
            if (additionalImages && additionalImages.length > 0) {
                try {
                    const uploadResults = await Promise.all(
                        additionalImages.map(async (file) => {
                            if (file instanceof File) {
                                const arrayBuffer = await file.arrayBuffer();
                                const buffer = Buffer.from(arrayBuffer);
                                const fileBuffer = {
                                    buffer,
                                    mimetype: file.type,
                                    name: file.name,
                                    file
                                };
                                return uploadFile(fileBuffer, 'products');
                            }
                            throw new Error('Invalid file type');
                        })
                    );

                    // Merge with existing images or create new arrays
                    updateData.images = [
                        ...(updateData.images || product.images || []),
                        ...uploadResults.map(result => result.url)
                    ];

                    updateData.imageIds = [
                        ...(updateData.imageIds || product.imageIds || []),
                        ...uploadResults.map(result => result.publicId)
                    ];
                } catch (uploadError: unknown) {
                    return NextResponse.json(
                        { message: uploadError instanceof Error ? uploadError.message : 'An error occurred' },
                        { status: 400 }
                    );
                }
            }

            // Parse JSON strings if they exist
            if (typeof updateData.color === 'string') {
                try {
                    updateData.color = JSON.parse(updateData.color);
                } catch {
                    // If it's not valid JSON, treat it as a single value
                    updateData.color = [updateData.color as string];
                }
            }

            if (typeof updateData.size === 'string') {
                try {
                    updateData.size = JSON.parse(updateData.size);
                } catch {
                    // If it's not valid JSON, treat it as a single value
                    updateData.size = [updateData.size as string];
                }
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