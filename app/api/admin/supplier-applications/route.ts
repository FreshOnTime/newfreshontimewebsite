import { randomUUID } from 'crypto';
import { adminDataError } from '@/lib/adminApiErrors';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdminSimple, logAuditAction } from '@/lib/middleware/adminAuth';

const statuses = ['pending','approved','rejected'] as const;
const query = z.object({ page: z.coerce.number().int().min(1).max(100000).default(1), status: z.enum(statuses).optional() });
const update = z.object({ id: z.string().min(1).max(100), version: z.number().int().min(0), status: z.enum(statuses), notes: z.string().trim().max(5000).default('') });
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });

function proposedProducts(notes: string | null) {
  const text = notes?.trim();
  if (!text) return [];
  const parts = text.includes('\n') || text.includes(';')
    ? text.split(/[\n;]+/)
    : text.split(',');
  return Array.from(new Set(parts.map(item => item.trim()).filter(Boolean))).slice(0, 100);
}

export const GET = requireAdminSimple(async request => {
  try {
    const { page, status } = query.parse(Object.fromEntries(new URL(request.url).searchParams));
    const where = status ? { applicationStatus: status } : {};
    const [applications, total] = await prisma.$transaction([
      prisma.supplier.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page-1)*20,
        take: 20,
        select: {
          id: true, name: true, contactName: true, email: true, phone: true,
          notes: true, applicationStatus: true, reviewNotes: true,
          reviewVersion: true, reviewedAt: true, createdAt: true,
        },
      }),
      prisma.supplier.count({ where }),
    ]);
    return json({
      applications: applications.map(application => ({
        ...application,
        proposedProducts: proposedProducts(application.notes),
      })),
      total,
      page,
      pages: Math.max(1, Math.ceil(total/20)),
    });
  } catch (error) {
    return error instanceof z.ZodError
      ? json({ error: 'Invalid application filters' }, 400)
      : adminDataError(error, 'Unable to load supplier applications');
  }
});

export const PATCH = requireAdminSimple(async request => {
  try {
    const { id, version, status, notes } = update.parse(await request.json());
    const outcome = await prisma.$transaction(async tx => {
      const current = await tx.supplier.findUnique({
        where: { id },
        select: { id: true, name: true, applicationStatus: true, reviewVersion: true },
      });
      if (!current || current.reviewVersion !== version) return { conflict: true as const };

      const result = await tx.supplier.updateMany({
        where: { id, reviewVersion: version },
        data: {
          applicationStatus: status,
          reviewNotes: notes,
          reviewedAt: new Date(),
          reviewVersion: { increment: 1 },
          status: status === 'approved' ? 'active' : 'inactive',
        },
      });
      if (result.count !== 1) return { conflict: true as const };

      if (current.applicationStatus !== status) {
        const accounts = await tx.user.findMany({
          where: { supplierId: id, isBanned: false },
          select: { id: true },
        });
        if (accounts.length) {
          const approved = status === 'approved';
          await tx.notification.createMany({
            data: accounts.map(account => ({
              id: randomUUID(),
              title: approved ? 'Supplier application approved' : status === 'rejected' ? 'Supplier application update' : 'Supplier application under review',
              message: approved
                ? `${current.name} is approved. Catalogue uploads and your supplier product list are now enabled.`
                : status === 'rejected'
                  ? `${current.name} was not approved at this time. Open your dashboard or contact FreshPick for next steps.`
                  : `${current.name} has been moved back to pending review.`,
              type: approved ? 'success' as const : status === 'rejected' ? 'warning' as const : 'info' as const,
              targetUserId: account.id,
              link: '/dashboard',
            })),
          });
        }
      }
      return { conflict: false as const };
    });

    if (outcome.conflict) return json({ error: 'This application changed or was removed. Refresh before saving.' }, 409);
    await logAuditAction(request.user!.userId, 'review-application', 'supplier', id, undefined, { applicationStatus: status }, request);
    return json({ success: true });
  } catch (error) {
    return error instanceof z.ZodError || error instanceof SyntaxError
      ? json({ error: 'Invalid application review' }, 400)
      : adminDataError(error, 'Unable to save this review');
  }
});
