import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../utils/db';
import { comparePassword, createToken, getUserByEmail, setTokenCookie } from '../../models/User';

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        // Get request body
        const { email, password } = await req.json();

        // Check if email and password are provided
        if (!email || !password) {
            return NextResponse.json(
                { message: 'Please provide email and password' },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await getUserByEmail(email);
        if (!user) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Check if user is active
        if (!user.active) {
            return NextResponse.json(
                { message: 'Your account is inactive. Please contact support.' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = await createToken(user._id.toString());

        // Remove password from response
        const userObj = user.toObject();
        delete userObj.password;

        // Create response
        const response = NextResponse.json({
            user: userObj,
            token,
        });

        // Set cookie for admin users
        if (user.role === 'admin' || user.role === 'super-admin') {
            setTokenCookie(response, token);
        }

        return response;
    } catch (error: unknown) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'An error occurred' },
            { status: 500 }
        );
    }
} 