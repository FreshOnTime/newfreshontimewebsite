import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import SubscriptionPlan from '@/lib/models/SubscriptionPlan';

// GET all active subscription plans
export async function GET() {
    try {
        await dbConnect();

        const plans = await SubscriptionPlan.find({ isActive: true })
            .sort({ price: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            plans,
        });
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch subscription plans' },
            { status: 500 }
        );
    }
}

// POST create a new subscription plan (admin only)
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();

        // Generate slug from name
        const slug = body.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const plan = await SubscriptionPlan.create({
            ...body,
            slug,
        });

        return NextResponse.json({
            success: true,
            plan,
        });
    } catch (error) {
        console.error('Error creating subscription plan:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create subscription plan' },
            { status: 500 }
        );
    }
}
