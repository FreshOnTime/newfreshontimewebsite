import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Subscription from '@/lib/models/Subscription';
import SubscriptionPlan from '@/lib/models/SubscriptionPlan';
import { verifyToken } from '@/lib/auth';

// GET single subscription
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const subscription = await Subscription.findOne({
            _id: id,
            user: user.mongoId,
        })
            .populate('plan')
            .lean();

        if (!subscription) {
            return NextResponse.json(
                { success: false, message: 'Subscription not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            subscription,
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch subscription' },
            { status: 500 }
        );
    }
}

// PATCH update subscription (pause, resume, cancel)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { action, pauseUntil, cancelReason } = body;

        const subscription = await Subscription.findOne({
            _id: id,
            user: user.mongoId,
        });

        if (!subscription) {
            return NextResponse.json(
                { success: false, message: 'Subscription not found' },
                { status: 404 }
            );
        }

        switch (action) {
            case 'pause':
                subscription.status = 'paused';
                subscription.pausedUntil = pauseUntil ? new Date(pauseUntil) : undefined;
                break;

            case 'resume':
                subscription.status = 'active';
                subscription.pausedUntil = undefined;
                // Recalculate next delivery date
                const now = new Date();
                let nextDelivery = new Date(now);
                const dayMap: { [key: string]: number } = {
                    sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
                    thursday: 4, friday: 5, saturday: 6,
                };
                const targetDay = dayMap[subscription.deliverySlot.day.toLowerCase()] || 6;
                while (nextDelivery.getDay() !== targetDay || nextDelivery <= now) {
                    nextDelivery.setDate(nextDelivery.getDate() + 1);
                }
                subscription.nextDeliveryDate = nextDelivery;
                break;

            case 'cancel':
                subscription.status = 'cancelled';
                subscription.cancelledAt = new Date();
                subscription.cancelReason = cancelReason;
                // Decrement plan subscriber count
                await SubscriptionPlan.findByIdAndUpdate(subscription.plan, {
                    $inc: { currentSubscribers: -1 },
                });
                break;

            case 'skip':
                // Skip next delivery
                subscription.skippedDates.push(subscription.nextDeliveryDate);
                subscription.skippedDeliveries += 1;
                // Move to next week
                const skipDate = new Date(subscription.nextDeliveryDate);
                skipDate.setDate(skipDate.getDate() + 7);
                subscription.nextDeliveryDate = skipDate;
                break;

            default:
                return NextResponse.json(
                    { success: false, message: 'Invalid action' },
                    { status: 400 }
                );
        }

        await subscription.save();

        const updatedSubscription = await Subscription.findById(id)
            .populate('plan')
            .lean();

        return NextResponse.json({
            success: true,
            subscription: updatedSubscription,
            message: `Subscription ${action}d successfully`,
        });
    } catch (error) {
        console.error('Error updating subscription:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update subscription' },
            { status: 500 }
        );
    }
}
