import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { advanceByFrequency, nextWeekday, serializeSubscription } from '@/lib/subscriptionUtils';

// GET single subscription (owner only)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { id, userId: user.mongoId },
      include: { plan: { include: { contents: true } } },
    });

    if (!subscription) {
      return NextResponse.json({ success: false, message: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, subscription: serializeSubscription(subscription) });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch subscription' }, { status: 500 });
  }
}

// PATCH update subscription (pause, resume, cancel, skip) — owner only, with
// state-transition guards so subscriber counts can't drift.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, pauseUntil, cancelReason } = body;

    const subscription = await prisma.subscription.findFirst({
      where: { id, userId: user.mongoId },
      include: { plan: true },
    });
    if (!subscription) {
      return NextResponse.json({ success: false, message: 'Subscription not found' }, { status: 404 });
    }

    const day = subscription.deliverySlotDay;
    const frequency = subscription.plan.frequency;

    const invalidTransition = (msg: string) =>
      NextResponse.json({ success: false, message: msg }, { status: 400 });

    switch (action) {
      case 'pause': {
        if (subscription.status !== 'active') return invalidTransition('Only active subscriptions can be paused');
        await prisma.subscription.update({
          where: { id },
          data: { status: 'paused', pausedUntil: pauseUntil ? new Date(pauseUntil) : null },
        });
        break;
      }

      case 'resume': {
        if (subscription.status !== 'paused') return invalidTransition('Only paused subscriptions can be resumed');
        // Respect pausedUntil: don't schedule a delivery before the pause ends.
        const now = new Date();
        const base = subscription.pausedUntil && subscription.pausedUntil > now ? subscription.pausedUntil : now;
        await prisma.subscription.update({
          where: { id },
          data: { status: 'active', pausedUntil: null, nextDeliveryDate: nextWeekday(base, day) },
        });
        break;
      }

      case 'cancel': {
        if (subscription.status === 'cancelled') return invalidTransition('Subscription is already cancelled');
        // Cancel and decrement the plan's counter atomically; the conditional
        // decrement (currentSubscribers > 0) prevents it going negative.
        await prisma.$transaction([
          prisma.subscription.update({
            where: { id },
            data: { status: 'cancelled', cancelledAt: new Date(), cancelReason: cancelReason || null },
          }),
          prisma.subscriptionPlan.updateMany({
            where: { id: subscription.planId, currentSubscribers: { gt: 0 } },
            data: { currentSubscribers: { decrement: 1 } },
          }),
        ]);
        break;
      }

      case 'skip': {
        if (subscription.status !== 'active') return invalidTransition('Only active subscriptions can skip a delivery');
        await prisma.subscription.update({
          where: { id },
          data: {
            skippedDates: { push: subscription.nextDeliveryDate },
            skippedDeliveries: { increment: 1 },
            nextDeliveryDate: advanceByFrequency(subscription.nextDeliveryDate, day, frequency),
          },
        });
        break;
      }

      default:
        return invalidTransition('Invalid action');
    }

    const updated = await prisma.subscription.findUnique({
      where: { id },
      include: { plan: { include: { contents: true } } },
    });

    return NextResponse.json({
      success: true,
      subscription: updated ? serializeSubscription(updated) : null,
      message: `Subscription ${action} successful`,
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ success: false, message: 'Failed to update subscription' }, { status: 500 });
  }
}
