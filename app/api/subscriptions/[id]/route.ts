import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const actionSchema = z.object({
  action: z.enum(['pause', 'resume', 'cancel', 'skip']),
  pauseUntil: z.string().datetime({ offset: true }).optional(),
  cancelReason: z.string().trim().max(500).optional(),
});
class SubscriptionConflict extends Error {}
import { verifyToken } from '@/lib/auth';
import { advanceByFrequency, nextWeekday, serializeSubscription } from '@/lib/subscriptionUtils';

// GET single subscription (owner only)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await verifyToken(request);
    if (!user?.mongoId) {
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
    if (!user?.mongoId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const parsed = actionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ success: false, message: 'Invalid subscription action' }, { status: 400 });
    const { action, pauseUntil, cancelReason } = parsed.data;

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

    const data: Prisma.SubscriptionUpdateManyMutationInput = {};
    switch (action) {
      case 'pause':
        if (subscription.status !== 'active') return invalidTransition('Only active subscriptions can be paused');
        if (pauseUntil && new Date(pauseUntil) <= new Date()) return invalidTransition('Pause end must be in the future');
        data.status = 'paused';
        data.pausedUntil = pauseUntil ? new Date(pauseUntil) : null;
        break;
      case 'resume': {
        if (subscription.status !== 'paused') return invalidTransition('Only paused subscriptions can be resumed');
        const now = new Date();
        // Explicit resume ends the pause now, even when a later auto-resume
        // date was saved. A future subscription start still remains binding.
        const base = subscription.startDate > now ? subscription.startDate : now;
        data.status = 'active';
        data.pausedUntil = null;
        data.nextDeliveryDate = nextWeekday(base, day);
        break;
      }
      case 'cancel':
        if (subscription.status === 'cancelled') return invalidTransition('Subscription is already cancelled');
        data.status = 'cancelled';
        data.cancelledAt = new Date();
        data.cancelReason = cancelReason || null;
        break;
      case 'skip':
        if (subscription.status !== 'active') return invalidTransition('Only active subscriptions can skip a delivery');
        data.skippedDates = { push: subscription.nextDeliveryDate };
        data.skippedDeliveries = { increment: 1 };
        data.nextDeliveryDate = advanceByFrequency(subscription.nextDeliveryDate, day, frequency);
        break;
    }

    await prisma.$transaction(async (tx) => {
      // Compare status, date, and version to reject overlapping pause/skip/cancel
      // actions without advancing twice or decrementing the plan twice.
      const changed = await tx.subscription.updateMany({
        where: { id, userId: user.mongoId, status: subscription.status,
          nextDeliveryDate: subscription.nextDeliveryDate, updatedAt: subscription.updatedAt },
        data,
      });
      if (changed.count !== 1) throw new SubscriptionConflict();
      if (action === 'cancel') {
        await tx.subscriptionPlan.updateMany({
          where: { id: subscription.planId, currentSubscribers: { gt: 0 } },
          data: { currentSubscribers: { decrement: 1 } },
        });
      }
    });

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
    if (error instanceof SubscriptionConflict) return NextResponse.json({ success: false, message: 'This subscription changed. Refresh it before trying again.' }, { status: 409 });
    console.error('Error updating subscription:', error);
    return NextResponse.json({ success: false, message: 'Failed to update subscription' }, { status: 500 });
  }
}
