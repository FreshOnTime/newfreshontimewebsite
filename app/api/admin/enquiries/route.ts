import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';
import { enquiryStatuses, enquirySources, enquiryTypes } from '@/lib/contactEnquiries';

export const dynamic = 'force-dynamic';
const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  status: z.enum(enquiryStatuses).optional(), source: z.enum(enquirySources).optional(), type: z.enum(enquiryTypes).optional(),
  q: z.string().trim().max(200).default(''),
});
const updateSchema = z.object({
  id: z.string().uuid(), version: z.number().int().min(0), status: z.enum(enquiryStatuses), internalNotes: z.string().trim().max(5000),
});
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });

export const GET = requireAdminSimple(async (request: NextRequest) => {
  try {
    const input = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const where: Prisma.ContactEnquiryWhereInput = { status: input.status, source: input.source, type: input.type };
    if (input.q) {
      const term = input.q.replace(/^FP-/i, '');
      where.OR = ['id','name','email','subject','message','orderId'].map(field => ({ [field]: { contains: term, mode: 'insensitive' as const } }));
    }
    const take = 20;
    const [enquiries, total] = await prisma.$transaction([
      prisma.contactEnquiry.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (input.page-1)*take, take, select: { id: true, name: true, email: true, subject: true, message: true, type: true, source: true, priority: true, orderId: true, status: true, internalNotes: true, version: true, createdAt: true, updatedAt: true } }),
      prisma.contactEnquiry.count({ where }),
    ]);
    return json({ enquiries, total, page: input.page, pages: Math.max(1, Math.ceil(total/take)) });
  } catch (error) {
    if (error instanceof z.ZodError) return json({ error: 'Invalid enquiry filters.' }, 400);
    return json({ error: 'Unable to load enquiries. Please retry.' }, 500);
  }
});

export const PATCH = requireAdminSimple(async (request: NextRequest) => {
  try {
    const { id, version, ...data } = updateSchema.parse(await request.json());
    const result = await prisma.contactEnquiry.updateMany({ where: { id, version }, data: { ...data, version: { increment: 1 } } });
    if (result.count !== 1) {
      const existing = await prisma.contactEnquiry.findUnique({ where: { id }, select: { id: true } });
      return json({ error: existing ? 'This enquiry was updated by another admin. Refresh before saving again.' : 'Enquiry not found.' }, existing ? 409 : 404);
    }
    const enquiry = await prisma.contactEnquiry.findUnique({ where: { id }, select: { id: true, name: true, email: true, subject: true, message: true, type: true, source: true, priority: true, orderId: true, status: true, internalNotes: true, version: true, createdAt: true, updatedAt: true } });
    return json({ enquiry });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return json({ error: 'Invalid enquiry update.' }, 400);
    return json({ error: 'Unable to save the enquiry. Please retry.' }, 500);
  }
});
