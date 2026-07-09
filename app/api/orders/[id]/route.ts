import { NextRequest, NextResponse } from 'next/server';
import { Prisma, OrderStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const ORDER_INCLUDE = {
  items: {
    include: {
      product: { select: { id: true, name: true, price: true, images: true, stockQty: true, sku: true } },
    },
  },
} satisfies Prisma.OrderInclude;

type AuthUser = { userId: string; role: string; mongoId?: string };

// Map a Postgres order row (with items+product) back to the shape the storefront
// expects: `_id`, numeric money fields, and populated `items[].productId`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeOrder(o: any) {
  const { items, ...rest } = o;
  return {
    ...rest,
    _id: o.id,
    subtotal: Number(o.subtotal),
    tax: Number(o.tax),
    shipping: Number(o.shipping),
    discount: Number(o.discount),
    total: Number(o.total),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: (items || []).map((it: any) => {
      const { product, ...itRest } = it;
      return {
        ...itRest,
        price: Number(it.price),
        total: Number(it.total),
        productId: product
          ? {
              _id: product.id,
              name: product.name,
              price: Number(product.price),
              images: product.images,
              stockQty: product.stockQty,
              sku: product.sku,
            }
          : it.productId,
      };
    }),
  };
}

// Resolve the order id from Next 16 async params (fall back to the URL path).
async function getOrderId(
  request: NextRequest,
  context?: { params?: { id?: string } | Promise<{ id?: string }> }
): Promise<string | undefined> {
  if (context?.params) {
    const resolved = await context.params;
    if (resolved?.id) return resolved.id;
  }
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const ordersIndex = pathParts.indexOf('orders');
  if (ordersIndex !== -1 && pathParts[ordersIndex + 1]) {
    return pathParts[ordersIndex + 1];
  }
  return undefined;
}

// GET - fetch single order (owner or admin)
export const GET = requireAuth(async (request: NextRequest, context?: { params: Promise<{ id: string }> }) => {
  try {
    const id = await getOrderId(request, context as { params?: { id?: string } | Promise<{ id?: string }> });
    if (!id) {
      return NextResponse.json({ error: 'Order ID missing' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const user = (request as NextRequest & { user: AuthUser }).user;
    // Allow owner or admin. Orders store customerId = user id (mongoId === userId === user.id).
    const ownerId = user.mongoId || user.userId;
    if (String(order.customerId) !== String(ownerId) && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: serializeOrder(order) });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
});

// PUT - update an order (owner or admin). Allows editing shippingAddress and notes while order is not shipped/delivered.
export const PUT = requireAuth(async (request: NextRequest, context?: { params: Promise<{ id: string }> }) => {
  try {
    const id = await getOrderId(request, context as { params?: { id?: string } | Promise<{ id?: string }> });
    if (!id) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const updates: Prisma.OrderUpdateInput = {};
    if (body?.shippingAddress && typeof body.shippingAddress === 'object') {
      updates.shippingAddress = body.shippingAddress as Prisma.InputJsonValue;
    }
    if (typeof body?.notes === 'string') {
      updates.notes = body.notes;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const user = (request as NextRequest & { user: AuthUser }).user;
    const ownerId = user.mongoId || user.userId;
    if (String(order.customerId) !== String(ownerId) && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return NextResponse.json({ error: `Order cannot be edited in '${order.status}' state` }, { status: 400 });
    }

    const updated = await prisma.order.update({ where: { id }, data: updates, include: ORDER_INCLUDE });
    return NextResponse.json({ success: true, data: serializeOrder(updated) });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
});

// PATCH - quick actions: cancel (owner), mark-status (admin)
export const PATCH = requireAuth(async (request: NextRequest, context?: { params: Promise<{ id: string }> }) => {
  try {
    const id = await getOrderId(request, context as { params?: { id?: string } | Promise<{ id?: string }> });
    if (!id) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }
    const body = await request.json().catch(() => ({}));
    const action = body?.action as string;
    const user = (request as NextRequest & { user: AuthUser }).user;

    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    const ownerId = user.mongoId || user.userId;
    const isOwner = String(order.customerId) === String(ownerId);
    if (!isOwner && user.role !== 'admin') return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    if (action === 'cancel') {
      if (['shipped', 'delivered'].includes(order.status)) {
        return NextResponse.json({ error: 'Cannot cancel after shipment' }, { status: 400 });
      }
      // Restore stock only if it hasn't already been released (guard double-restore).
      const shouldRestore = !['cancelled', 'refunded'].includes(order.status);
      const updated = await prisma.$transaction(async (tx) => {
        if (shouldRestore) {
          for (const it of order.items) {
            await tx.product.updateMany({ where: { id: it.productId }, data: { stockQty: { increment: it.qty } } });
          }
        }
        return tx.order.update({
          where: { id },
          data: {
            status: 'cancelled',
            // If this was a recurring order, also end the schedule so it no longer counts as active.
            ...(order.isRecurring ? { scheduleStatus: 'ended', nextDeliveryAt: null } : {}),
          },
          include: ORDER_INCLUDE,
        });
      });
      return NextResponse.json({ success: true, data: serializeOrder(updated), message: 'Order cancelled' });
    }

    if (user.role === 'admin' && action?.startsWith('status:')) {
      const status = action.split(':')[1];
      if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      // Cancel/refund transitions restore stock once (guard against double-restore).
      const restore =
        ['cancelled', 'refunded'].includes(status) && !['cancelled', 'refunded'].includes(order.status);
      const updated = await prisma.$transaction(async (tx) => {
        if (restore) {
          for (const it of order.items) {
            await tx.product.updateMany({ where: { id: it.productId }, data: { stockQty: { increment: it.qty } } });
          }
        }
        return tx.order.update({ where: { id }, data: { status: status as OrderStatus }, include: ORDER_INCLUDE });
      });
      return NextResponse.json({ success: true, data: serializeOrder(updated) });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error patching order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
});

// DELETE - admin hard delete (restores stock if not shipped/delivered)
export const DELETE = requireAuth(async (request: NextRequest, context?: { params: Promise<{ id: string }> }) => {
  try {
    const id = await getOrderId(request, context as { params?: { id?: string } | Promise<{ id?: string }> });
    if (!id) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }
    const user = (request as NextRequest & { user: AuthUser }).user;
    if (user.role !== 'admin') return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Restore stock for orders that still hold reservations. Cancelled/refunded
    // orders already released their stock, so skip them to avoid double-restore.
    const restore = !['delivered', 'shipped', 'cancelled', 'refunded'].includes(order.status);

    await prisma.$transaction(async (tx) => {
      if (restore) {
        for (const it of order.items) {
          await tx.product.updateMany({ where: { id: it.productId }, data: { stockQty: { increment: it.qty } } });
        }
      }
      await tx.order.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
});
