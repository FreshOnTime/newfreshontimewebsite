import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';
import { buyingRequest, colomboDay, decision } from '@/lib/supplyPilot';

const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { 'Cache-Control': 'private, no-store' } });
class Conflict extends Error {}
function failure(error: unknown) {
  if (error instanceof Conflict) return json({ error: error.message }, 409);
  if (error instanceof ZodError || error instanceof SyntaxError) return json({ error: error instanceof ZodError ? error.issues[0].message : 'Invalid request.' }, 400);
  return json({ error: 'Could not complete this action. Refresh and try again.' }, 503);
}

export const GET = requireAdminSimple(async request => {
  const offset = Number(new URL(request.url).searchParams.get('offset') || 0);
  if (!Number.isSafeInteger(offset) || offset < 0) return json({ error: 'Invalid page.' }, 400);
  const [offers, requests, metrics] = await Promise.all([
    prisma.supplyOffer.findMany({ skip: offset, take: 26, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], include: { request: true } }),
    prisma.supplyRequest.findMany({ where: { pickup: { gte: colomboDay() } }, orderBy: { pickup: 'asc' } }),
    prisma.$queryRaw<{ growers: number; repeated: number; hours: number | null }[]>`
      WITH handovers AS (
        SELECT "phone", date_trunc('week', "handedOverAt" + interval '5 hours 30 minutes') AS week
        FROM "SupplyOffer" WHERE "handedOverAt" IS NOT NULL
      ), firsts AS (SELECT phone, min(week) AS week FROM handovers GROUP BY phone)
      SELECT count(*)::int AS growers, count(*) FILTER (WHERE EXISTS
        (SELECT 1 FROM handovers h WHERE h.phone = f.phone AND h.week = f.week + interval '1 week'))::int AS repeated,
        (SELECT avg(extract(epoch FROM ("decidedAt" - "createdAt")) / 3600)::float8 FROM "SupplyOffer") AS hours
      FROM firsts f`,
  ]);
  return json({ offers: offers.slice(0, 25), more: offers.length > 25, requests, metrics: metrics[0] });
});

export const POST = requireAdminSimple(async request => {
  try {
    const data = buyingRequest.parse(await request.json());
    if (data.deadline < colomboDay()) return json({ error: 'Choose a current or future deadline.' }, 400);
    await prisma.supplyRequest.upsert({ where: { id: data.id }, create: { ...data, remaining: data.quantity }, update: {} });
    return json({ saved: true }, 201);
  } catch (error) { return failure(error); }
});

export const PATCH = requireAdminSimple(async request => {
  try {
    const input = decision.parse(await request.json());
    await prisma.$transaction(async tx => {
      const offer = await tx.supplyOffer.findUnique({ where: { id: input.id } });
      if (!offer) throw new Conflict('Offer no longer available.');
      const where = { id: offer.id, status: offer.status };
      let data;
      switch (input.action) {
        case 'propose':
          if (offer.status !== 'received' || offer.quantity.lt(input.agreedQty)) throw new Conflict('Review the available offer quantity.');
          data = { status: 'proposed', agreedQty: input.agreedQty, agreedPrice: input.agreedPrice, terms: input.terms, decidedAt: new Date() };
          break;
        case 'decline':
          if (!['received', 'proposed'].includes(offer.status)) throw new Conflict('This offer has already been settled.');
          data = { status: 'declined', terms: input.terms, decidedAt: offer.decidedAt ?? new Date() };
          break;
        case 'confirm':
          if (offer.status !== 'proposed' || !offer.agreedQty) throw new Conflict('Send terms and obtain the supplier’s confirmation first.');
          if (offer.requestId) {
            const reserved = await tx.supplyRequest.updateMany({
              where: { id: offer.requestId, remaining: { gte: offer.agreedQty }, pickup: { gte: colomboDay() } },
              data: { remaining: { decrement: offer.agreedQty } },
            });
            if (!reserved.count) throw new Conflict('The request has insufficient remaining quantity or its pickup date has passed.');
          }
          data = { status: 'confirmed' };
          break;
        case 'handover':
          if (offer.status !== 'confirmed') throw new Conflict('Only confirmed offers can be handed over.');
          data = { status: 'handed_over', handedOverAt: new Date() };
          break;
      }
      const changed = await tx.supplyOffer.updateMany({ where, data });
      if (!changed.count) throw new Conflict('Another staff member updated this offer. Refresh the queue.');
    });
    return json({ saved: true });
  } catch (error) { return failure(error); }
});
