import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { logAuditAction, requireAdminSimple } from '@/lib/middleware/adminAuth';
import { OPEN_ORDER, supplierTransition } from '@/lib/services/supplierOrderService';

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
export const GET = requireAdminSimple(async req => {
  const parsed = z.coerce.number().int().min(1).max(10000).default(1).safeParse(new URL(req.url).searchParams.get('page') ?? undefined);
  if (!parsed.success) return json({ error: 'Invalid page' }, 400);
  const rows = await prisma.supplierOrder.findMany({ orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (parsed.data - 1) * 25, take: 26, select: {
    id: true, status: true, items: true, createdAt: true, settledAt: true, settlementAmount: true, settlementReference: true,
    order: { select: { orderNumber: true, estimatedDelivery: true, status: true } },
    supplier: { select: { name: true, phone: true, status: true, applicationStatus: true } },
  } });
  return json({ requests: rows.slice(0,25), hasNext: rows.length > 25 });
});

export const PATCH = requireAdminSimple(async req => {
  const parsed = z.discriminatedUnion('action', [
    z.object({ id: z.string().min(1).max(100), action: z.literal('collect') }),
    z.object({ id: z.string().min(1).max(100), action: z.enum(['accept', 'unavailable', 'ready']) }),
    z.object({ id: z.string().min(1).max(100), action: z.literal('settle'), amount: z.number().positive().max(9999999999.99).multipleOf(0.01), reference: z.string().trim().min(1).max(200) }),
  ]).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Invalid action or settlement details.' }, 400);
  const data = parsed.data;
  const recordAudit = async () => {
    const record = await prisma.supplierOrder.findUnique({ where: { id: data.id }, select: { supplierId: true } });
    if (record && req.user) await logAuditAction(req.user.userId, `partner_order_${data.action}`, 'supplier', record.supplierId, undefined, { requestId: data.id, ...data }, req);
  };
  if (data.action !== 'collect' && data.action !== 'settle') {
    const current = await prisma.supplierOrder.findUnique({ where: { id: data.id }, select: { status: true } });
    const status = current && supplierTransition(current.status, data.action);
    if (!current || !status) return json({ error: 'Request is unavailable for this action.' }, 409);
    const changed = await prisma.supplierOrder.updateMany({ where: { id: data.id, status: current.status, order: { status: OPEN_ORDER }, supplier: { status: 'active', applicationStatus: 'approved' } }, data: { status } });
    if (changed.count === 1) await recordAudit();
    return changed.count === 1 ? json({ success: true }) : json({ error: 'Request changed. Refresh and try again.' }, 409);
  }
  const updated = data.action === 'collect'
    ? await prisma.supplierOrder.updateMany({ where: { id: data.id, status: 'ready', order: { status: OPEN_ORDER } }, data: { status: 'collected' } })
    : await prisma.supplierOrder.updateMany({ where: { id: data.id, status: 'collected', settledAt: null }, data: { settlementAmount: data.amount, settlementReference: data.reference, settledAt: new Date() } });
  if (updated.count === 1) await recordAudit();
  return updated.count === 1 ? json({ success: true }) : json({ error: 'Request is unavailable, already updated or not ready for this action.' }, 409);
});
