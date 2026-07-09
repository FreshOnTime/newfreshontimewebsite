import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdminSimple, logAuditAction } from '@/lib/middleware/adminAuth';

export const dynamic = 'force-dynamic';

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

const querySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(parseInt(v), 100) : 20)),
  status: z.enum(['pending','confirmed','processing','shipped','delivered','cancelled','refunded']).optional(),
  search: z.string().optional(),
  isRecurring: z.string().optional(),
  scheduleStatus: z.enum(['active','paused','ended']).optional(),
  sort: z.enum(['created-desc','created-asc','next-asc','next-desc']).optional(),
  customerId: z.string().optional(),
  userId: z.string().optional(),
});

export const GET = requireAdminSimple(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.search) where.orderNumber = { contains: query.search, mode: 'insensitive' };
    if (query.isRecurring === 'true') where.isRecurring = true;
    if (query.isRecurring === 'false') where.isRecurring = false;
    if (query.scheduleStatus) where.scheduleStatus = query.scheduleStatus;
    if (query.customerId || query.userId) where.customerId = query.customerId || query.userId;

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    let orderBy: Prisma.OrderOrderByWithRelationInput | Prisma.OrderOrderByWithRelationInput[];
    switch (query.sort) {
      case 'created-asc':
        orderBy = { createdAt: 'asc' };
        break;
      case 'next-asc':
        orderBy = [{ nextDeliveryAt: 'asc' }, { createdAt: 'desc' }];
        break;
      case 'next-desc':
        orderBy = [{ nextDeliveryAt: 'desc' }, { createdAt: 'desc' }];
        break;
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, orderBy, skip, take: limit, include: ORDER_INCLUDE }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders: orders.map(serializeOrder),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
});

const createOrderSchema = z.object({
  customerId: z.string().min(1, 'customerId is required'),
  items: z.array(z.object({
    productId: z.string().min(1),
    sku: z.string().min(1),
    name: z.string().min(1),
    qty: z.number().int().min(1),
    price: z.number().min(0),
    total: z.number().min(0),
  })).min(1),
  subtotal: z.number().min(0),
  tax: z.number().min(0).default(0),
  shipping: z.number().min(0).default(0),
  discount: z.number().min(0).optional().default(0),
  total: z.number().min(0),
  paymentMethod: z.enum(['card', 'cash', 'bank_transfer', 'digital_wallet']),
  paymentStatus: z.enum(['pending','paid','failed','refunded']).optional().default('pending'),
  shippingAddress: z.record(z.unknown()),
  billingAddress: z.record(z.unknown()).optional(),
  notes: z.string().max(1000).optional(),
  bagId: z.string().optional(),
  bagName: z.string().optional(),
  isRecurring: z.boolean().optional().default(false),
  scheduleStatus: z.enum(['active','paused','ended']).optional(),
  nextDeliveryAt: z.string().datetime().optional(),
  recurrence: z.record(z.unknown()).optional(),
});

export const POST = requireAdminSimple(async (request) => {
  try {
    const body = await request.json();
    const data = createOrderSchema.parse(body);

    const customer = await prisma.user.findUnique({ where: { id: data.customerId } });
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    const orderNumber = `ADM-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const created = await prisma.order.create({
      data: {
        orderNumber,
        customerId: data.customerId,
        bagId: data.bagId || null,
        bagName: data.bagName || null,
        subtotal: data.subtotal,
        tax: data.tax,
        shipping: data.shipping,
        discount: data.discount ?? 0,
        total: data.total,
        status: 'pending',
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus ?? 'pending',
        shippingAddress: data.shippingAddress as Prisma.InputJsonValue,
        billingAddress: (data.billingAddress ?? data.shippingAddress) as Prisma.InputJsonValue,
        notes: data.notes ?? null,
        isRecurring: data.isRecurring,
        scheduleStatus: data.isRecurring ? (data.scheduleStatus ?? 'active') : null,
        nextDeliveryAt: data.nextDeliveryAt ? new Date(data.nextDeliveryAt) : null,
        recurrence: data.recurrence ? (data.recurrence as Prisma.InputJsonValue) : Prisma.JsonNull,
        items: { create: data.items },
      },
      include: ORDER_INCLUDE,
    });

    const serialized = serializeOrder(created);
    await logAuditAction(request.user!.userId, 'create', 'order', created.id, undefined, serialized, request);

    return NextResponse.json({ order: serialized }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
});
