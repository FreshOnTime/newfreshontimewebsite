import { NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/database';
import AuditLog from '@/lib/models/AuditLog';
import User from '@/lib/models/User';
import { requireAdmin } from '@/lib/middleware/adminAuth';

const querySchema = z.object({
  page: z.string().optional().transform((v) => (v ? Math.max(parseInt(v), 1) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(parseInt(v), 100) : 20)),
  resourceType: z.enum(['user','customer','supplier','category','product','order','auth']).optional(),
  action: z.string().optional(),
  userId: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  search: z.string().optional(),
});

function toActivityType(resourceType?: string, action?: string): string {
  if (resourceType === 'customer' && action === 'create') return 'customer_registered';
  if (resourceType === 'order' && action === 'create') return 'order_created';
  if (resourceType === 'order' && action && action !== 'create') return 'order_updated';
  if (resourceType === 'product' && action === 'create') return 'product_created';
  if (resourceType === 'product' && action && action !== 'create') return 'product_updated';
  return `${resourceType || 'activity'}_${action || 'event'}`;
}

type ResourceType = 'user' | 'customer' | 'supplier' | 'category' | 'product' | 'order' | 'auth';

interface LeanAuditLog {
  _id: unknown;
  userId: unknown;
  action: string;
  resourceType: ResourceType;
  resourceId?: unknown;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  timestamp: Date | string;
}

function describeLog(log: Pick<LeanAuditLog, 'resourceType' | 'action' | 'resourceId'>): string {
  const res = log.resourceType;
  const action = log.action;
  const id = log.resourceId ? ` (${String(log.resourceId)})` : '';
  return `${action} ${res}${id}`;
}

export const GET = requireAdmin(async (request) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

  const filter: Record<string, unknown> = {};
    if (query.resourceType) filter.resourceType = query.resourceType;
    if (query.action) filter.action = { $regex: query.action, $options: 'i' };
    if (query.userId) filter.userId = query.userId;

  const timeRange: Record<string, unknown> = {};
    if (query.from) timeRange.$gte = new Date(query.from);
    if (query.to) timeRange.$lte = new Date(query.to);
    if (Object.keys(timeRange).length) filter.timestamp = timeRange;

    if (query.search) {
      const search = query.search;
      filter.$or = [
        { action: { $regex: search, $options: 'i' } },
        { resourceType: { $regex: search, $options: 'i' } },
        { ip: { $regex: search, $options: 'i' } },
      ];
      // If looks like an objectId, also search by resourceId
      if (/^[a-f\d]{24}$/i.test(search)) {
        filter.$or.push({ resourceId: search });
      }
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean<LeanAuditLog[]>(),
      AuditLog.countDocuments(filter as Record<string, never>),
    ]);

    // Join users for names
    const userIds = Array.from(new Set(logs.map((l) => String(l.userId))));
    type MinimalUser = { _id: unknown; firstName?: string; lastName?: string; email?: string };
    const users = await User.find({ _id: { $in: userIds } }, { firstName: 1, lastName: 1, email: 1 }).lean<MinimalUser[]>();
    const userMap = new Map<string, { firstName?: string; lastName?: string; email?: string }>(
      users.map((u) => [String(u._id), { firstName: u.firstName, lastName: u.lastName, email: u.email }])
    );

    const activities = logs.map((l) => {
      const u = userMap.get(String(l.userId));
      const userName = u ? [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || String(l.userId) : undefined;
      return {
        _id: String(l._id),
        type: toActivityType(l.resourceType, l.action),
        description: describeLog({ resourceType: l.resourceType, action: l.action, resourceId: l.resourceId }),
        timestamp: new Date(l.timestamp).toISOString(),
        userId: String(l.userId),
        userName,
        orderId: l.resourceType === 'order' ? String(l.resourceId ?? '') : undefined,
        productId: l.resourceType === 'product' ? String(l.resourceId ?? '') : undefined,
        log: l,
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
