import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/authNew';
import User from '@/lib/models/User';
import { z } from 'zod';

const addressSchema = z.object({
    recipientName: z.string().min(1, 'Recipient name is required').max(80),
    streetAddress: z.string().min(1, 'Street address is required').max(100),
    streetAddress2: z.string().max(100).optional(),
    town: z.string().min(1, 'Town is required').max(100),
    city: z.string().min(1, 'City is required').max(100),
    state: z.string().min(1, 'State is required').max(100),
    postalCode: z.string().min(1, 'Postal code is required').max(100),
    countryCode: z.string().length(2).default('LK'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    type: z.enum(['Home', 'Business', 'School', 'Other']),
});

async function getAddresses(req: AuthenticatedRequest) {
    try {
        if (!req.user) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        const user = await User.findOne({ userId: req.user.userId });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ addresses: user.addresses || [] }, { status: 200 });
    } catch (error) {
        console.error('Error fetching addresses:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function addAddress(req: AuthenticatedRequest) {
    try {
        if (!req.user) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        const body = await req.json();
        const result = addressSchema.safeParse(body);

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

        user.addresses.push(result.data);
        await user.save();

        return NextResponse.json(
            { message: 'Address added successfully', addresses: user.addresses },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error adding address:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const GET = withAuth(getAddresses);
export const POST = withAuth(addAddress);
