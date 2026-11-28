import { randomUUID } from 'crypto';
import { adminDataError } from '@/lib/adminApiErrors';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';

const statuses = ['pending','approved','rejected'] as const;
const query = z.object({ page: z.coerce.number().int().min(1).max(100000).default(1), status: z.enum(statuses).optional(), id: z.string().min(1).max(100).optional() });
const update = z.object({ id: z.string().min(1).max(100), version: z.number().int().min(0), status: z.enum(statuses), confirmed:z.boolean().optional(), notes: z.string().trim().max(5000).default('') });
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
    const { page, status, id } = query.parse(Object.fromEntries(new URL(request.url).searchParams));
    const where = { ...(status ? { applicationStatus: status } : {}), ...(id ? { id } : {}) };
    const [applications, total] = await prisma.$transaction([
      prisma.supplier.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page-1)*20,
        take: 20,
        select: {
          id: true, name: true, contactName: true, email: true, phone: true, city: true,country:true,businessType:true,businessSpecialties:true,businessOfferingLabels:true,
          notes: true, applicationStatus: true, reviewNotes: true,
          reviewVersion: true, reviewedAt: true, createdAt: true, status:true,makerPublished:true,products:{select:{isEmailVerified:true,isBanned:true}},
        },
      }),
      prisma.supplier.count({ where }),
    ]);
    return json({
      applications: applications.map(({products,...application}) => ({
        ...application, linkedAccounts:products.length, verifiedAccounts:products.filter(u=>u.isEmailVerified&&!u.isBanned).length,
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
    const { id, version, status, notes,confirmed } = update.parse(await request.json());
    const outcome = await prisma.$transaction(async tx => {
      const current = await tx.supplier.findUnique({
        where: { id },
        select: { id: true, name: true, applicationStatus: true, reviewVersion: true },
      });
      if (!current || current.reviewVersion !== version) return { conflict: true as const };

      if(status==='approved'&&current.applicationStatus!=='approved'&&(!confirmed||!notes.trim()))return {conflict:false as const,verificationRequired:true as const};
      const result = await tx.supplier.updateMany({
        where: { id, reviewVersion: version },
        data: {
          applicationStatus: status,
          reviewNotes: notes,
          reviewedAt: new Date(),
          reviewVersion: { increment: 1 },
          status: status === 'approved' ? 'active' : 'inactive',
          ...(status!=='approved'?{makerPublished:false}:{}),
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
              title: approved ? 'Maker page approved' : status === 'rejected' ? 'Maker page update' : 'Maker page under review',
              message: approved
                ? `${current.name} is approved. Open Business Studio to publish your profile, offerings and articles.`
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
      await tx.auditLog.create({data:{userId:request.user!.userId,action:'review-application',resourceType:'supplier',resourceId:id,before:{applicationStatus:current.applicationStatus,reviewVersion:current.reviewVersion},after:{applicationStatus:status,reviewVersion:version+1}}});
      return { conflict: false as const, application: { id, applicationStatus: status, status: status === 'approved' ? 'active' : 'inactive', reviewVersion: version + 1 } };
    }, { maxWait: 10000, timeout: 15000 });

    if ('verificationRequired' in outcome&&outcome.verificationRequired)return json({error:'Confirm the business identity and contact details and record review evidence before approving.'},400);
    if (outcome.conflict) return json({ error: 'This application changed or was removed. Refresh before saving.' }, 409);
    return json({ success: true, application: outcome.application });
  } catch (error) {
    return error instanceof z.ZodError || error instanceof SyntaxError
      ? json({ error: 'Invalid application review' }, 400)
      : adminDataError(error, 'Unable to save this review');
  }
});
