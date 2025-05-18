import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../../../middleware/authMiddleware';

export function GET(req: NextRequest) {
    return authMiddleware(req, async (req, user) => {
        return NextResponse.json(user);
    });
} 