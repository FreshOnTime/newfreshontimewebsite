import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';
const input = z.object({ page: z.coerce.number().int().min(1).max(100000).default(1), status: z.enum(['pending','confirmed','delivered','cancelled','skipped']).optional() });
export const GET = requireAdminSimple(async request => {
  try {
    const { page, status } = input.parse(Object.fromEntries(new URL(request.url).searchParams));
    const where = status ? { status } : {};
    const [deliveries, total] = await prisma.$transaction([
      prisma.subscriptionDelivery.findMany({ where, include: { subscription: { select: { id: true, user: { select: { firstName: true, lastName: true, email: true, phoneNumber: true } } } } }, orderBy: [{ scheduledFor: 'asc' }, { id: 'asc' }], skip: (page-1)*20, take: 20 }),
      prisma.subscriptionDelivery.count({ where }),
    ]);
    return NextResponse.json({ success: true, deliveries: deliveries.map(row => ({ ...row, _id: row.id, price: Number(row.price) })), total, page, pages: Math.max(1, Math.ceil(total/20)) }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { return NextResponse.json({ error: 'Unable to load deliveries' }, { status: error instanceof z.ZodError ? 400 : 500 }); }
});
