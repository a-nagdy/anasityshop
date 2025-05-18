import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../../middleware/authMiddleware';
import connectToDatabase from '../../../utils/db';
import Address from '../models/Address';

// Get user's addresses
export function GET(req: NextRequest) {
    return authMiddleware(req, async (req, user) => {
        try {
            await connectToDatabase();

            // Get addresses for the current user
            const addresses = await Address.find({ user: user._id });

            return NextResponse.json(addresses);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            return NextResponse.json(
                { message: error instanceof Error ? error.message : 'An error occurred' },
                { status: 500 }
            );
        }
    });
}

// Create a new address
export function POST(req: NextRequest) {
    return authMiddleware(req, async (req, user) => {
        try {
            await connectToDatabase();

            // Get address data from request
            const addressData = await req.json();

            // Set user ID
            addressData.user = user._id;

            // Create new address
            const address = await Address.create(addressData);

            return NextResponse.json(address, { status: 201 });
        } catch (error) {
            console.error('Error creating address:', error);

            // Handle validation errors
            if (error instanceof Error && error.name === 'ValidationError') {
                const validationErrors: Record<string, string> = {};

                // Extract validation error messages
                Object.entries((error as any).errors).forEach(([field, error]) => {
                    validationErrors[field] = (error as any).message;
                });

                return NextResponse.json(
                    { message: 'Validation error', errors: validationErrors },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { message: error instanceof Error ? error.message : 'An error occurred' },
                { status: 500 }
            );
        }
    });
} 