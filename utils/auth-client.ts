// Client-side authentication utilities

/**
 * Get auth token from cookies (client-side only)
 */
export function getAuthToken(): string | null {
    if (typeof document === 'undefined') {
        return null; // Server-side, can't access document.cookie
    }

    // Try to get from document.cookie directly
    const match = document.cookie.match(/auth_token=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : null;

    console.log('getAuthToken result:', token ? 'Token found' : 'No token');
    return token;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    const token = getAuthToken();
    return !!token;
}

/**
 * Create authorization header
 */
export function getAuthHeader(): Record<string, string> {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Remove auth token (logout)
 */
export function removeAuthToken(): void {
    if (typeof document !== 'undefined') {
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
} 