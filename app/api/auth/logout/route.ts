import { NextResponse } from 'next/server';

export async function POST() {
    // Create a response
    const response = NextResponse.json(
        { message: 'Logged out successfully' },
        { status: 200 }
    );

    // Clear the admin token cookie
    response.cookies.delete('adminToken');

    return response;
} 