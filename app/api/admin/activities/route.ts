import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';

const querySchema = z.object({
  page: z.string().optional().transform((v) => (v ? Math.max(parseInt(v), 1) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(parseInt(v), 100) : 20)),
  resourceType: z.enum(['user', 'customer', 'supplier', 'category', 'product', 'order', 'auth']).optional(),
  action: z.string().optional(),
  userId: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  search: z.string().optional(),
});

function toActivityType(resourceType?: string | null, action?: string): string {
  if (resourceType === 'customer' && action === 'create') return 'customer_registered';
  if (resourceType === 'order' && action === 'create') return 'order_created';
  if (resourceType === 'order' && action && action !== 'create') return 'order_updated';
  if (resourceType === 'product' && action === 'create') return 'product_created';
  if (resourceType === 'product' && action && action !== 'create') return 'product_updated';
  return `${resourceType || 'activity'}_${action || 'event'}`;
}

interface AuditLogSummary {
  id: string;
  userId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  before: Prisma.JsonValue | null;
  after: Prisma.JsonValue | null;
  ip: string | null;
  userAgent: string | null;
  timestamp: Date | string;
  user?: {
    firstName: string;
    lastName: string | null;
    email: string | null;
  } | null;
}

function describeLog(log: Pick<AuditLogSummary, 'resourceType' | 'action' | 'resourceId'>): string {
  const res = log.resourceType;
  const action = log.action;
  const id = log.resourceId ? ` (${log.resourceId})` : '';
  return `${action} ${res}${id}`;
}

export const GET = requireAdminSimple(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const where: Prisma.AuditLogWhereInput = {};
    if (query.resourceType) where.resourceType = query.resourceType;
    if (query.action) where.action = { contains: query.action, mode: 'insensitive' };
    if (query.userId) where.userId = query.userId;

    const timeRange: Prisma.DateTimeFilter = {};
    if (query.from) timeRange.gte = new Date(query.from);
    if (query.to) timeRange.lte = new Date(query.to);
    if (Object.keys(timeRange).length) where.timestamp = timeRange;

    if (query.search) {
      const search = query.search;
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { resourceType: { contains: search, mode: 'insensitive' } },
        { ip: { contains: search, mode: 'insensitive' } },
        { resourceId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    const activities = logs.map((l) => {
      const u = l.user;
      const userName = u
        ? [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || String(l.userId)
        : undefined;
      const log = { ...l, _id: l.id };

      return {
        _id: l.id,
        type: toActivityType(l.resourceType, l.action),
        description: describeLog({ resourceType: l.resourceType, action: l.action, resourceId: l.resourceId }),
        timestamp: new Date(l.timestamp).toISOString(),
        userId: l.userId ?? undefined,
        userName,
        orderId: l.resourceType === 'order' ? l.resourceId ?? undefined : undefined,
        productId: l.resourceType === 'product' ? l.resourceId ?? undefined : undefined,
        log,
      };
    });

    return NextResponse.json({
      activities,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
});
