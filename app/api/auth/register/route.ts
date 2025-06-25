import { NextRequest, NextResponse } from 'next/server';
import { ApiResponseHelper } from '../../../../utils/apiResponse';
import connectToDatabase from '../../../../utils/db';
import { Validator } from '../../../../utils/validation';
import User, { hashPassword } from '../../models/User';

// Registration validation schema
const registrationSchema = {
    firstName: { required: true, type: 'string' as const, min: 2, max: 50 },
    lastName: { required: true, type: 'string' as const, min: 2, max: 50 },
    email: { required: true, type: 'email' as const },
    password: { required: true, type: 'string' as const, min: 8, max: 128 },
    phone: { type: 'string' as const, min: 10, max: 20 },
    role: { type: 'string' as const }
};

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        // Get and sanitize request body
        const rawData = await req.json();
        const data = Validator.sanitizeInput(rawData) as {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
            phone?: string;
            role?: string;
        };

        // Validate input data
        const { isValid, errors } = Validator.validate(data, registrationSchema);
        if (!isValid) {
            return NextResponse.json(
                ApiResponseHelper.validationError(errors),
                { status: 400 }
            );
        }

        // Enhanced password validation
        const passwordValidation = Validator.validatePassword(data.password as string);
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                ApiResponseHelper.validationError({
                    password: passwordValidation.errors.join(', ')
                }),
                { status: 400 }
            );
        }

        // Additional email validation
        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email as string)) {
            return NextResponse.json(
                ApiResponseHelper.validationError({
                    email: 'Please provide a valid email address'
                }),
                { status: 400 }
            );
        }

        // Check if user with this email already exists (case-insensitive)
        const existingUser = await User.findOne({
            email: { $regex: new RegExp(`^${data.email as string}$`, 'i') }
        });
        if (existingUser) {
            return NextResponse.json(
                ApiResponseHelper.error('Email already in use'),
                { status: 409 }
            );
        }

        // Security: Prevent privilege escalation
        const allowedRoles = ['customer'];
        if (data.role && !allowedRoles.includes(data.role as string)) {
            data.role = 'customer';
        }

        // Hash password with stronger hashing
        const hashedPassword = await hashPassword(data.password as string);

        // Create user with validated and sanitized data
        const newUser = await User.create({
            firstName: data.firstName as string,
            lastName: data.lastName as string,
            email: (data.email as string).toLowerCase(),
            password: hashedPassword,
            phone: data.phone as string || '',
            role: data.role as string || 'customer',
            active: true,
            verified: false
        });

        // Remove sensitive data from response
        const userResponse = {
            _id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
            active: newUser.active,
            verified: newUser.verified,
            createdAt: newUser.createdAt
        };

        return NextResponse.json(
            ApiResponseHelper.success(userResponse, 'User registered successfully'),
            { status: 201 }
        );

    } catch (error: unknown) {
        console.error('Registration error:', error);

        // Handle validation errors
        if (error instanceof Error && error.name === 'ValidationError') {
            const mongooseError = error as Error & { errors: Record<string, { message: string }> };
            const errors: Record<string, string> = {};

            Object.keys(mongooseError.errors).forEach((field) => {
                errors[field] = mongooseError.errors[field].message;
            });

            return NextResponse.json(
                ApiResponseHelper.validationError(errors),
                { status: 400 }
            );
        }

        // Handle duplicate key errors
        if (error instanceof Error && 'code' in error && (error as Error & { code: number }).code === 11000) {
            const duplicateError = error as Error & { code: number; keyPattern?: Record<string, unknown> };
            const field = Object.keys(duplicateError.keyPattern || {})[0];
            return NextResponse.json(
                ApiResponseHelper.error(`${field} already exists`),
                { status: 409 }
            );
        }

        return NextResponse.json(
            ApiResponseHelper.serverError('Registration failed'),
            { status: 500 }
        );
    }
} 