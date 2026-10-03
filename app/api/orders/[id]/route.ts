import { NextRequest, NextResponse } from 'next/server';
import { Prisma, OrderStatus } from '@prisma/client';
import { assertDeliveryArea, DeliveryPolicyError } from '@/lib/deliveryPolicy';
import { BasketLifecycleError, syncBasketDelivery, validateBasketOrderTransition } from '@/lib/basketOrderLifecycle';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { orderAddressSchema } from '@/lib/orderAddress';

class OrderConflict extends Error {}

const ORDER_INCLUDE = {
  subscriptionDelivery: true,
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
    const updates: Prisma.OrderUpdateManyMutationInput = {};
    if (body?.shippingAddress && typeof body.shippingAddress === 'object') {
      const address = orderAddressSchema.safeParse(body.shippingAddress);
      if (!address.success) return NextResponse.json({ error: address.error.issues[0].message }, { status: 400 });
      updates.shippingAddress = address.data;
    }
    if (typeof body?.notes === 'string') {
      updates.notes = body.notes;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id }, include: { subscriptionDelivery: true } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const user = (request as NextRequest & { user: AuthUser }).user;
    const ownerId = user.mongoId || user.userId;
    if (String(order.customerId) !== String(ownerId) && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (['shipped', 'delivered', 'cancelled', 'refunded'].includes(order.status)) {
      return NextResponse.json({ error: `Order cannot be edited in '${order.status}' state` }, { status: 400 });
    }

    if (order.subscriptionDelivery && updates.shippingAddress) assertDeliveryArea(updates.shippingAddress as { city: string; country: string });
    const updated = await prisma.$transaction(async (tx) => {
      const changed = await tx.order.updateMany({ where: { id, status: order.status, updatedAt: order.updatedAt }, data: updates });
      if (changed.count !== 1) throw new OrderConflict();
      await syncBasketDelivery(tx, order.subscriptionDelivery, order.status, updates.shippingAddress as Prisma.InputJsonValue | undefined);
      return tx.order.findUniqueOrThrow({ where: { id }, include: ORDER_INCLUDE });
    });
    return NextResponse.json({ success: true, data: serializeOrder(updated) });
  } catch (error) {
    if (error instanceof DeliveryPolicyError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof BasketLifecycleError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof OrderConflict) return NextResponse.json({ error: 'This order changed. Refresh it before trying again.' }, { status: 409 });
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

    const order = await prisma.order.findUnique({ where: { id }, include: { items: true, subscriptionDelivery: true } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    const ownerId = user.mongoId || user.userId;
    const isOwner = String(order.customerId) === String(ownerId);
    if (!isOwner && user.role !== 'admin') return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    if (action === 'cancel' || (user.role === 'admin' && action?.startsWith('status:'))) {
      const target = action === 'cancel' ? 'cancelled' : action.split(':')[1];
      if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].includes(target)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      if (action === 'cancel' && ['shipped', 'delivered', 'refunded'].includes(order.status)) {
        return NextResponse.json({ error: 'Cannot cancel this order in its current state' }, { status: 400 });
      }
      // A released reservation cannot be reopened by a status-only update.
      if (['cancelled', 'refunded'].includes(order.status) && !['cancelled', 'refunded'].includes(target)) {
        return NextResponse.json({ error: 'Create a new order to reserve stock again' }, { status: 400 });
      }
      if (order.subscriptionDelivery) validateBasketOrderTransition(order.status, target);
      const updated = await prisma.$transaction(async (tx) => {
        // Claim the exact version first. Concurrent requests cannot both release
        // the reservation, and shipment/address edits invalidate stale actions.
        const changed = await tx.order.updateMany({
          where: { id, status: order.status, updatedAt: order.updatedAt },
          data: {
            status: target as OrderStatus,
            ...(order.isRecurring && ['cancelled', 'refunded'].includes(target)
              ? { scheduleStatus: 'ended', nextDeliveryAt: null } : {}),
          },
        });
        if (changed.count !== 1) throw new OrderConflict();
        const restore = !order.isRecurring && ['cancelled', 'refunded'].includes(target)
          && !['cancelled', 'refunded'].includes(order.status) && !(order.subscriptionDelivery && ['shipped','delivered'].includes(order.status));
        if (restore) {
          for (const it of order.items) {
            await tx.product.updateMany({ where: { id: it.productId }, data: { stockQty: { increment: it.qty } } });
          }
        }
        await syncBasketDelivery(tx, order.subscriptionDelivery, target);
        return tx.order.findUniqueOrThrow({ where: { id }, include: ORDER_INCLUDE });
      });
      return NextResponse.json({ success: true, data: serializeOrder(updated) });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof DeliveryPolicyError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof BasketLifecycleError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof OrderConflict) return NextResponse.json({ error: 'This order changed. Refresh it before trying again.' }, { status: 409 });
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

    const order = await prisma.order.findUnique({ where: { id }, include: { items: true, subscriptionDelivery: true } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (order.subscriptionDelivery) return NextResponse.json({ error: 'Basket order history must be kept. Cancel the order instead.' }, { status: 409 });
    // Restore stock for orders that still hold reservations. Cancelled/refunded
    // orders already released their stock, so skip them to avoid double-restore.
    const restore = !order.isRecurring && !['delivered', 'shipped', 'cancelled', 'refunded'].includes(order.status);

    await prisma.$transaction(async (tx) => {
      const removed = await tx.order.deleteMany({ where: { id, status: order.status, updatedAt: order.updatedAt } });
      if (removed.count !== 1) throw new OrderConflict();
      if (restore) {
        for (const it of order.items) {
          await tx.product.updateMany({ where: { id: it.productId }, data: { stockQty: { increment: it.qty } } });
        }
      }
    });

    return NextResponse.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    if (error instanceof DeliveryPolicyError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof BasketLifecycleError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof OrderConflict) return NextResponse.json({ error: 'This order changed. Refresh it before trying again.' }, { status: 409 });
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
});
