import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        message: "Welcome to Elyana API",
        version: "1.0.0",
        docs: "/api/docs",
    });
} 