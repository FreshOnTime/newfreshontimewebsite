import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { phoneSchema } from '@/lib/utils/validation';
import { withRateLimit } from '@/lib/utils/rateLimit';

const supplierSchema = z.object({
  companyName: z.string().trim().min(1).max(150),
  contactName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().optional().or(z.literal('')),
  phone: phoneSchema,
  address: z.object({
    addressLine1: z.string().trim().min(1), city: z.string().trim().min(1),
    province: z.string().trim().min(1), postalCode: z.string().trim().min(1),
    country: z.string().trim().min(1),
  }),
  productListCsv: z.string().max(10000).optional(),
  productList: z.string().max(10000).optional(),
});

class RegistrationError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function handleRegister(request: NextRequest) {
  try {
    const auth = await verifyToken(request);
    if (!auth) return NextResponse.json({ error: 'Sign in before applying as a supplier' }, { status: 401 });
    const parsed = supplierSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Check your business and contact details', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    const body = parsed.data;

    const result = await prisma.$transaction(async tx => {
      const user = await tx.user.findUnique({ where: { id: auth.userId }, select: { id: true, role: true, supplierId: true, isBanned: true } });
      if (!user || user.isBanned) throw new RegistrationError('Sign in before applying as a supplier', 401);
      // A retry can reuse this account's link, never claim another supplier by contact details.
      if (user.supplierId) {
        const supplier = await tx.supplier.findUnique({ where: { id: user.supplierId } });
        if (!supplier) throw new RegistrationError('Your supplier link needs support. Contact FreshPick.', 409);
        return { supplier, created: false };
      }
      const existing = await tx.supplier.findFirst({ where: { OR: [{ phone: body.phone }, ...(body.email ? [{ email: body.email }] : [])] } });
      if (existing) throw new RegistrationError('A supplier with these contact details already exists. Contact FreshPick to link your account.', 409);
      const supplier = await tx.supplier.create({ data: {
        name: body.companyName, contactName: body.contactName, email: body.email || undefined,
        phone: body.phone, street: body.address.addressLine1, city: body.address.city,
        state: body.address.province, zipCode: body.address.postalCode, country: body.address.country,
        status: 'inactive', applicationStatus: 'pending', paymentTerms: 'net_30', notes: body.productListCsv || body.productList || undefined,
      } });
      const link = await tx.user.updateMany({ where: { id: user.id, supplierId: null }, data: { supplierId: supplier.id, ...(user.role === 'customer' ? { role: 'supplier' as const } : {}) } });
      if (link.count !== 1) throw new RegistrationError('Your supplier account changed. Retry to load its current link.', 409);
      return { supplier, created: true };
    });
    return NextResponse.json({ message: result.created ? 'Supplier application saved' : 'Supplier account already linked', supplier: { ...result.supplier, _id: result.supplier.id } }, { status: result.created ? 201 : 200 });
  } catch (error) {
    if (error instanceof RegistrationError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') return NextResponse.json({ error: 'These supplier contact details are already registered. Contact FreshPick for help.' }, { status: 409 });
    console.error('Supplier registration failed');
    return NextResponse.json({ error: 'Unable to save your supplier application. Please retry.' }, { status: 500 });
  }
}

export const POST = withRateLimit(handleRegister, 'auth');
