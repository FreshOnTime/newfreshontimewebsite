import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { OPEN_ORDER, supplierTransition } from '@/lib/services/supplierOrderService';

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
type AuthRequest = NextRequest & { user?: { userId: string; role: string; mongoId?: string } };
async function supplierId(req: AuthRequest) {
  if (req.user?.role !== 'supplier') return null;
  const user = await prisma.user.findUnique({ where: { id: req.user.mongoId || req.user.userId }, select: { supplier: { select: { id: true, status: true, applicationStatus: true } } } });
  const supplier = user?.supplier;
  return supplier?.status === 'active' && supplier.applicationStatus === 'approved' ? supplier.id : null;
}
const pageSchema = z.coerce.number().int().min(1).max(10000).default(1);
export const GET = requireAuth(async req => {
  const id = await supplierId(req);
  if (!id) return json({ error: 'An approved, active supplier account is required.' }, 403);
  const page = pageSchema.safeParse(new URL(req.url).searchParams.get('page') ?? undefined);
  if (!page.success) return json({ error: 'Invalid page' }, 400);
  const rows = await prisma.supplierOrder.findMany({ where: { supplierId: id }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (page.data - 1) * 25, take: 26, select: {
    id: true, items: true, status: true, createdAt: true, settlementAmount: true, settledAt: true, settlementReference: true,
    order: { select: { orderNumber: true, estimatedDelivery: true, status: true } },
  } });
  return json({ requests: rows.slice(0,25), hasNext: rows.length > 25 });
});

export const PATCH = requireAuth(async req => {
  const id = await supplierId(req);
  if (!id) return json({ error: 'An approved, active supplier account is required.' }, 403);
  const parsed = z.object({ id: z.string().min(1).max(100), action: z.enum(['accept', 'unavailable', 'ready']) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Invalid supply request action' }, 400);
  const result = await prisma.$transaction(async tx => {
    const current = await tx.supplierOrder.findFirst({ where: { id: parsed.data.id, supplierId: id }, select: { status: true } });
    if (!current) return 404;
    const status = supplierTransition(current.status, parsed.data.action);
    if (!status) return 409;
    const changed = await tx.supplierOrder.updateMany({ where: { id: parsed.data.id, supplierId: id, status: current.status, order: { status: OPEN_ORDER }, supplier: { status: 'active', applicationStatus: 'approved' } }, data: { status } });
    return changed.count === 1 ? 200 : 409;
  });
  return result === 200 ? json({ success: true }) : json({ error: result === 404 ? 'Supply request not found' : 'This request changed or is closed. Refresh and try again.' }, result);
});
