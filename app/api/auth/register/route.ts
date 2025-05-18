import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../utils/db';
import User, { hashPassword } from '../../auth/authUtils';

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        // Get request body
        const data = await req.json();

        // Validate email
        if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
            return NextResponse.json(
                { message: 'Please provide a valid email address' },
                { status: 400 }
            );
        }

        // Validate password
        if (!data.password || data.password.length < 6) {
            return NextResponse.json(
                { message: 'Password should be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if user with this email already exists
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return NextResponse.json(
                { message: 'Email already in use' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(data.password);

        // Create user with all provided fields
        const newUser = await User.create({
            ...data,
            password: hashedPassword,
            // Default to customer role unless specified otherwise
            role: data.role || 'customer',
        });

        // Remove password from response
        const userResponse = newUser.toObject();
        delete userResponse.password;

        return NextResponse.json(userResponse, { status: 201 });
    } catch (error: unknown) {
        // Handle validation errors
        if (error instanceof Error && error.name === 'ValidationError') {
            const errors: Record<string, string> = {};
            const mongooseError = error as unknown as { errors: Record<string, { message: string }> };
            // Extract all validation errors
            Object.keys(mongooseError.errors).forEach((field) => {
                errors[field] = mongooseError.errors[field].message;
            });

            return NextResponse.json(
                { message: 'Validation error', errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'An error occurred' },
            { status: 500 }
        );
    }
} 