import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { BAG_INCLUDE, serializeBag } from '@/lib/bagSerializer';
import { CheckoutError, checkoutItemsSchema, prepareCheckout } from '@/lib/checkoutService';
import { DeliveryPolicyError } from '@/lib/deliveryPolicy';

export const dynamic = 'force-dynamic';
const privateHeaders = { 'Cache-Control': 'private, no-store' };

const input = z.object({
  items: checkoutItemsSchema.max(10),
  budgetLkr: z.number().finite().min(10).max(500000),
  quoteFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  idempotencyKey: z.string().uuid(),
}).strict();

type UserRequest = NextRequest & { user?: { userId: string; mongoId?: string } };

function bagIdFor(userId: string, key: string) {
  // Stable, user-scoped UUID for safe retry of an explicitly approved draft.
  const hex = createHash('sha256').update('assistant-bag:' + userId + ':' + key).digest('hex');
  return [hex.slice(0, 8), hex.slice(8, 12), '4' + hex.slice(13, 16),
    '8' + hex.slice(17, 20), hex.slice(20, 32)].join('-');
}

export const POST = requireAuth(async (request: UserRequest) => {
  try {
    const userId = request.user?.mongoId || request.user?.userId;
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers: privateHeaders });
    const parsed = input.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: 'Invalid approved shopping plan.' },
      { status: 400, headers: privateHeaders });

    const { items, quoteFingerprint, budgetLkr, idempotencyKey } = parsed.data;
    const id = bagIdFor(userId, idempotencyKey);
    const payloadHash = createHash('sha256').update(JSON.stringify({
      items: [...items].sort((a, b) => a.productId.localeCompare(b.productId)),
      quoteFingerprint, budgetLkr,
    })).digest('hex');
    const tag = 'assistant-plan:' + payloadHash;

    // Completed retries return the same bag, never a second one. A key cannot
    // be reused for a different approved proposal.
    const existing = await prisma.bag.findUnique({ where: { id }, include: BAG_INCLUDE });
    if (existing) {
      if (existing.userId !== userId || !existing.tags.includes(tag)) {
        return NextResponse.json({ error: 'Approval key was already used for a different plan.' },
          { status: 409, headers: privateHeaders });
      }
      return NextResponse.json({ success: true, data: serializeBag(existing), replayed: true },
        { headers: privateHeaders });
    }

    const { quote } = await prepareCheckout(items);
    if (quote.fingerprint !== quoteFingerprint || quote.total > budgetLkr) {
      return NextResponse.json({
        error: 'Prices, stock or delivery totals changed. Generate and review a new plan before saving.',
      }, { status: 409, headers: privateHeaders });
    }
    const data = {
      id, userId, name: 'Assisted grocery bag',
      description: 'Customer-approved catalogue suggestion. Final availability and pricing are checked at checkout.',
      tags: ['assisted-shopping', tag],
      totalAmount: quote.subtotal,
      items: { create: quote.items.map((item) => ({
        productId: item.productId, quantity: item.quantity, price: item.price,
      })) },
    };

    let bag;
    try {
      bag = await prisma.bag.create({ data, include: BAG_INCLUDE });
    } catch (error) {
      if ((error as { code?: string })?.code !== 'P2002') throw error;
      // Two simultaneous confirmations: recover the winning bag, not a 500.
      const winner = await prisma.bag.findUnique({ where: { id }, include: BAG_INCLUDE });
      if (!winner || winner.userId !== userId || !winner.tags.includes(tag)) throw error;
      bag = winner;
    }
    return NextResponse.json({ success: true, data: serializeBag(bag) },
      { status: 201, headers: privateHeaders });
  } catch (error) {
    if (error instanceof CheckoutError || error instanceof DeliveryPolicyError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: privateHeaders });
    }
    console.error('[Shopping assistant] Saving approved bag failed', error);
    return NextResponse.json({ error: 'Could not save your reviewed bag. Try again.' },
      { status: 500, headers: privateHeaders });
  }
});
