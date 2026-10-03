import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { orderAddressSchema } from '@/lib/orderAddress';
import { assertDeliveryArea, DeliveryPolicyError } from '@/lib/deliveryPolicy';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { isValidDeliveryDay, nextWeekday, serializeSubscription } from '@/lib/subscriptionUtils';

const subscriptionCreateSchema = z.object({
  planId: z.string().trim().min(1).max(100),
  deliveryAddress: orderAddressSchema,
  deliverySlot: z.object({ day: z.string().trim().toLowerCase().refine(isValidDeliveryDay, 'Choose a valid delivery day'), timeSlot: z.string().trim().max(80).default('Any time') }),
  paymentMethod: z.literal('cod').default('cod'),
  startDate: z.union([z.string().date(), z.string().datetime({ offset: true })]).optional(),
});
class SubscriptionCreateError extends Error { constructor(message: string, public status: number) { super(message); } }

// GET user's subscriptions
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user?.mongoId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: user.mongoId },
      select: {
        id: true,
        status: true,
        startDate: true,
        nextDeliveryDate: true,
        pausedUntil: true,
        cancelledAt: true,
        cancelReason: true,
        deliveryAddress: true,
        deliverySlotDay: true,
        deliverySlotTime: true,
        paymentMethod: true,
        totalDeliveries: true,
        skippedDeliveries: true,
        skippedDates: true,
        excludeItems: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
        plan: { select: { name: true, icon: true, price: true, frequency: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      {
        success: true,
        subscriptions: subscriptions.map(serializeSubscription),
      },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// A saved retry receipt makes uncertain network outcomes recoverable.
export async function POST(request: NextRequest) {
  let identity: { userId: string; key: string; fingerprint: string } | undefined;
  const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
  try {
    const user = await verifyToken(request);
    if (!user?.mongoId) return json({ success: false, message: 'Unauthorized' }, 401);
    const data = subscriptionCreateSchema.parse(await request.json());
    const key = request.headers.get('Idempotency-Key');
    if (key && !/^[A-Za-z0-9_-]{8,128}$/.test(key)) return json({ success: false, message: 'Invalid subscription retry key' }, 400);
    if (key) {
      identity = { userId: user.mongoId, key, fingerprint: createHash('sha256').update(JSON.stringify(data)).digest('hex') };
      const previous = await prisma.subscriptionRequest.findUnique({ where: { userId_key: { userId: identity.userId, key } } });
      if (previous) return previous.fingerprint === identity.fingerprint && previous.response ? json(previous.response) : json({ success: false, message: 'This retry key belongs to another subscription request' }, 409);
    }
    assertDeliveryArea(data.deliveryAddress);
    const start = new Date(data.startDate || Date.now());
    if (start.getTime() < Date.now() - 24 * 60 * 60 * 1000) return json({ success: false, message: 'Choose today or a future start date' }, 400);
    const result = await prisma.$transaction(async tx => {
      if (identity) await tx.subscriptionRequest.create({ data: identity });
      // This upsert deliberately updates the existing row to hold its lock until commit.
      await tx.$executeRaw`INSERT INTO "subscription_plan_claims" ("userId", "planId") VALUES (${user.mongoId}, ${data.planId}) ON CONFLICT ("userId", "planId") DO UPDATE SET "planId" = EXCLUDED."planId"`;
      if (await tx.subscription.findFirst({ where: { userId: user.mongoId, planId: data.planId, status: { in: ['active', 'pending', 'paused'] } }, select: { id: true } })) throw new SubscriptionCreateError('You already have a subscription to this plan. Manage it from your account.', 409);
      const plan = await tx.subscriptionPlan.findUnique({ where: { id: data.planId } });
      if (!plan?.isActive) throw new SubscriptionCreateError('This subscription plan is unavailable', 400);
      const capacity = await tx.subscriptionPlan.updateMany({ where: { id: plan.id, isActive: true, maxSubscribers: plan.maxSubscribers, ...(plan.maxSubscribers == null ? {} : { currentSubscribers: { lt: plan.maxSubscribers } }) }, data: { currentSubscribers: { increment: 1 } } });
      if (capacity.count !== 1) throw new SubscriptionCreateError('This plan has reached its subscriber limit or changed. Please retry.', 409);
      const subscription = await tx.subscription.create({ data: {
        userId: user.mongoId!, planId: plan.id, status: 'active', startDate: start,
        nextDeliveryDate: nextWeekday(start, data.deliverySlot.day), deliveryAddress: data.deliveryAddress,
        deliverySlotDay: data.deliverySlot.day, deliverySlotTime: data.deliverySlot.timeSlot,
        paymentMethod: 'cod',
      }, include: { plan: { include: { contents: true } } } });
      const response = { success: true, subscription: serializeSubscription(subscription), message: 'Subscription created successfully' };
      if (identity) await tx.subscriptionRequest.update({ where: { userId_key: { userId: identity.userId, key: identity.key } }, data: { response: JSON.parse(JSON.stringify(response)) } });
      return response;
    });
    return json(result, 201);
  } catch (error) {
    if (identity && error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      try {
        const saved = await prisma.subscriptionRequest.findUnique({ where: { userId_key: { userId: identity.userId, key: identity.key } } });
        if (saved?.fingerprint === identity.fingerprint && saved.response) return json(saved.response);
        if (saved) return json({ success: false, message: 'This retry key belongs to another subscription request' }, 409);
      } catch { /* Return a retryable failure below. */ }
    }
    if (error instanceof z.ZodError || error instanceof SyntaxError) return json({ success: false, message: error instanceof z.ZodError ? error.issues[0].message : 'Invalid request' }, 400);
    if (error instanceof SubscriptionCreateError || error instanceof DeliveryPolicyError) return json({ success: false, message: error.message }, error.status);
    return json({ success: false, message: 'Your subscription could not be saved. Please retry.' }, 500);
  }
}
