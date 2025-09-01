import { User } from '@/app/types/user';
import { authMiddleware, isAdmin } from '@/middleware/authMiddleware';
import { cache } from '@/utils/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    return authMiddleware(req, async (_req, user: User) => {
        const adminCheck = isAdmin(user);
        if (adminCheck) return adminCheck;
        cache.clear();
        return NextResponse.json({ success: true, message: 'Cache cleared' });
    });
}

export async function GET(req: NextRequest) {
    return authMiddleware(req, async (_req, user: User) => {
        const adminCheck = isAdmin(user);
        if (adminCheck) return adminCheck;
        return NextResponse.json({ success: true, cacheSize: cache.size() });
    });
} 