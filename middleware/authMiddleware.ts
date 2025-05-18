import { getUserById } from '@/app/api/models/User';
import { User } from '@/app/types/user';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
// Create JWT secret for verification
const createSecretKey = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set');
    }
    return new TextEncoder().encode(secret);
};

// Auth middleware for API routes
export async function authMiddleware(
    req: NextRequest,
    handler: (req: NextRequest, user: User) => Promise<NextResponse>
) {
    try {
        // Get token from authorization header or cookie
        let token;
        const authHeader = req.headers.get('authorization');

        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else {
            const cookieStore = await cookies();
            token = cookieStore.get('adminToken')?.value;
        }

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authorized, no token' },
                { status: 401 }
            );
        }

        // Verify token
        const secretKey = createSecretKey();
        const { payload } = await jwtVerify(token, secretKey);

        if (!payload.id) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        // Get user from database
        const user = await getUserById(payload.id as string);

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Not authorized, user not found' },
                { status: 401 }
            );
        }

        // Call the handler with the user
        return handler(req, user);
    } catch (error) {
        console.error('Auth middleware error:', error);
        return NextResponse.json(
            { success: false, message: 'Not authorized, token failed' },
            { status: 401 }
        );
    }
}

// Admin check middleware
export function isAdmin(user: User) {
    if (user.role !== 'admin' && user.role !== 'super-admin') {
        return NextResponse.json(
            { success: false, message: 'Not authorized as an admin' },
            { status: 403 }
        );
    }
    return null;
}

// Super admin check middleware
export function isSuperAdmin(user: User) {
    if (user.role !== 'super-admin') {
        return NextResponse.json(
            { success: false, message: 'Access denied. Super admin privileges required.' },
            { status: 403 }
        );
    }
    return null;
} 