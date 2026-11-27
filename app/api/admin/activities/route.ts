import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  resourceType: z.string().trim().min(1).max(64).regex(/^[a-z][a-z0-9_-]*$/i).optional(),
  action: z.string().trim().max(200).optional(),
  userId: z.string().trim().max(200).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  search: z.string().trim().max(200).optional(),
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
        orderBy: [{ timestamp: 'desc' },{id:'desc'}],
        skip,
        take: limit,
        select: {
          id:true,userId:true,action:true,resourceType:true,resourceId:true,ip:true,userAgent:true,timestamp:true,
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
      const log = { _id:l.id, action:l.action,resourceType:l.resourceType,resourceId:l.resourceId,ip:l.ip,userAgent:l.userAgent };

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
      pagination: { page, limit, total, pages: Math.max(1,Math.ceil(total / limit)) }
    },{headers:{'Cache-Control':'private, no-store'}});
  } catch (error) {
    if(error instanceof z.ZodError)return NextResponse.json({error:'Invalid audit filters'},{status:400,headers:{'Cache-Control':'private, no-store'}});
    console.error('Get activities error:', error instanceof Error?error.name:'Error');
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500,headers:{'Cache-Control':'private, no-store'} });
  }
});
