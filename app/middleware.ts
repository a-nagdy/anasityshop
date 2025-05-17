import { getJwtSecretKey } from '@/utils/auth';
import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
    // Get the pathname of the request
    const path = request.nextUrl.pathname;

    // Skip middleware for these paths
    if (!path.startsWith('/admin') || path === '/admin') {
        return NextResponse.next();
    }

    // Get the token from the cookies
    const token = request.cookies.get('auth_token')?.value;

    // For admin routes, check if token exists and is valid
    if (path.startsWith('/admin/') && path !== '/admin') {
        // If no token exists, let the client handle the redirect
        if (!token) {
            return NextResponse.next();
        }

        try {
            // Verify and decode the token to check user role
            const secretKey = await getJwtSecretKey();
            const { payload } = await jwtVerify(token, secretKey);

            // Check if the user has admin privileges
            const userRole = payload.role as string;

            if (userRole !== 'admin' && userRole !== 'super-admin') {
                // Redirect non-admin users to the home page
                return NextResponse.redirect(new URL('/', request.url));
            }

            // Allow access for admin users
            return NextResponse.next();
        } catch (error) {
            // If token is invalid or expired, let the client handle it
            console.error('Token verification failed:', error);
            return NextResponse.next();
        }
    }

    // Default behavior: continue
    return NextResponse.next();
}

// Define which paths this middleware should run on
export const config = {
    matcher: [
        '/admin/:path*'
    ],
}; 