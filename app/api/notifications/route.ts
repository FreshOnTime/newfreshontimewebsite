import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware/auth';
import { safeNotificationLink } from '@/lib/notificationInput';
const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
const filters = z.object({ page: z.coerce.number().int().min(1).max(100000).default(1), limit: z.coerce.number().int().min(1).max(50).default(20), unread: z.enum(['true', 'false']).optional() });
const scope = (userId: string) => ({ OR: [{ targetUserId: userId }, { targetUserId: null }] });
const get = withAuth(async req => {
  try {
    const { page, limit, unread } = filters.parse(Object.fromEntries(new URL(req.url).searchParams));
    const userId = req.user!._id;
    const unreadWhere = { ...scope(userId), readReceipts: { none: { userId } } };
    const where = unread === 'true' ? unreadWhere : scope(userId);
    const [rows, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where, include: { readReceipts: { where: { userId }, select: { readAt: true } } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (page - 1) * limit, take: limit }),
      prisma.notification.count({ where }), prisma.notification.count({ where: unreadWhere }),
    ]);
    return json({ success: true, data: rows.map(row => ({ id: row.id, _id: row.id, title: row.title, message: row.message, type: row.type, createdAt: row.createdAt, isRead: row.readReceipts.length > 0, link: safeNotificationLink(row.link) })), unreadCount, pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (error) {
    return json({ success: false, message: error instanceof z.ZodError ? 'Invalid notification filters' : 'Unable to load notifications. Please retry.' }, error instanceof z.ZodError ? 400 : 500);
  }
});
const patch = withAuth(async req => {
  try {
    const { ids } = z.object({ ids: z.array(z.string().min(1).max(100)).min(1).max(50) }).parse(await req.json());
    const uniqueIds = [...new Set(ids)], userId = req.user!._id;
    const found = await prisma.notification.findMany({ where: { ...scope(userId), id: { in: uniqueIds } }, select: { id: true } });
    if (found.length !== uniqueIds.length) return json({ success: false, message: 'Notification not found' }, 404);
    await prisma.notificationRead.createMany({ data: found.map(row => ({ notificationId: row.id, userId })), skipDuplicates: true });
    return json({ success: true });
  } catch (error) {
    return json({ success: false, message: error instanceof z.ZodError || error instanceof SyntaxError ? 'Choose up to 50 notifications' : 'Unable to mark notifications read. Please retry.' }, error instanceof z.ZodError || error instanceof SyntaxError ? 400 : 500);
  }
});
export async function GET(req: NextRequest) { const response = await get(req); response.headers.set('Cache-Control', 'private, no-store'); return response; }
export async function PATCH(req: NextRequest) { const response = await patch(req); response.headers.set('Cache-Control', 'private, no-store'); return response; }
