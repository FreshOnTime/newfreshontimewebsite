import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdminSimple, logAuditAction } from '@/lib/middleware/adminAuth';
const statuses = ['pending','approved','rejected'] as const;
const query = z.object({ page: z.coerce.number().int().min(1).max(100000).default(1), status: z.enum(statuses).optional() });
const update = z.object({ id: z.string().min(1).max(100), version: z.number().int().min(0), status: z.enum(statuses), notes: z.string().trim().max(5000).default('') });
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
export const GET = requireAdminSimple(async request => {
  try {
    const { page, status } = query.parse(Object.fromEntries(new URL(request.url).searchParams));
    const where = status ? { applicationStatus: status } : {};
    const [applications, total] = await prisma.$transaction([prisma.supplier.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (page-1)*20, take: 20, select: { id: true, name: true, contactName: true, email: true, phone: true, notes: true, applicationStatus: true, reviewNotes: true, reviewVersion: true, reviewedAt: true, createdAt: true } }), prisma.supplier.count({ where })]);
    return json({ applications, total, page, pages: Math.max(1, Math.ceil(total/20)) });
  } catch (error) { return json({ error: 'Unable to load supplier applications' }, error instanceof z.ZodError ? 400 : 500); }
});
export const PATCH = requireAdminSimple(async request => {
  try {
    const { id, version, status, notes } = update.parse(await request.json());
    const result = await prisma.supplier.updateMany({ where: { id, reviewVersion: version }, data: { applicationStatus: status, reviewNotes: notes, reviewedAt: new Date(), reviewVersion: { increment: 1 }, status: status === 'approved' ? 'active' : 'inactive' } });
    if (result.count !== 1) return json({ error: 'This application changed or was removed. Refresh before saving.' }, 409);
    await logAuditAction(request.user!.userId, 'review-application', 'supplier', id, undefined, { applicationStatus: status }, request);
    return json({ success: true });
  } catch (error) { return json({ error: 'Unable to save this review' }, error instanceof z.ZodError || error instanceof SyntaxError ? 400 : 500); }
});
