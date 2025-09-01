import { User } from '@/app/types/user';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, isAdmin } from '../../../../middleware/authMiddleware';
import { getInitializationStatus, reinitializeOptimizations } from '../../../../utils/initOptimizations';

export async function POST(req: NextRequest) {
    return authMiddleware(req, async (_req, user: User) => {
        // Check if user is admin
        const adminCheck = isAdmin(user);
        if (adminCheck) return adminCheck;

        // Get current status
        const currentStatus = getInitializationStatus();
        // Reinitialize optimizations
        const result = await reinitializeOptimizations();
        return NextResponse.json({
            success: result.success,
            message: result.message,
            previousStatus: currentStatus,
            newStatus: getInitializationStatus()
        });
    });
}

export async function GET(req: NextRequest) {
    return authMiddleware(req, async (_req, user: User) => {
        // Check if user is admin
        const adminCheck = isAdmin(user);
        if (adminCheck) return adminCheck;

        // Get current initialization status
        const status = getInitializationStatus();
        return NextResponse.json({
            success: true,
            status,
            timestamp: new Date().toISOString()
        });
    });
} 