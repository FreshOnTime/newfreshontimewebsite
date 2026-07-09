import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdminSimple, logAuditAction } from '@/lib/middleware/adminAuth';

interface AuthenticatedRequest extends NextRequest {
  user: {
    userId: string;
    role: string;
  };
}

const adminQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  status: z.enum(['active', 'paused', 'ended']).optional(),
  customerId: z.string().optional(),
  orderStatus: z.enum(['pending','confirmed','processing','shipped','delivered','cancelled','refunded']).optional(),
  sortBy: z.enum(['createdAt', 'nextDeliveryAt', 'updatedAt', 'orderNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

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

export const GET = requireAdminSimple(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const query = adminQuerySchema.parse({
      page: url.searchParams.get('page') || '1',
      limit: url.searchParams.get('limit') || '10',
      status: url.searchParams.get('status') || undefined,
      customerId: url.searchParams.get('customerId') || undefined,
      orderStatus: url.searchParams.get('orderStatus') || undefined,
      sortBy: url.searchParams.get('sortBy') || 'createdAt',
      sortOrder: url.searchParams.get('sortOrder') || 'desc',
      search: url.searchParams.get('search') || undefined,
      dateFrom: url.searchParams.get('dateFrom') || undefined,
      dateTo: url.searchParams.get('dateTo') || undefined,
    });

    const { page, limit, status, customerId, orderStatus, sortBy, sortOrder, search, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { isRecurring: true };
    if (status) where.scheduleStatus = status;
    if (customerId) where.customerId = customerId;
    if (orderStatus) where.status = orderStatus;
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo) } : {}),
      };
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy = { [sortBy]: sortOrder } as Prisma.OrderOrderByWithRelationInput;
    const [orders, total, allRecurring] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: { include: { product: { select: { name: true, price: true, images: true, stockQty: true, sku: true } } } }, customer: true },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
      prisma.order.findMany({ where: { isRecurring: true }, select: { scheduleStatus: true, total: true } }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const totalValue = allRecurring.reduce((sum, o) => sum + Number(o.total), 0);
    const analytics = {
      totalRecurringOrders: allRecurring.length,
      activeOrders: allRecurring.filter((o) => o.scheduleStatus === 'active').length,
      pausedOrders: allRecurring.filter((o) => o.scheduleStatus === 'paused').length,
      endedOrders: allRecurring.filter((o) => o.scheduleStatus === 'ended').length,
      totalValue,
      averageOrderValue: allRecurring.length ? totalValue / allRecurring.length : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        orders: orders.map(serializeOrder),
        pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
        analytics,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 });
    }
    console.error('Error fetching recurring orders (admin):', error);
    return NextResponse.json({ error: 'Failed to fetch recurring orders' }, { status: 500 });
  }
});

export const POST = requireAdminSimple(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const bulkActionSchema = z.object({
      action: z.enum(['pause', 'resume', 'end', 'delete']),
      orderIds: z.array(z.string()).min(1),
    });

    const { action, orderIds } = bulkActionSchema.parse(body);
    const found = await prisma.order.findMany({ where: { id: { in: orderIds }, isRecurring: true }, select: { id: true } });
    if (found.length !== orderIds.length) {
      return NextResponse.json({ error: 'Some orders were not found or are not recurring orders' }, { status: 404 });
    }

    let affected = 0;
    let result: Record<string, unknown>;
    switch (action) {
      case 'pause':
        affected = (await prisma.order.updateMany({ where: { id: { in: orderIds } }, data: { scheduleStatus: 'paused' } })).count;
        result = { modifiedCount: affected };
        break;
      case 'resume':
        affected = (await prisma.order.updateMany({ where: { id: { in: orderIds } }, data: { scheduleStatus: 'active' } })).count;
        result = { modifiedCount: affected };
        break;
      case 'end':
        affected = (await prisma.order.updateMany({ where: { id: { in: orderIds } }, data: { scheduleStatus: 'ended', nextDeliveryAt: null } })).count;
        result = { modifiedCount: affected };
        break;
      case 'delete':
        affected = (await prisma.order.deleteMany({ where: { id: { in: orderIds } } })).count;
        result = { deletedCount: affected };
        break;
    }

    await logAuditAction(
      (request as AuthenticatedRequest).user.userId,
      'bulk_update',
      'order',
      orderIds.join(','),
      { action, orderIds },
      { result },
      request
    );

    return NextResponse.json({ success: true, message: `Bulk ${action} completed successfully`, affected });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    console.error('Error performing bulk action on recurring orders:', error);
    return NextResponse.json({ error: 'Failed to perform bulk action' }, { status: 500 });
  }
});
