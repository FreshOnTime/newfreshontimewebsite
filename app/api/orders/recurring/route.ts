import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { RecurringOrderService, type RecurringOrderPattern } from '@/lib/services/recurringOrderService';

type AuthUser = { userId: string; role: string; mongoId?: string };

const ORDER_INCLUDE = {
  items: {
    include: {
      product: { select: { id: true, name: true, price: true, images: true, stockQty: true, sku: true } },
    },
  },
} satisfies Prisma.OrderInclude;

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

// Validation schema for recurring order data
const recurringOrderSchema = z.object({
  isRecurring: z.boolean().default(true),
  recurrence: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    includeDates: z.array(z.string().datetime()).optional(),
    excludeDates: z.array(z.string().datetime()).optional(),
    selectedDates: z.array(z.string().datetime()).optional(),
    notes: z.string().max(1000).optional(),
  }).optional(),
  nextDeliveryAt: z.string().datetime().optional(),
  scheduleStatus: z.enum(['active', 'paused', 'ended']).default('active'),
});

const querySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  status: z.enum(['active', 'paused', 'ended']).optional(),
  sortBy: z.enum(['createdAt', 'nextDeliveryAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// GET - fetch all recurring orders for the authenticated user
export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const query = querySchema.parse({
      page: url.searchParams.get('page') || '1',
      limit: url.searchParams.get('limit') || '10',
      status: url.searchParams.get('status') || undefined,
      sortBy: url.searchParams.get('sortBy') || 'createdAt',
      sortOrder: url.searchParams.get('sortOrder') || 'desc',
    });

    const user = (request as NextRequest & { user: AuthUser }).user;
    const { page, limit, status, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Orders store customerId = the user's id (mongoId === userId === user.id).
    const where: Prisma.OrderWhereInput = {
      customerId: user.mongoId || user.userId,
      isRecurring: true,
    };

    if (status) {
      where.scheduleStatus = status;
    }

    const [ordersRaw, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: ORDER_INCLUDE,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const orders = ordersRaw.map(serializeOrder);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 });
    }
    console.error('Error fetching recurring orders:', error);
    return NextResponse.json({
      error: 'Failed to fetch recurring orders'
    }, { status: 500 });
  }
});

// POST - create a recurring order from an existing order
export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const user = (request as NextRequest & { user: AuthUser }).user;

    // Validate the request body
    const data = recurringOrderSchema.parse(body);

    if (!data.isRecurring || !data.recurrence) {
      return NextResponse.json({ error: 'A recurrence pattern is required' }, { status: 400 });
    }

    const recurrenceForCalculation = {
      ...data.recurrence,
      startDate: data.recurrence.startDate ? new Date(data.recurrence.startDate) : undefined,
      endDate: data.recurrence.endDate ? new Date(data.recurrence.endDate) : undefined,
      includeDates: data.recurrence.includeDates?.map((date) => new Date(date)),
      excludeDates: data.recurrence.excludeDates?.map((date) => new Date(date)),
      selectedDates: data.recurrence.selectedDates?.map((date) => new Date(date)),
    };
    const validation = RecurringOrderService.validateRecurrencePattern(recurrenceForCalculation);
    if (!validation.valid) {
      return NextResponse.json({ error: 'Invalid recurrence pattern', details: validation.errors }, { status: 400 });
    }

    const nextDeliveryAt = data.nextDeliveryAt
      ? new Date(data.nextDeliveryAt)
      : RecurringOrderService.calculateNextDelivery(
          { recurrence: recurrenceForCalculation } as RecurringOrderPattern,
          new Date()
        );
    if (!nextDeliveryAt) {
      return NextResponse.json({ error: 'The recurrence has no future delivery date' }, { status: 400 });
    }

    // Check if sourceOrderId is provided to copy from existing order
    if (!body.sourceOrderId) {
      return NextResponse.json({
        error: 'sourceOrderId is required to create recurring order'
      }, { status: 400 });
    }

    // Get the source order (with its line items)
    const sourceOrder = await prisma.order.findUnique({
      where: { id: String(body.sourceOrderId) },
      include: { items: true },
    });
    if (!sourceOrder) {
      return NextResponse.json({
        error: 'Source order not found'
      }, { status: 404 });
    }

    // Verify ownership (orders are keyed by the user's id).
    if (String(sourceOrder.customerId) !== String(user.mongoId || user.userId)) {
      return NextResponse.json({
        error: 'Access denied'
      }, { status: 403 });
    }

    // Create new recurring order based on the source order.
    const created = await prisma.order.create({
      data: {
        orderNumber: `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customerId: sourceOrder.customerId,
        bagId: sourceOrder.bagId,
        bagName: sourceOrder.bagName,
        subtotal: sourceOrder.subtotal,
        tax: sourceOrder.tax,
        shipping: sourceOrder.shipping,
        discount: sourceOrder.discount,
        total: sourceOrder.total,
        status: 'pending',
        paymentMethod: sourceOrder.paymentMethod,
        shippingAddress: sourceOrder.shippingAddress as Prisma.InputJsonValue,
        billingAddress:
          sourceOrder.billingAddress === null
            ? Prisma.JsonNull
            : (sourceOrder.billingAddress as Prisma.InputJsonValue),
        notes: sourceOrder.notes,
        isRecurring: data.isRecurring,
        recurrence: data.recurrence as unknown as Prisma.InputJsonValue,
        nextDeliveryAt,
        scheduleStatus: data.scheduleStatus,
        items: {
          create: sourceOrder.items.map((it) => ({
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

    return NextResponse.json({
      success: true,
      data: serializeOrder(created),
      message: 'Recurring order created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 });
    }
    console.error('Error creating recurring order:', error);
    return NextResponse.json({
      error: 'Failed to create recurring order'
    }, { status: 500 });
  }
});
