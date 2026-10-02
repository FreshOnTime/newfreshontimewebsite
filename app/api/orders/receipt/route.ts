import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// Recover a checkout whose response was lost, even when its reserved stock is
// no longer available for a fresh quote. The key is always scoped to the owner.
export const GET = requireAuth(async (request: NextRequest & { user?: { userId: string; mongoId?: string } }) => {
  const key = new URL(request.url).searchParams.get('key') || '';
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(key)) return NextResponse.json({ error: 'Invalid checkout retry key' }, { status: 400 });
  try {
    const customerId = request.user?.mongoId || request.user!.userId;
    const previous = await prisma.checkoutRequest.findUnique({ where: { customerId_key: { customerId, key } }, select: { response: true } });
    return NextResponse.json({ receipt: previous?.response || null }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to recover checkout. Please retry.' }, { status: 500 });
  }
});
