import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin, logAuditAction } from '@/lib/middleware/adminAuth';

const ORDER_INCLUDE = {
  items: true,
  customer: { select: { firstName: true, lastName: true, email: true } },
} satisfies Prisma.OrderInclude;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeOrder(o: any) {
  const customerName = o.customer
    ? [o.customer.firstName, o.customer.lastName].filter(Boolean).join(' ') || o.customer.email || ''
    : '';

  return {
    ...o,
    _id: o.id,
    customerName,
    subtotal: Number(o.subtotal),
    tax: Number(o.tax),
    shipping: Number(o.shipping),
    discount: Number(o.discount),
    total: Number(o.total),
    items: (o.items || []).map((it: any) => ({
      ...it,
      _id: it.id,
      price: Number(it.price),
      total: Number(it.total),
    })),
  };
}

const updateSchema = z.object({
  status: z.enum(['pending','confirmed','processing','shipped','delivered','cancelled','refunded']).optional(),
  paymentStatus: z.enum(['pending','paid','failed','refunded']).optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().max(1000).optional(),
  items: z.array(z.object({
    productId: z.string().min(1),
    sku: z.string().min(1),
    name: z.string().min(1),
    qty: z.number().int().min(1),
    price: z.number().min(0),
    total: z.number().min(0),
  })).optional(),
  subtotal: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  shipping: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  total: z.number().min(0).optional(),
  shippingAddress: z.record(z.unknown()).optional(),
  billingAddress: z.record(z.unknown()).optional(),
  scheduleStatus: z.enum(['active','paused','ended']).optional(),
  nextDeliveryAt: z.string().datetime().optional(),
  isRecurring: z.boolean().optional(),
  recurrence: z.record(z.unknown()).optional(),
});

export const GET = requireAdmin(async (_request, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ order: serializeOrder(order) });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
});

export const PUT = requireAdmin(async (request, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);
    const before = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    if (!before) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const update: Prisma.OrderUpdateInput = {
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.paymentStatus !== undefined ? { paymentStatus: data.paymentStatus } : {}),
      ...(data.trackingNumber !== undefined ? { trackingNumber: data.trackingNumber } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.subtotal !== undefined ? { subtotal: data.subtotal } : {}),
      ...(data.tax !== undefined ? { tax: data.tax } : {}),
      ...(data.shipping !== undefined ? { shipping: data.shipping } : {}),
      ...(data.discount !== undefined ? { discount: data.discount } : {}),
      ...(data.total !== undefined ? { total: data.total } : {}),
      ...(data.shippingAddress !== undefined ? { shippingAddress: data.shippingAddress as Prisma.InputJsonValue } : {}),
      ...(data.billingAddress !== undefined ? { billingAddress: data.billingAddress as Prisma.InputJsonValue } : {}),
      ...(data.scheduleStatus !== undefined ? { scheduleStatus: data.scheduleStatus } : {}),
      ...(data.nextDeliveryAt !== undefined ? { nextDeliveryAt: new Date(data.nextDeliveryAt) } : {}),
      ...(data.isRecurring !== undefined ? { isRecurring: data.isRecurring } : {}),
      ...(data.recurrence !== undefined ? { recurrence: data.recurrence as Prisma.InputJsonValue } : {}),
    };

    if (before.isRecurring && data.status === 'cancelled') {
      update.scheduleStatus = 'ended';
      update.nextDeliveryAt = null;
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (data.items) {
        await tx.orderItem.deleteMany({ where: { orderId: id } });
        await tx.orderItem.createMany({
          data: data.items.map((it) => ({
            orderId: id,
            productId: it.productId,
            sku: it.sku,
            name: it.name,
            qty: it.qty,
            price: it.price,
            total: it.total,
          })),
        });
      }

      return tx.order.update({ where: { id }, data: update, include: ORDER_INCLUDE });
    });

    const beforeSerialized = serializeOrder(before);
    const updatedSerialized = serializeOrder(updated);
    await logAuditAction(request.user!.userId, 'update', 'order', id, beforeSerialized, updatedSerialized, request);
    return NextResponse.json({ order: updatedSerialized });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (request, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const { id } = await params;
    const before = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    if (!before) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    await prisma.order.delete({ where: { id } });
    await logAuditAction(request.user!.userId, 'delete', 'order', id, serializeOrder(before), undefined, request);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
});
