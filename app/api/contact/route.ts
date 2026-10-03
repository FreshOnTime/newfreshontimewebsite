import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { contactSchema } from '@/lib/contactEnquiries';
import { isRateLimited, makeKey } from '@/lib/middleware/rateLimiter';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  if (isRateLimited(makeKey('contact-enquiry', ip), 6, 10 * 60 * 1000)) return NextResponse.json({ ok: false, error: 'Too many enquiries. Please try again in a few minutes.' }, { status: 429, headers: { 'Retry-After': '600' } });
  try {
    const { submissionId = randomUUID(), ...data } = contactSchema.parse(await request.json());
    try {
      const saved = await prisma.contactEnquiry.create({ data: { submissionId, ...data }, select: { id: true } });
      return NextResponse.json({ ok: true, enquiryId: saved.id }, { status: 201 });
    } catch (error) {
      if ((error as { code?: string }).code !== 'P2002') throw error;
      const existing = await prisma.contactEnquiry.findUnique({ where: { submissionId } });
      if (existing && Object.entries(data).every(([key,value]) => existing[key as keyof typeof existing] === value)) return NextResponse.json({ ok: true, enquiryId: existing.id });
      return NextResponse.json({ ok: false, error: 'This enquiry changed. Please submit it again.' }, { status: 409 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ ok: false, error: error.issues[0]?.message || 'Check your enquiry details.' }, { status: 400 });
    if (error instanceof SyntaxError) return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
    console.error('[Contact] Enquiry could not be saved.');
    return NextResponse.json({ ok: false, error: 'Your enquiry could not be saved. Please retry.' }, { status: 500 });
  }
}
