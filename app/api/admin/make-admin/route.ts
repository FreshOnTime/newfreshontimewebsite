import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdminSimple, logAuditAction } from '@/lib/middleware/adminAuth';

const input = z.object({ userId: z.string().trim().min(1).max(200) });
const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
export const POST = requireAdminSimple(async request => {
  try {
    const { userId } = input.parse(await request.json());
    const before = await prisma.user.findFirst({ where: { OR: [{ id: userId }, { phoneNumber: userId }] } });
    if (!before) return json({ error: 'User not found' }, 404);
    if (before.isBanned) return json({ error: 'A banned account cannot be promoted' }, 409);
    const user = await prisma.user.update({ where: { id: before.id }, data: { role: 'admin' } });
    await logAuditAction(request.user!.userId, 'promote', 'user', user.id, { role: before.role }, { role: 'admin' }, request);
    return json({ success: true, message: 'User role updated to admin', data: { userId: user.id, firstName: user.firstName, role: user.role } });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return json({ error: 'A valid user ID is required' }, 400);
    return json({ error: 'Unable to update this account' }, 500);
  }
});
export const GET = requireAdminSimple(async request => {
  try {
    const { userId } = input.parse({ userId: new URL(request.url).searchParams.get('userId') });
    const user = await prisma.user.findFirst({ where: { OR: [{ id: userId }, { phoneNumber: userId }] } });
    if (!user) return json({ error: 'User not found' }, 404);
    return json({ success: true, data: { userId: user.id, firstName: user.firstName, role: user.role, isAdmin: user.role === 'admin' } });
  } catch (error) {
    return json({ error: 'Unable to retrieve this account' }, error instanceof z.ZodError ? 400 : 500);
  }
});
