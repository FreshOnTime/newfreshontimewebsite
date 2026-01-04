import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/authNew';
import User from '@/lib/models/User';
import { z } from 'zod';
import mongoose from 'mongoose';

const addressUpdateSchema = z.object({
    recipientName: z.string().min(1).max(80).optional(),
    streetAddress: z.string().min(1).max(100).optional(),
    streetAddress2: z.string().max(100).optional(),
    town: z.string().min(1).max(100).optional(),
    city: z.string().min(1).max(100).optional(),
    state: z.string().min(1).max(100).optional(),
    postalCode: z.string().min(1).max(100).optional(),
    countryCode: z.string().length(2).optional(),
    phoneNumber: z.string().min(1).optional(),
    type: z.enum(['Home', 'Business', 'School', 'Other']).optional(),
});

async function updateAddress(req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!req.user) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid address ID' }, { status: 400 });
        }

        const body = await req.json();
        const result = addressUpdateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: result.error.errors },
                { status: 400 }
            );
        }

        const user = await User.findOne({ userId: req.user.userId });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const address = user.addresses.id(id);
        if (!address) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        // Update fields
        Object.assign(address, result.data);
        await user.save();

        return NextResponse.json(
            { message: 'Address updated successfully', addresses: user.addresses },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating address:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function deleteAddress(req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!req.user) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid address ID' }, { status: 400 });
        }

        const user = await User.findOne({ userId: req.user.userId });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const addressIndex = user.addresses.findIndex((addr: any) => addr._id.toString() === id);
        if (addressIndex === -1) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        user.addresses.splice(addressIndex, 1);
        await user.save();

        return NextResponse.json(
            { message: 'Address deleted successfully', addresses: user.addresses },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting address:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const PUT = withAuth(updateAddress);
export const DELETE = withAuth(deleteAddress);
