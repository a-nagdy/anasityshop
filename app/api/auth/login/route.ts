import { NextRequest, NextResponse } from 'next/server';
import { Validator } from '../../../../utils/validation';
import { rateLimiters } from '../../../../middleware/rateLimiting';
import { ApiResponseHelper } from '../../../../utils/apiResponse';
import connectToDatabase from '../../../../utils/db';
import { comparePassword, createToken, getUserByEmail, setTokenCookie } from '../../models/User';

export async function POST(req: NextRequest) {
    return rateLimiters.auth(req, async (req) => {
        try {
            await connectToDatabase();

            const { email, password } = await req.json();
            const sanitizedEmail = Validator.sanitizeInput(email) as string || '';
            const sanitizedPassword = password ? password.trim() : '';

            if (!sanitizedEmail || !sanitizedPassword) {
                return NextResponse.json(
                    ApiResponseHelper.validationError({
                        email: !sanitizedEmail ? 'Email is required' : '',
                        password: !sanitizedPassword ? 'Password is required' : ''
                    }),
                    { status: 400 }
                );
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
                return NextResponse.json(
                    ApiResponseHelper.validationError({
                        email: 'Please provide a valid email address'
                    }),
                    { status: 400 }
                );
            }

            const user = await getUserByEmail(sanitizedEmail);
            if (!user) {
                return NextResponse.json(
                    ApiResponseHelper.error('Invalid credentials'),
                    { status: 401 }
                );
            }

            const isPasswordValid = await comparePassword(sanitizedPassword, user.password);
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