import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import prisma from '@/lib/prisma';
import { isRateLimited, makeKey } from '@/lib/middleware/rateLimiter';
import { colomboDay, growerOffer } from '@/lib/supplyPilot';

export const dynamic = 'force-dynamic';

export async function GET() {
  const requests = await prisma.supplyRequest.findMany({
    where: { deadline: { gte: colomboDay() }, remaining: { gt: 0 } },
    orderBy: [{ deadline: 'asc' }, { id: 'asc' }],
  });
  return NextResponse.json({ requests }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'local';
  if (isRateLimited(makeKey('supply-offer', ip), 12, 600000)) return NextResponse.json({ error: 'Please try again in a few minutes.' }, { status: 429 });
  try {
    const input = growerOffer.parse(await request.json());
    const ok = () => NextResponse.json({ received: true });
    const existing = await prisma.supplyOffer.findUnique({ where: { submissionId: input.submissionId }, select: { id: true } });
    if (existing) return ok();
    const today = colomboDay();
    if (input.ready < today) return NextResponse.json({ error: 'Choose today or a future ready date.' }, { status: 400 });
    if (input.requestId) {
      const demand = await prisma.supplyRequest.findUnique({ where: { id: input.requestId } });
      if (!demand || demand.deadline < today || demand.remaining.lt(input.quantity) || demand.pickup < input.ready) {
        return NextResponse.json({ error: 'Check the remaining quantity and pickup date, or offer your produce separately.' }, { status: 409 });
      }
      input.product = demand.product;
      input.unit = demand.unit;
    }
    await prisma.supplyOffer.create({ data: input });
    return ok();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return NextResponse.json({ received: true });
    if (error instanceof ZodError || error instanceof SyntaxError) return NextResponse.json({ error: error instanceof ZodError ? error.issues[0].message : 'Invalid offer.' }, { status: 400 });
    return NextResponse.json({ error: 'Could not save your offer. Please retry.' }, { status: 503 });
  }
}
