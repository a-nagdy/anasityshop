import { NextRequest, NextResponse } from 'next/server';

interface RateLimitOptions {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Max requests per window
    message?: string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

class MemoryRateLimitStore {
    private store: RateLimitStore = {};
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // Cleanup expired entries every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }

    hit(key: string, windowMs: number): { count: number; resetTime: number } {
        const now = Date.now();
        const resetTime = now + windowMs;

        if (!this.store[key] || this.store[key].resetTime <= now) {
            this.store[key] = {
                count: 1,
                resetTime
            };
        } else {
            this.store[key].count++;
        }

        return this.store[key];
    }

    get(key: string): { count: number; resetTime: number } | null {
        const entry = this.store[key];
        if (!entry || entry.resetTime <= Date.now()) {
            return null;
        }
        return entry;
    }

    reset(key: string): void {
        delete this.store[key];
    }

    private cleanup(): void {
        const now = Date.now();
        for (const key in this.store) {
            if (this.store[key].resetTime <= now) {
                delete this.store[key];
            }
        }
    }

    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.store = {};
    }
}

const rateLimitStore = new MemoryRateLimitStore();

export function createRateLimiter(options: RateLimitOptions) {
    const {
        windowMs,
        maxRequests,
        message = 'Too many requests, please try again later.',
        skipSuccessfulRequests = false,
    } = options;

    return async function rateLimitMiddleware(
        req: NextRequest,
        handler: (req: NextRequest) => Promise<NextResponse>
    ): Promise<NextResponse> {
        // Generate key based on IP address and optionally user ID
        const ip = getClientIP(req);
        const userId = req.headers.get('user-id') || '';
        const key = `${ip}:${userId}:${req.nextUrl.pathname}`;

        // Check current rate limit status
        const current = rateLimitStore.get(key);
        const now = Date.now();

        if (current && current.count >= maxRequests) {
            const retryAfter = Math.ceil((current.resetTime - now) / 1000);

            return NextResponse.json(
                {
                    success: false,
                    message,
                    retryAfter
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': maxRequests.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': current.resetTime.toString(),
                        'Retry-After': retryAfter.toString()
                    }
                }
            );
        }

        // Execute the handler
        const response = await handler(req);
        const shouldCount = !skipSuccessfulRequests || response.status >= 400;

        if (shouldCount) {
            // Record the hit
            const hit = rateLimitStore.hit(key, windowMs);
            const remaining = Math.max(0, maxRequests - hit.count);

            // Add rate limit headers to response
            response.headers.set('X-RateLimit-Limit', maxRequests.toString());
            response.headers.set('X-RateLimit-Remaining', remaining.toString());
            response.headers.set('X-RateLimit-Reset', hit.resetTime.toString());
        }

        return response;
    };
}

// Predefined rate limiters for different use cases
export const rateLimiters = {
    // Strict rate limiting for authentication endpoints
    auth: createRateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5, // 5 attempts per 15 minutes
        message: 'Too many authentication attempts. Please try again in 15 minutes.'
    }),

    // Moderate rate limiting for API endpoints
    api: createRateLimiter({
        windowMs: 1 * 60 * 1000, // 1 minute
        maxRequests: 100, // 100 requests per minute
        message: 'Too many API requests. Please slow down.'
    }),

    // Lenient rate limiting for public endpoints
    public: createRateLimiter({
        windowMs: 1 * 60 * 1000, // 1 minute
        maxRequests: 200, // 200 requests per minute
        message: 'Too many requests. Please try again shortly.'
    }),

    // Very strict for sensitive operations
    sensitive: createRateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 3, // 3 attempts per hour
        message: 'Too many attempts for this sensitive operation. Please try again in an hour.'
    }),

    // Upload rate limiting
    upload: createRateLimiter({
        windowMs: 1 * 60 * 1000, // 1 minute
        maxRequests: 10, // 10 uploads per minute
        message: 'Too many uploads. Please wait before uploading again.'
    })
};

// Helper function to get client IP
export function getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const real = req.headers.get('x-real-ip');
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    if (real) {
        return real;
    }
    if (ip) {
        return ip;
    }
    return 'unknown';
}

// Advanced rate limiting with different tiers based on user type
export function createTieredRateLimiter(baseLimiter: RateLimitOptions) {
    return async function tieredRateLimitMiddleware(
        req: NextRequest,
        handler: (req: NextRequest) => Promise<NextResponse>
    ): Promise<NextResponse> {
        // Get user role from JWT or headers
        const userRole = req.headers.get('user-role') || 'guest';

        // Adjust limits based on user role
        const adjustedOptions = { ...baseLimiter };

        switch (userRole) {
            case 'super-admin':
                adjustedOptions.maxRequests *= 10; // 10x limit for super admins
                break;
            case 'admin':
                adjustedOptions.maxRequests *= 5; // 5x limit for admins
                break;
            case 'customer':
                adjustedOptions.maxRequests *= 2; // 2x limit for registered users
                break;
            default:
                // Use base limits for guests
                break;
        }

        const rateLimiter = createRateLimiter(adjustedOptions);
        return rateLimiter(req, handler);
    };
} 