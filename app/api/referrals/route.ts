import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware/auth';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';

const REFERRAL_REWARD = 200; // Ledger amount; this API does not pay out or discount checkout.
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
const codeSchema = z.string().trim().toUpperCase().regex(/^[A-Z0-9]{6,32}$/, 'Enter a valid referral code');
class ReferralError extends Error { constructor(message: string, public status = 400) { super(message); } }
const failure = (error: unknown) => {
  if (error instanceof z.ZodError || error instanceof SyntaxError) return json({ success: false, message: error instanceof z.ZodError ? error.issues[0].message : 'Invalid referral request' }, 400);
  if (error instanceof ReferralError) return json({ success: false, message: error.message }, error.status);
  return json({ success: false, message: 'Unable to update referrals. Please retry.' }, 500);
};

export const GET = withAuth(async req => {
  try {
    const ownerId = req.user!._id;
    let referral = await prisma.referral.findUnique({ where: { ownerId } });
    for (let attempt = 0; !referral && attempt < 10; attempt++) {
      try {
        referral = await prisma.referral.upsert({ where: { ownerId }, update: {}, create: { ownerId, code: 'FRESH' + randomBytes(5).toString('hex').toUpperCase() } });
      } catch (error) {
        if (!error || typeof error !== 'object' || !('code' in error) || error.code !== 'P2002') throw error;
        referral = await prisma.referral.findUnique({ where: { ownerId } });
      }
    }
    if (!referral) throw new Error('Referral code unavailable');
    return json({ success: true, referral: { code: referral.code, totalEarnings: Number(referral.totalEarnings), totalReferrals: referral.totalReferrals, successfulReferrals: referral.successfulReferrals, isActive: referral.isActive }, checkoutDiscountsAvailable: false, automaticPayoutsAvailable: false });
  } catch (error) { return failure(error); }
});

/** Record attribution for the signed-in account, never an arbitrary supplied ID. */
export const POST = withAuth(async req => {
  try {
    const data = z.object({ code: codeSchema, userId: z.string().min(1).max(100).optional() }).parse(await req.json());
    const userId = req.user!._id;
    if (data.userId && data.userId !== userId) return json({ success: false, message: 'A referral can only be applied to your own account' }, 403);
    const result = await prisma.$transaction(async tx => {
      // Serialize competing codes for this customer even though the legacy
      // unique key is (referralId, userId), rather than userId alone.
      await tx.$queryRaw`SELECT id FROM users WHERE id=${userId} FOR UPDATE`;
      const referral = await tx.referral.findFirst({ where: { code: data.code, isActive: true } });
      if (!referral) throw new ReferralError('Invalid or inactive referral code');
      if (referral.ownerId === userId) throw new ReferralError('Cannot use your own referral code');
      const previous = await tx.referredUser.findFirst({ where: { userId }, orderBy: [{ appliedAt: 'asc' }, { id: 'asc' }] });
      if (previous) {
        if (previous.referralId !== referral.id) throw new ReferralError('A referral is already recorded for this account', 409);
        return { code: referral.code, replay: true };
      }
      if (await tx.order.findFirst({ where: { customerId: userId, isRecurring: false }, select: { id: true } })) throw new ReferralError('Apply a referral before placing your first order', 409);
      await tx.referredUser.create({ data: { referralId: referral.id, userId } });
      await tx.referral.update({ where: { id: referral.id }, data: { totalReferrals: { increment: 1 } } });
      return { code: referral.code, replay: false };
    });
    return json({ success: true, referrerCode: result.code, message: 'Referral recorded. No checkout discount has been applied.', discount: 0 }, result.replay ? 200 : 201);
  } catch (error) { return failure(error); }
});

/** Admin-only ledger reconciliation backed by the first paid, delivered order. */
export const PATCH = requireAdminSimple(async req => {
  try {
    const data = z.object({ referralCode: codeSchema, userId: z.string().min(1).max(100), orderId: z.string().min(1).max(100) }).parse(await req.json());
    const result = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM users WHERE id=${data.userId} FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM orders WHERE id=${data.orderId} FOR SHARE`;
      const referral = await tx.referral.findFirst({ where: { code: data.referralCode, isActive: true } });
      if (!referral) throw new ReferralError('Referral not found', 404);
      const entry = await tx.referredUser.findFirst({ where: { referralId: referral.id, userId: data.userId } });
      if (!entry) throw new ReferralError('No referral attribution exists for this customer', 404);
      const firstAttribution = await tx.referredUser.findFirst({ where: { userId: data.userId }, orderBy: [{ appliedAt: 'asc' }, { id: 'asc' }] });
      if (firstAttribution?.id !== entry.id) throw new ReferralError('Only the first referral attribution can earn a reward', 409);
      const order = await tx.order.findUnique({ where: { id: data.orderId } });
      if (!order || order.customerId !== data.userId || order.isRecurring || order.status !== 'delivered' || order.paymentStatus !== 'paid' || Number(order.total) <= 0 || order.createdAt < entry.appliedAt) throw new ReferralError('Use this customer\'s paid, delivered order placed after the referral was recorded');
      const firstPurchase = await tx.order.findFirst({ where: { customerId: data.userId, isRecurring: false, status: 'delivered', paymentStatus: 'paid', total: { gt: 0 } }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select: { id: true } });
      if (firstPurchase?.id !== order.id) throw new ReferralError('Only the first paid, delivered purchase qualifies');
      if (entry.rewardPaid) return { replay: true };
      const claimed = await tx.referredUser.updateMany({ where: { id: entry.id, rewardPaid: false }, data: { orderPlaced: true, rewardPaid: true } });
      if (claimed.count !== 1) return { replay: true };
      await tx.referral.update({ where: { id: referral.id }, data: { totalEarnings: { increment: REFERRAL_REWARD }, successfulReferrals: { increment: 1 } } });
      await tx.auditLog.create({ data: { userId: req.user!.userId, action: 'record_referral_reward', resourceType: 'referral', resourceId: referral.id, after: { referredUserId: data.userId, orderId: order.id, amount: REFERRAL_REWARD, currency: 'LKR', payoutProcessed: false } } });
      return { replay: false };
    });
    return json({ success: true, replay: result.replay, message: 'Referral reward recorded. Payout is handled separately.', reward: REFERRAL_REWARD });
  } catch (error) { return failure(error); }
});
