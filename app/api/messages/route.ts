import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware/auth';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';
import { saveAccountMessages, MessageWriteError } from '@/lib/accountMessages';

const privateHeaders = { 'Cache-Control': 'private, no-store' };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: privateHeaders });
const sendSchema = z.object({
  recipientId: z.string().trim().min(1).max(100).optional(),
  supplierId: z.string().trim().min(1).max(100).optional(),
  subject: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(5000),
  submissionId: z.string().uuid().optional(),
}).refine(data => Boolean(data.recipientId) !== Boolean(data.supplierId), 'Choose an account or a producer');
const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  q: z.string().trim().max(200).default(''),
  unread: z.enum(['true', 'false']).optional(),
});

export const POST = requireAdminSimple(async req => {
  try {
    const data = sendSchema.parse(await req.json());
    const recipients = data.supplierId
      ? await prisma.user.findMany({ where: { supplierId: data.supplierId, isBanned: false }, select: { id: true }, take: 101 })
      : await prisma.user.findMany({ where: { id: data.recipientId, isBanned: false }, select: { id: true }, take: 1 });
    if (!recipients.length) return json({ success: false, message: data.supplierId ? 'This producer has no active linked FreshPick account. Contact them using their listed contact details.' : 'Recipient account not found' }, 404);
    if (recipients.length > 100) return json({ success: false, message: 'Choose an individual recipient for this producer.' }, 400);
    const result = await prisma.$transaction(tx => saveAccountMessages(tx, { submissionId: data.submissionId || randomUUID(), senderId: req.user!.userId, recipientIds: recipients.map(user => user.id), subject: data.subject, content: data.content }));
    return json({ success: true, sent: result.messages.length, data: { ...result.messages[0], _id: result.messages[0].id } }, result.replay ? 200 : 201);
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return json({ success: false, message: error instanceof z.ZodError ? error.issues[0].message : 'Invalid message' }, 400);
    if (error instanceof MessageWriteError) return json({ success: false, message: error.message }, error.status);
    return json({ success: false, message: 'Unable to send this message. Please retry.' }, 500);
  }
});

export const GET = withAuth(async req => {
  try {
    const query = querySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
    const where = { recipientId: req.user!._id, ...(query.unread === 'true' ? { isRead: false } : {}), ...(query.q ? { OR: [{ subject: { contains: query.q, mode: 'insensitive' as const } }, { content: { contains: query.q, mode: 'insensitive' as const } }] } : {}) };
    const [messages, total] = await Promise.all([
      prisma.message.findMany({ where, include: { sender: { select: { id: true, firstName: true, lastName: true } } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (query.page - 1) * query.limit, take: query.limit }),
      prisma.message.count({ where }),
    ]);
    return json({ success: true, data: messages.map(({ sender, ...message }) => ({ ...message, _id: message.id, sender: sender ? { ...sender, _id: sender.id } : null })), pagination: { page: query.page, limit: query.limit, total, pages: Math.max(1, Math.ceil(total / query.limit)) } });
  } catch (error) {
    if (error instanceof z.ZodError) return json({ success: false, message: 'Invalid message filters' }, 400);
    return json({ success: false, message: 'Unable to load messages. Please retry.' }, 500);
  }
});
