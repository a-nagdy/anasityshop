import { NextRequest, NextResponse } from 'next/server';
import { rateLimiters } from '../../../../middleware/rateLimiting';
import { ApiResponseHelper } from '../../../../utils/apiResponse';
import connectToDatabase from '../../../../utils/db';
import { comparePassword, createToken, getUserByEmail, setTokenCookie } from '../../models/User';

export async function POST(req: NextRequest) {
    return rateLimiters.auth(req, async (req) => {
        try {
            await connectToDatabase();

            // Get request body
            const { email, password } = await req.json();

            // Check if email and password are provided
            if (!email || !password) {
                return NextResponse.json(
                    ApiResponseHelper.validationError({
                        email: !email ? 'Email is required' : '',
                        password: !password ? 'Password is required' : ''
                    }),
                    { status: 400 }
                );
            }

            // Validate email format
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return NextResponse.json(
                    ApiResponseHelper.validationError({
                        email: 'Please provide a valid email address'
                    }),
                    { status: 400 }
                );
            }

            // Find user by email
            const user = await getUserByEmail(email);
            if (!user) {
                return NextResponse.json(
                    ApiResponseHelper.error('Invalid credentials'),
                    { status: 401 }
                );
            }

            // Verify password
            const isPasswordValid = await comparePassword(password, user.password);
            if (!isPasswordValid) {
                return NextResponse.json(
                    ApiResponseHelper.error('Invalid credentials'),
                    { status: 401 }
                );
            }

            // Check if user is active
            if (!user.active) {
                return NextResponse.json(
                    ApiResponseHelper.error('Your account is inactive. Please contact support.'),
                    { status: 401 }
                );
            }

            // Generate JWT token
            const token = await createToken(user._id.toString());

            // Remove password from response
            const userObj = user.toObject();
            delete userObj.password;

            // Create response
            const response = NextResponse.json(
                ApiResponseHelper.success(
                    { user: userObj, token },
                    'Login successful'
                )
            );

            // Set cookie for admin users
            if (user.role === 'admin' || user.role === 'super-admin') {
                setTokenCookie(response, token);
            }

            return response;
        } catch (error: unknown) {
            console.error('Login error:', error);
            return NextResponse.json(
                ApiResponseHelper.serverError(
                    error instanceof Error ? error.message : 'Login failed'
                ),
                { status: 500 }
            );
        }
    });
} 