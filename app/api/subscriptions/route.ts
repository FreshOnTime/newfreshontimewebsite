import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Subscription from '@/lib/models/Subscription';
import SubscriptionPlan from '@/lib/models/SubscriptionPlan';
import { verifyToken } from '@/lib/auth';

// GET user's subscriptions
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const subscriptions = await Subscription.find({ user: user.mongoId })
            .populate('plan')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            subscriptions,
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch subscriptions' },
            { status: 500 }
        );
    }
}

// POST create a new subscription
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { planId, deliveryAddress, deliverySlot, paymentMethod, startDate } = body;

        // Validate plan exists
        const plan = await SubscriptionPlan.findById(planId);
        if (!plan || !plan.isActive) {
            return NextResponse.json(
                { success: false, message: 'Invalid subscription plan' },
                { status: 400 }
            );
        }

        // Check if user already has an active subscription to this plan
        const existingSubscription = await Subscription.findOne({
            user: user.mongoId,
            plan: planId,
            status: { $in: ['active', 'pending'] },
        });

        if (existingSubscription) {
            return NextResponse.json(
                { success: false, message: 'You already have an active subscription to this plan' },
                { status: 400 }
            );
        }

        // Calculate next delivery date based on frequency
        const start = new Date(startDate || Date.now());
        let nextDelivery = new Date(start);

        // Find the next delivery day (e.g., Saturday)
        const dayMap: { [key: string]: number } = {
            sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
            thursday: 4, friday: 5, saturday: 6,
        };
        const targetDay = dayMap[deliverySlot.day.toLowerCase()] || 6; // Default Saturday
        while (nextDelivery.getDay() !== targetDay) {
            nextDelivery.setDate(nextDelivery.getDate() + 1);
        }

        const subscription = await Subscription.create({
            user: user.mongoId,
            plan: planId,
            status: 'active',
            startDate: start,
            nextDeliveryDate: nextDelivery,
            deliveryAddress,
            deliverySlot,
            paymentMethod: paymentMethod || 'cod',
        });

        // Increment plan subscriber count
        await SubscriptionPlan.findByIdAndUpdate(planId, {
            $inc: { currentSubscribers: 1 },
        });

        const populatedSubscription = await Subscription.findById(subscription._id)
            .populate('plan')
            .lean();

        return NextResponse.json({
            success: true,
            subscription: populatedSubscription,
            message: 'Subscription created successfully!',
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create subscription' },
            { status: 500 }
        );
    }
}
