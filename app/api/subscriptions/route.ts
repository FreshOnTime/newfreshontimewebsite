import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { isValidDeliveryDay, nextWeekday, serializeSubscription } from '@/lib/subscriptionUtils';

// GET user's subscriptions
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: user.mongoId },
      include: { plan: { include: { contents: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions.map(serializeSubscription),
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
    const user = await verifyToken(request);
    if (!user || !user.mongoId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.mongoId;

    const body = await request.json();
    const { planId, deliveryAddress, deliverySlot, paymentMethod, startDate } = body;

    if (!planId || !deliverySlot?.day || !deliveryAddress) {
      return NextResponse.json(
        { success: false, message: 'planId, deliveryAddress and deliverySlot are required' },
        { status: 400 }
      );
    }
    if (typeof deliverySlot.day !== 'string' || !isValidDeliveryDay(deliverySlot.day)) {
      return NextResponse.json({ success: false, message: 'A valid delivery day is required' }, { status: 400 });
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      return NextResponse.json({ success: false, message: 'Invalid subscription plan' }, { status: 400 });
    }

    const start = new Date(startDate || Date.now());
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json({ success: false, message: 'Invalid subscription start date' }, { status: 400 });
    }
    const nextDelivery = nextWeekday(start, deliverySlot.day);

    try {
      const created = await prisma.$transaction(async (tx) => {
        const existing = await tx.subscription.findFirst({
          where: { userId, planId, status: { in: ['active', 'pending'] } },
          select: { id: true },
        });
        if (existing) throw new Error('DUPLICATE');

        // Enforce plan capacity (backed by a DB CHECK constraint as a hard stop).
        if (plan.maxSubscribers != null && plan.currentSubscribers >= plan.maxSubscribers) {
          throw new Error('CAPACITY');
        }

        const sub = await tx.subscription.create({
          data: {
            userId,
            planId,
            status: 'active',
            startDate: start,
            nextDeliveryDate: nextDelivery,
            deliveryAddress: deliveryAddress as object,
            deliverySlotDay: deliverySlot.day,
            deliverySlotTime: deliverySlot.timeSlot || '',
            paymentMethod: paymentMethod || 'cod',
          },
          include: { plan: { include: { contents: true } } },
        });

        await tx.subscriptionPlan.update({
          where: { id: planId },
          data: { currentSubscribers: { increment: 1 } },
        });

        return sub;
      });

      return NextResponse.json({
        success: true,
        subscription: serializeSubscription(created),
        message: 'Subscription created successfully!',
      });
    } catch (txErr) {
      if (txErr instanceof Error && txErr.message === 'DUPLICATE') {
        return NextResponse.json(
          { success: false, message: 'You already have an active subscription to this plan' },
          { status: 400 }
        );
      }
      if (txErr instanceof Error && txErr.message === 'CAPACITY') {
        return NextResponse.json(
          { success: false, message: 'This plan has reached its subscriber limit' },
          { status: 400 }
        );
      }
      throw txErr;
    }
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
