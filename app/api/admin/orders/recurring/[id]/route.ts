import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin, logAuditAction } from '@/lib/middleware/adminAuth';

interface AuthenticatedRequest extends NextRequest {
  user: {
    userId: string;
    role: string;
  };
}

const ORDER_INCLUDE = {
  items: { include: { product: { select: { name: true, price: true, images: true, stockQty: true, sku: true } } } },
  customer: { select: { firstName: true, lastName: true, email: true, phoneNumber: true } },
} satisfies Prisma.OrderInclude;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeOrder(o: any) {
  return {
    ...o,
    _id: o.id,
    subtotal: Number(o.subtotal),
    tax: Number(o.tax),
    shipping: Number(o.shipping),
    discount: Number(o.discount),
    total: Number(o.total),
    items: (o.items || []).map((it: any) => ({ ...it, _id: it.id, price: Number(it.price), total: Number(it.total) })),
  };
}

const adminUpdateRecurringOrderSchema = z.object({
  status: z.enum(['pending','confirmed','processing','shipped','delivered','cancelled','refunded']).optional(),
  paymentStatus: z.enum(['pending','paid','failed','refunded']).optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().max(1000).optional(),
  customerId: z.string().optional(),
  isRecurring: z.boolean().optional(),
  scheduleStatus: z.enum(['active', 'paused', 'ended']).optional(),
  nextDeliveryAt: z.string().datetime().optional(),
  recurrence: z.record(z.unknown()).optional(),
  shippingAddress: z.record(z.unknown()).optional(),
  billingAddress: z.record(z.unknown()).optional(),
  estimatedDelivery: z.string().datetime().optional(),
  actualDelivery: z.string().datetime().optional(),
  subtotal: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  shipping: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  total: z.number().min(0).optional(),
});

export const GET = requireAdmin(async (_request: NextRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    if (!order) return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    if (!order.isRecurring) return NextResponse.json({ error: 'Order is not a recurring order' }, { status: 400 });

    const relatedOrders = await prisma.order.findMany({
      where: { customerId: order.customerId, isRecurring: true, NOT: { id: order.id } },
      select: { id: true, orderNumber: true, status: true, createdAt: true, nextDeliveryAt: true, scheduleStatus: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      data: {
        order: serializeOrder(order),
        relatedOrders: relatedOrders.map((o) => ({ ...o, _id: o.id })),
      },
    });
  } catch (error) {
    console.error('Error fetching recurring order (admin):', error);
    return NextResponse.json({ error: 'Failed to fetch recurring order' }, { status: 500 });
  }
});

export const PUT = requireAdmin(async (request: NextRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const { id } = await params;
    const data = adminUpdateRecurringOrderSchema.parse(await request.json());
    const before = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    if (!before) return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    if (!before.isRecurring) return NextResponse.json({ error: 'Order is not a recurring order' }, { status: 400 });

    if (data.customerId && data.customerId !== before.customerId) {
      const customerExists = await prisma.user.findUnique({ where: { id: data.customerId } });
      if (!customerExists) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const update: Prisma.OrderUpdateInput = {
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.paymentStatus !== undefined ? { paymentStatus: data.paymentStatus } : {}),
      ...(data.trackingNumber !== undefined ? { trackingNumber: data.trackingNumber } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.customerId !== undefined ? { customer: { connect: { id: data.customerId } } } : {}),
      ...(data.isRecurring !== undefined ? { isRecurring: data.isRecurring } : {}),
      ...(data.scheduleStatus !== undefined ? { scheduleStatus: data.scheduleStatus } : {}),
      ...(data.nextDeliveryAt !== undefined ? { nextDeliveryAt: new Date(data.nextDeliveryAt) } : {}),
      ...(data.recurrence !== undefined ? { recurrence: data.recurrence as Prisma.InputJsonValue } : {}),
      ...(data.shippingAddress !== undefined ? { shippingAddress: data.shippingAddress as Prisma.InputJsonValue } : {}),
      ...(data.billingAddress !== undefined ? { billingAddress: data.billingAddress as Prisma.InputJsonValue } : {}),
      ...(data.estimatedDelivery !== undefined ? { estimatedDelivery: new Date(data.estimatedDelivery) } : {}),
      ...(data.actualDelivery !== undefined ? { actualDelivery: new Date(data.actualDelivery) } : {}),
      ...(data.subtotal !== undefined ? { subtotal: data.subtotal } : {}),
      ...(data.tax !== undefined ? { tax: data.tax } : {}),
      ...(data.shipping !== undefined ? { shipping: data.shipping } : {}),
      ...(data.discount !== undefined ? { discount: data.discount } : {}),
      ...(data.total !== undefined ? { total: data.total } : {}),
    };

    const updated = await prisma.order.update({ where: { id }, data: update, include: ORDER_INCLUDE });
    await logAuditAction(
      (request as AuthenticatedRequest).user.userId,
      'update',
      'order',
      id,
      serializeOrder(before),
      serializeOrder(updated),
      request
    );

    return NextResponse.json({ success: true, data: serializeOrder(updated), message: 'Recurring order updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    console.error('Error updating recurring order (admin):', error);
    return NextResponse.json({ error: 'Failed to update recurring order' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (request: NextRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const { id } = await params;
    const before = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    if (!before) return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    if (!before.isRecurring) return NextResponse.json({ error: 'Order is not a recurring order' }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      if (!['delivered', 'shipped'].includes(before.status)) {
        for (const item of before.items) {
          await tx.product.update({ where: { id: item.productId }, data: { stockQty: { increment: item.qty } } }).catch(() => null);
        }
      }
      await tx.order.delete({ where: { id } });
    });

    await logAuditAction((request as AuthenticatedRequest).user.userId, 'delete', 'order', id, serializeOrder(before), undefined, request);
    return NextResponse.json({ success: true, message: 'Recurring order deleted successfully' });
  } catch (error) {
    console.error('Error deleting recurring order (admin):', error);
    return NextResponse.json({ error: 'Failed to delete recurring order' }, { status: 500 });
  }
});

export const PATCH = requireAdmin(async (request: NextRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const { id } = await params;
    const actionSchema = z.object({
      action: z.enum(['pause', 'resume', 'end', 'force_next_delivery', 'skip_next_delivery', 'duplicate']),
      nextDeliveryAt: z.string().datetime().optional(),
    });
    const { action, nextDeliveryAt } = actionSchema.parse(await request.json());

    const before = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    if (!before) return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    if (!before.isRecurring) return NextResponse.json({ error: 'Order is not a recurring order' }, { status: 400 });

    if (action === 'duplicate') {
      const created = await prisma.order.create({
        data: {
          orderNumber: `DUP-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          customerId: before.customerId,
          bagId: before.bagId,
          bagName: before.bagName,
          subtotal: before.subtotal,
          tax: before.tax,
          shipping: before.shipping,
          discount: before.discount,
          total: before.total,
          status: 'pending',
          paymentMethod: before.paymentMethod,
          paymentStatus: before.paymentStatus,
          shippingAddress: before.shippingAddress as Prisma.InputJsonValue,
          billingAddress: before.billingAddress as Prisma.InputJsonValue,
          notes: before.notes,
          isRecurring: true,
          recurrence: before.recurrence as Prisma.InputJsonValue,
          nextDeliveryAt: before.nextDeliveryAt,
          scheduleStatus: 'active',
          items: {
            create: before.items.map((it) => ({
              productId: it.productId,
              sku: it.sku,
              name: it.name,
              qty: it.qty,
              price: it.price,
              total: it.total,
            })),
          },
        },
        include: ORDER_INCLUDE,
      });
      await logAuditAction((request as AuthenticatedRequest).user.userId, 'duplicate', 'order', id, serializeOrder(before), serializeOrder(created), request);
      return NextResponse.json({ success: true, data: serializeOrder(created), message: 'Recurring order duplicated successfully' });
    }

    let update: Prisma.OrderUpdateInput;
    let message: string;
    switch (action) {
      case 'pause':
        update = { scheduleStatus: 'paused' };
        message = 'Recurring order paused successfully';
        break;
      case 'resume':
        update = { scheduleStatus: 'active' };
        message = 'Recurring order resumed successfully';
        break;
      case 'end':
        update = { scheduleStatus: 'ended', nextDeliveryAt: null };
        message = 'Recurring order ended successfully';
        break;
      case 'force_next_delivery':
        if (!nextDeliveryAt) return NextResponse.json({ error: 'nextDeliveryAt is required for force_next_delivery action' }, { status: 400 });
        update = { nextDeliveryAt: new Date(nextDeliveryAt) };
        message = 'Next delivery date updated successfully';
        break;
      case 'skip_next_delivery': {
        if (!before.nextDeliveryAt) return NextResponse.json({ error: 'Cannot skip delivery without a current next delivery date' }, { status: 400 });
        const newNext = new Date(before.nextDeliveryAt);
        newNext.setDate(newNext.getDate() + 7);
        update = { nextDeliveryAt: newNext };
        message = 'Next delivery skipped successfully';
        break;
      }
    }

    const updated = await prisma.order.update({ where: { id }, data: update, include: ORDER_INCLUDE });
    await logAuditAction((request as AuthenticatedRequest).user.userId, action, 'order', id, serializeOrder(before), serializeOrder(updated), request);
    return NextResponse.json({ success: true, data: serializeOrder(updated), message });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    console.error('Error performing admin action on recurring order:', error);
    return NextResponse.json({ error: 'Failed to perform action on recurring order' }, { status: 500 });
  }
});
