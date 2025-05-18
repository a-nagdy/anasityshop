import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, isAdmin } from '../../../middleware/authMiddleware';
import connectToDatabase from '../../../utils/db';
import { uploadFile } from '../../../utils/fileUpload';
import Product from '../models/Product';

// Get all products
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const products = await Product.find()
            .populate('category', 'name')
            .skip(skip)
            .limit(limit);

        if (!products || products.length === 0) {
            return NextResponse.json({ message: 'No products found' }, { status: 404 });
        }

        const totalProducts = await Product.countDocuments();
        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts,
        };

        return NextResponse.json({ products, pagination });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
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

            // Get form data
            const formData = await req.formData();

            // Parse product data
            const productData: any = {};

            // Extract fields from formData
            formData.forEach((value, key) => {
                // Skip files
                if (key !== 'image' && key !== 'images' && !(value instanceof File)) {
                    productData[key] = value;
                }
            });

            // Create a slug if not provided
            if (!productData.slug && productData.name) {
                productData.slug = productData.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }

            // Validate category ID if provided
            if (productData.category) {
                if (!mongoose.Types.ObjectId.isValid(productData.category)) {
                    return NextResponse.json(
                        { message: 'Invalid category ID format' },
                        { status: 400 }
                    );
                }
            }

            // Handle main image upload
            const mainImage = formData.get('image') as File;
            if (mainImage) {
                try {
                    const uploadResult = await uploadFile(mainImage, 'products');
                    productData.image = uploadResult.url;
                    productData.imageId = uploadResult.publicId;
                } catch (uploadError: any) {
                    return NextResponse.json(
                        { message: uploadError.message },
                        { status: 400 }
                    );
                }
            }

            // Handle multiple images
            const additionalImages = formData.getAll('images');
            if (additionalImages && additionalImages.length > 0) {
                try {
                    const uploadResults = await Promise.all(
                        additionalImages.map((file: any) => uploadFile(file, 'products'))
                    );

                    productData.images = uploadResults.map(result => result.url);
                    productData.imageIds = uploadResults.map(result => result.publicId);

                    // If main image is missing but we have images, use the first one
                    if (!productData.image && uploadResults.length > 0) {
                        productData.image = uploadResults[0].url;
                        productData.imageId = uploadResults[0].publicId;
                    }
                } catch (uploadError: any) {
                    return NextResponse.json(
                        { message: uploadError.message },
                        { status: 400 }
                    );
                }
            }

            // Parse JSON strings if they exist
            if (typeof productData.color === 'string') {
                try {
                    productData.color = JSON.parse(productData.color);
                } catch (e) {
                    // If it's not valid JSON, treat it as a single value
                    productData.color = [productData.color];
                }
            }

            if (typeof productData.size === 'string') {
                try {
                    productData.size = JSON.parse(productData.size);
                } catch (e) {
                    // If it's not valid JSON, treat it as a single value
                    productData.size = [productData.size];
                }
            }

            // Create a new product
            const product = await Product.create(productData);
            return NextResponse.json(product, { status: 201 });

        } catch (error: any) {
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

            return NextResponse.json({ message: error.message }, { status: 500 });
        }
    });
} 