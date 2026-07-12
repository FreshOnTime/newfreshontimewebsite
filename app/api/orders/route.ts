import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sendOrderEmail } from '@/lib/services/mailService';
import { RecurringOrderService, type RecurringOrderPattern } from '@/lib/services/recurringOrderService';

const ORDER_INCLUDE = {
  items: {
    include: {
      product: { select: { id: true, name: true, price: true, images: true, stockQty: true, sku: true } },
    },
  },
} satisfies Prisma.OrderInclude;

// The order-list page only needs these fields. Keeping the product and item
// graph out of that request substantially reduces payload and join work.
const ORDER_SUMMARY_SELECT = {
  id: true,
  orderNumber: true,
  createdAt: true,
  total: true,
  status: true,
  bagName: true,
  isRecurring: true,
  scheduleStatus: true,
  nextDeliveryAt: true,
  recurrence: true,
} satisfies Prisma.OrderSelect;

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
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const summaryOnly = searchParams.get('summary') === '1';

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const effectiveUserId = authUser?.role === 'admin' && queryUserId ? queryUserId : userId;

    const [ordersRaw, total] = await Promise.all([
      summaryOnly
        ? prisma.order.findMany({
          where: { customerId: effectiveUserId },
          select: ORDER_SUMMARY_SELECT,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        })
        : prisma.order.findMany({
          where: { customerId: effectiveUserId },
          include: ORDER_INCLUDE,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      prisma.order.count({ where: { customerId: effectiveUserId } }),
    ]);

    const orders = ordersRaw.map(serializeOrder);

    return NextResponse.json(
      {
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
      },
      summaryOnly ? { headers: { 'Cache-Control': 'private, max-age=30' } } : undefined
    );
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
      rruleString?: string;
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

    // A checkout creates the first real order now, plus a separate recurring
    // template for future deliveries. Keeping them separate prevents the cron
    // processor from creating a duplicate for the first booked delivery.
    let firstRecurringDelivery: Date | undefined;
    let nextDeliveryAt: Date | undefined;
    if (isRecurring) {
      if (!recurrence) {
        return NextResponse.json({ error: 'A recurrence pattern is required' }, { status: 400 });
      }
      const recurrenceForCalculation = {
        ...recurrence,
        startDate: recurrence.startDate ? new Date(recurrence.startDate) : undefined,
        endDate: recurrence.endDate ? new Date(recurrence.endDate) : undefined,
        includeDates: recurrence.includeDates?.map((date) => new Date(date)),
        excludeDates: recurrence.excludeDates?.map((date) => new Date(date)),
        selectedDates: recurrence.selectedDates?.map((date) => new Date(date)),
      };
      const validation = RecurringOrderService.validateRecurrencePattern(recurrenceForCalculation);
      if (!validation.valid) {
        return NextResponse.json({ error: 'Invalid recurrence pattern', details: validation.errors }, { status: 400 });
      }
      const pattern = { recurrence: recurrenceForCalculation } as RecurringOrderPattern;
      const firstDelivery = RecurringOrderService.calculateNextDelivery(pattern, new Date());
      if (!firstDelivery) {
        return NextResponse.json({ error: 'A recurring order must contain at least two future delivery dates' }, { status: 400 });
      }
      const followingDelivery = RecurringOrderService.calculateNextDelivery(pattern, firstDelivery);
      if (!followingDelivery) {
        return NextResponse.json({ error: 'A recurring order must contain at least two future delivery dates' }, { status: 400 });
      }
      firstRecurringDelivery = firstDelivery;
      nextDeliveryAt = followingDelivery;
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

      const initialOrder = await tx.order.create({
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
          estimatedDelivery: firstRecurringDelivery || null,
          isRecurring: false,
          recurrence: Prisma.JsonNull,
          nextDeliveryAt: null,
          scheduleStatus: null,
          items: { create: validatedItems },
        },
        include: ORDER_INCLUDE,
      });

      if (!isRecurring || !recurrence || !nextDeliveryAt) return { initialOrder, recurringSchedule: null };

      const recurringSchedule = await tx.order.create({
        data: {
          orderNumber: `REC-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
          customerId,
          bagId: bagId || null,
          bagName: bagName || null,
          subtotal,
          tax,
          shipping,
          discount: discountAmount,
          total,
          status: 'confirmed',
          paymentMethod: pm,
          shippingAddress: resolvedShipping as Prisma.InputJsonValue,
          notes: notes || null,
          isRecurring: true,
          recurrence: recurrence as unknown as Prisma.InputJsonValue,
          nextDeliveryAt,
          scheduleStatus: 'active',
          items: { create: validatedItems },
        },
      });
      return { initialOrder, recurringSchedule };
    });

    // Send order confirmation email (non-blocking).
    try {
      const customerEmail = userDoc?.email || userDoc?.phoneNumber || null;
      if (customerEmail) {
        sendOrderEmail(customerEmail, { _id: String(created.initialOrder.id), total: Number(created.initialOrder.total) }).catch((e) =>
          console.error('sendOrderEmail error', e)
        );
      }
    } catch (e) {
      console.error('Order email error:', e);
    }

    return NextResponse.json({
      success: true,
      data: serializeOrder(created.initialOrder),
      recurringScheduleId: created.recurringSchedule?.id,
    }, { status: 201 });
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
