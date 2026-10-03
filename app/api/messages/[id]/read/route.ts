import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware/auth';

export const PUT = withAuth(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
  try {
    const { id } = await params;
    const message = await prisma.message.findUnique({ where: { id } });
    if (!message || message.recipientId !== req.user!._id) return json({ success: false, message: 'Message not found' }, 404);
    const changed = await prisma.message.updateMany({ where: { id, recipientId: req.user!._id }, data: { isRead: true } });
    if (changed.count !== 1) return json({ success: false, message: 'Message not found' }, 404);
    return json({ success: true, data: { _id: id, isRead: true } });
  } catch {
    return json({ success: false, message: 'Unable to mark this message read. Please retry.' }, 500);
  }
});
