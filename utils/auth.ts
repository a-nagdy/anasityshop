import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function getJwtSecretKey() {
    // In a real app, this would be an environment variable
    return new TextEncoder().encode(
        process.env.JWT_SECRET || 'your-secret-key-at-least-32-chars-long'
    );
}

export async function verifyAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return { isAuthenticated: false };
    }

    try {
        const secretKey = await getJwtSecretKey();
        const { payload } = await jwtVerify(token, secretKey);

        return {
            isAuthenticated: true,
            user: payload,
        };
    } catch (error) {
        console.error('Auth verification error:', error);
        return { isAuthenticated: false };
    }
}

export async function isAdmin() {
    const { isAuthenticated, user } = await verifyAuth();

    if (!isAuthenticated || !user) {
        return false;
    }

    const role = user.role as string;
    return role === 'admin' || role === 'super-admin';
}

export async function getUser() {
    const { isAuthenticated, user } = await verifyAuth();

    if (!isAuthenticated || !user) {
        return null;
    }

    return user;
} 