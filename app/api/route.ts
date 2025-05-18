import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        message: "Welcome to Anasity API",
        version: "1.0.0",
        docs: "/api/docs",
    });
} 