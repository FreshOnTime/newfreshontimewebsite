import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sendOrderEmail } from '@/lib/services/mailService';

const ORDER_INCLUDE = {
  items: {
    include: {
      product: { select: { id: true, name: true, price: true, images: true, stockQty: true, sku: true } },
    },
  },
} satisfies Prisma.OrderInclude;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeOrder(o: any) {
  return {
    ...o,
    subtotal: Number(o.subtotal),
    tax: Number(o.tax),
    shipping: Number(o.shipping),
    discount: Number(o.discount),
    total: Number(o.total),
    // Backward-compatible recurring indicator.
    isRecurring: Boolean(
      o?.isRecurring || o?.scheduleStatus || o?.nextDeliveryAt ||
      (o?.recurrence && typeof o.recurrence === 'object' && Object.keys(o.recurrence).length > 0)
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: (o.items || []).map((it: any) => ({
      ...it,
      price: Number(it.price),
      total: Number(it.total),
    })),
  };
}

// GET - Fetch orders for the authenticated user (admins may query another user)
export const GET = requireAuth(async (request: NextRequest & { user?: { userId: string; role: string; mongoId?: string } }) => {
  try {
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get('userId');
    const authUser = request.user;
    const userId = authUser?.mongoId || authUser?.userId;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10'));

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const effectiveUserId = authUser?.role === 'admin' && queryUserId ? queryUserId : userId;

    const [ordersRaw, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId: effectiveUserId },
        include: ORDER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where: { customerId: effectiveUserId } }),
    ]);

    const orders = ordersRaw.map(serializeOrder);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
});

// POST - Create a new order (transactional stock reservation)
export const POST = requireAuth(async (request: NextRequest & { user?: { userId: string; role: string; mongoId?: string } }) => {
  try {
    const body = await request.json();
    const { items, shippingAddress, paymentMethod, notes, discount = 0, bagId, bagName, useRegisteredAddress } = body;
    const authUser = request.user;
    const customerId = authUser?.mongoId || authUser?.userId;

    const recurrence = body.recurrence as {
      startDate?: string;
      endDate?: string;
      daysOfWeek?: number[];
      includeDates?: string[];
      excludeDates?: string[];
      selectedDates?: string[];
      notes?: string;
    } | undefined;
    const hasRecurrenceSignals = Boolean(
      recurrence && (
        recurrence.startDate || recurrence.endDate || recurrence.notes ||
        (Array.isArray(recurrence.daysOfWeek) && recurrence.daysOfWeek.length > 0) ||
        (Array.isArray(recurrence.includeDates) && recurrence.includeDates.length > 0) ||
        (Array.isArray(recurrence.excludeDates) && recurrence.excludeDates.length > 0) ||
        (Array.isArray(recurrence.selectedDates) && recurrence.selectedDates.length > 0)
      )
    );
    const isRecurring = Boolean(body.isRecurring) || hasRecurrenceSignals;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Authentication and items are required' }, { status: 400 });
    }

    const userDoc = await prisma.user.findUnique({
      where: { id: customerId },
      include: { addresses: true },
    });

    // Resolve each requested product (by id, sku, or slug) and compute totals.
    const validatedItems: Array<{ productId: string; sku: string; name: string; qty: number; price: number; total: number }> = [];
    let subtotal = 0;

    for (const item of items) {
      const qty = Number(item.quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        return NextResponse.json({ error: 'Invalid item quantity' }, { status: 400 });
      }
      const product = await prisma.product.findFirst({
        where: { OR: [{ id: item.productId }, { sku: item.productId }, { slug: item.productId }] },
      });
      if (!product) {
        return NextResponse.json({ error: `Product with ID ${item.productId} not found` }, { status: 400 });
      }
      if (product.stockQty < qty) {
        return NextResponse.json({ error: `Insufficient stock for product ${product.name}` }, { status: 400 });
      }
      const unitPrice = Number(product.price);
      const itemTotal = unitPrice * qty;
      subtotal += itemTotal;
      validatedItems.push({ productId: product.id, sku: product.sku, name: product.name, qty, price: unitPrice, total: itemTotal });
    }

    const tax = 0;
    const shipping = subtotal > 50 ? 0 : 5;
    // Clamp discount to a valid, non-negative amount that can't exceed the order value.
    const requestedDiscount = Number(discount || 0);
    const discountAmount = Math.min(
      Math.max(0, Number.isFinite(requestedDiscount) ? requestedDiscount : 0),
      subtotal + shipping + tax
    );
    const total = subtotal + tax + shipping - discountAmount;

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
    const pm = paymentMethod === 'cash_on_delivery' ? 'cash' : (paymentMethod || 'cash');

    // Compute nextDeliveryAt if recurring.
    let nextDeliveryAt: Date | undefined;
    if (isRecurring && recurrence) {
      const now = new Date();
      const start = recurrence.startDate ? new Date(recurrence.startDate) : now;
      const days = Array.isArray(recurrence.daysOfWeek) ? recurrence.daysOfWeek.filter((d): d is number => typeof d === 'number') : [];
      const includes = Array.isArray(recurrence.includeDates) ? recurrence.includeDates.map((d) => new Date(d)) : [];
      const excludesKey = new Set((Array.isArray(recurrence.excludeDates) ? recurrence.excludeDates : []).map((d) => new Date(d).toDateString()));
      const selected = Array.isArray(recurrence.selectedDates) ? recurrence.selectedDates.map((d) => new Date(d)) : [];
      const candidates: Date[] = [];
      for (const d of [...selected, ...includes]) {
        if (d >= start && !excludesKey.has(d.toDateString())) candidates.push(d);
      }
      if (!candidates.length && days.length) {
        for (let i = 0; i < 28; i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          if (days.includes(d.getDay()) && !excludesKey.has(d.toDateString())) {
            candidates.push(d);
            break;
          }
        }
      }
      nextDeliveryAt = candidates.sort((a, b) => +a - +b)[0];
    }

    // Resolve shipping address: explicit -> user's registration address.
    let resolvedShipping: Record<string, unknown> | undefined;
    if (shippingAddress && typeof shippingAddress === 'object') {
      resolvedShipping = shippingAddress;
    } else if (useRegisteredAddress || !shippingAddress) {
      const ra = userDoc?.addresses.find((a) => a.isRegistration) || userDoc?.addresses[0];
      if (ra) {
        resolvedShipping = {
          name: ra.recipientName || `${userDoc?.firstName || ''}`.trim() || 'Customer',
          street: [ra.streetAddress, ra.streetAddress2].filter(Boolean).join(', '),
          city: ra.city || ra.town || '',
          state: ra.state || '',
          zipCode: ra.postalCode || '',
          country: ra.countryCode || 'LK',
          phone: ra.phoneNumber || userDoc?.phoneNumber || '',
        };
      }
    }
    if (!resolvedShipping) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 });
    }

    // Atomically reserve stock and create the order. Conditional decrements
    // (stockQty >= qty) prevent overselling under concurrency; any failure rolls
    // back every decrement AND the order together.
    const created = await prisma.$transaction(async (tx) => {
      for (const it of validatedItems) {
        const res = await tx.product.updateMany({
          where: { id: it.productId, stockQty: { gte: it.qty } },
          data: { stockQty: { decrement: it.qty } },
        });
        if (res.count !== 1) {
          throw new Error(`INSUFFICIENT_STOCK:${it.name}`);
        }
      }

      return tx.order.create({
        data: {
          orderNumber,
          customerId,
          bagId: bagId || null,
          bagName: bagName || null,
          subtotal,
          tax,
          shipping,
          discount: discountAmount,
          total,
          paymentMethod: pm,
          shippingAddress: resolvedShipping as Prisma.InputJsonValue,
          notes: notes || null,
          isRecurring,
          recurrence: isRecurring && recurrence ? (recurrence as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
          nextDeliveryAt: nextDeliveryAt || null,
          scheduleStatus: isRecurring ? 'active' : null,
          items: { create: validatedItems },
        },
        include: ORDER_INCLUDE,
      });
    });

    // Send order confirmation email (non-blocking).
    try {
      const customerEmail = userDoc?.email || userDoc?.phoneNumber || null;
      if (customerEmail) {
        sendOrderEmail(customerEmail, { _id: String(created.id), total: Number(created.total) }).catch((e) =>
          console.error('sendOrderEmail error', e)
        );
      }
    } catch (e) {
      console.error('Order email error:', e);
    }

    return NextResponse.json({ success: true, data: serializeOrder(created) }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('INSUFFICIENT_STOCK:')) {
      return NextResponse.json(
        { error: `Insufficient stock for product ${error.message.split(':')[1]}` },
        { status: 400 }
      );
    }
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
});
