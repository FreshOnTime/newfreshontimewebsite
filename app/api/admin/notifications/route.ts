import { createHash, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';
import { notificationInput } from '@/lib/notificationInput';
// Preserve existing API clients while customer reading has its own endpoint.
export { GET } from '@/app/api/notifications/route';
const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
class SendConflict extends Error {}
export const POST = requireAdminSimple(async req => {
  try {
    const input = notificationInput.parse(await req.json());
    const targetUserId = input.targetUserId === 'all' ? null : input.targetUserId;
    if (targetUserId) {
      const target = await prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true, isBanned: true } });
      if (!target || target.isBanned) return json({ success: false, message: 'Active target account not found' }, 404);
    }
    const id = input.submissionId ? createHash('sha256').update(`${req.user!.userId}:${input.submissionId}`).digest('hex') : randomUUID();
    const data = { id, title: input.title, message: input.message, type: input.type, targetUserId, link: input.link };
    const result = await prisma.$transaction(async tx => {
      const inserted = await tx.notification.createMany({ data: [data], skipDuplicates: true });
      const saved = await tx.notification.findUnique({ where: { id } });
      if (!saved || saved.title !== data.title || saved.message !== data.message || saved.type !== data.type || saved.targetUserId !== data.targetUserId || saved.link !== data.link) throw new SendConflict();
      if (inserted.count) await tx.auditLog.create({ data: { userId: req.user!.userId, action: 'send_notification', resourceType: 'notification', resourceId: id, after: { targetUserId, type: input.type } } });
      return { saved, replay: inserted.count === 0 };
    });
    return json({ success: true, data: { ...result.saved, _id: id } }, result.replay ? 200 : 201);
  } catch (error) {
    if (error instanceof SendConflict) return json({ success: false, message: 'This submission identifier belongs to a different notification. Start a new submission.' }, 409);
    if (error instanceof z.ZodError || error instanceof SyntaxError) return json({ success: false, message: error instanceof z.ZodError ? error.issues[0].message : 'Invalid notification' }, 400);
    return json({ success: false, message: 'Unable to send notification. Please retry.' }, 500);
  }
});
