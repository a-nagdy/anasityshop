import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../../../middleware/authMiddleware';
import connectToDatabase from '../../../../utils/db';
import Address from '../../models/Address';

// Get address by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    return authMiddleware(request, async (req, user) => {
        try {
            // Check if ID is valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { message: 'Invalid address ID format' },
                    { status: 400 }
                );
            }

            await connectToDatabase();

            // Find address by ID
            const address = await Address.findById(id);

            if (!address) {
                return NextResponse.json(
                    { message: 'Address not found' },
                    { status: 404 }
                );
            }

            // Check if user is authorized to view this address
            if (address.user.toString() !== user._id.toString()) {
                return NextResponse.json(
                    { message: 'Not authorized to view this address' },
                    { status: 403 }
                );
            }

            return NextResponse.json(address);
        } catch (error) {
            console.error('Error fetching address:', error);
            return NextResponse.json(
                { message: error instanceof Error ? error.message : 'An error occurred' },
                { status: 500 }
            );
        }
    });
}

// Update address
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return authMiddleware(request, async (req, user) => {
        try {
            // Check if ID is valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { message: 'Invalid address ID format' },
                    { status: 400 }
                );
            }

            await connectToDatabase();

            // Find address by ID
            const address = await Address.findById(id);

            if (!address) {
                return NextResponse.json(
                    { message: 'Address not found' },
                    { status: 404 }
                );
            }

            // Check if user is authorized to update this address
            if (address.user.toString() !== user._id.toString()) {
                return NextResponse.json(
                    { message: 'Not authorized to update this address' },
                    { status: 403 }
                );
            }

            // Get update data from request
            const updateData = await req.json();

            // Prevent changing the user
            delete updateData.user;

            // Update address
            const updatedAddress = await Address.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            return NextResponse.json(updatedAddress);
        } catch (error) {
            console.error('Error updating address:', error);

            // Handle validation errors
            if (error instanceof Error && error.name === 'ValidationError') {
                const validationErrors: Record<string, string> = {};

                // Extract validation error messages
                Object.entries((error as unknown as { errors: Record<string, { message: string }> }).errors).forEach(([field, error]) => {
                    validationErrors[field] = error.message;
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

// Delete address
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return authMiddleware(request, async (req, user) => {
        try {
            // Check if ID is valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { message: 'Invalid address ID format' },
                    { status: 400 }
                );
            }

            await connectToDatabase();

            // Find address by ID
            const address = await Address.findById(id);

            if (!address) {
                return NextResponse.json(
                    { message: 'Address not found' },
                    { status: 404 }
                );
            }

            // Check if user is authorized to delete this address
            if (address.user.toString() !== user._id.toString()) {
                return NextResponse.json(
                    { message: 'Not authorized to delete this address' },
                    { status: 403 }
                );
            }

            // Check if this is the only address and it's marked as default
            if (address.isDefault) {
                const addressCount = await Address.countDocuments({ user: user._id });

                // If this is the last address, allow deletion
                if (addressCount > 1) {
                    // Find another address to set as default
                    const anotherAddress = await Address.findOne({
                        user: user._id,
                        _id: { $ne: id },
                    });

                    if (anotherAddress) {
                        anotherAddress.isDefault = true;
                        await anotherAddress.save();
                    }
                }
            }

            // Delete the address
            await Address.findByIdAndDelete(id);

            return NextResponse.json(
                { message: 'Address deleted successfully' },
                { status: 200 }
            );
        } catch (error) {
            console.error('Error deleting address:', error);
            return NextResponse.json(
                { message: error instanceof Error ? error.message : 'An error occurred' },
                { status: 500 }
            );
        }
    });
} 