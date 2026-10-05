import { randomUUID } from 'crypto';
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

async function notifyAdmins(supplierId: string, supplierName: string, updated: boolean) {
  try {
    const admins = await prisma.user.findMany({
      where: {
        isBanned: false,
        OR: [{ role: 'admin' }, { secondaryRoles: { has: 'admin' } }],
      },
      select: { id: true },
    });
    if (!admins.length) return;
    await prisma.notification.createMany({
      data: admins.map(admin => ({
        id: randomUUID(),
        title: updated ? 'Supplier application updated' : 'New supplier application',
        message: `${supplierName} submitted supplier details and a proposed product list for review.`,
        type: 'info' as const,
        targetUserId: admin.id,
        link: '/admin/supplier-applications',
      })),
    });
  } catch (error) {
    console.error('Supplier application admin notification failed', error);
  }
}

async function handleRegister(request: NextRequest) {
  try {
    const auth = await verifyToken(request);
    if (!auth) return NextResponse.json({ error: 'Sign in before applying as a supplier' }, { status: 401 });
    const parsed = supplierSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Check your business and contact details', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    const body = parsed.data;
    const productNotes = (body.productListCsv || body.productList || '').trim() || undefined;

    const result = await prisma.$transaction(async tx => {
      const user = await tx.user.findUnique({ where: { id: auth.userId }, select: { id: true, role: true, supplierId: true, isBanned: true } });
      if (!user || user.isBanned) throw new RegistrationError('Sign in before applying as a supplier', 401);

      // An already-linked pending supplier can return to the application and
      // complete/correct the proposed catalogue instead of silently discarding it.
      if (user.supplierId) {
        const supplier = await tx.supplier.findUnique({ where: { id: user.supplierId } });
        if (!supplier) throw new RegistrationError('Your supplier link needs support. Contact FreshPick.', 409);
        if (supplier.applicationStatus === 'pending') {
          const updated = await tx.supplier.update({
            where: { id: supplier.id },
            data: {
              name: body.companyName,
              contactName: body.contactName,
              email: body.email || null,
              phone: body.phone,
              street: body.address.addressLine1,
              city: body.address.city,
              state: body.address.province,
              zipCode: body.address.postalCode,
              country: body.address.country,
              ...(productNotes !== undefined ? { notes: productNotes } : {}),
            },
          });
          return { supplier: updated, created: false, updated: true };
        }
        return { supplier, created: false, updated: false };
      }

      const existing = await tx.supplier.findFirst({ where: { OR: [{ phone: body.phone }, ...(body.email ? [{ email: body.email }] : [])] } });
      if (existing) throw new RegistrationError('A supplier with these contact details already exists. Contact FreshPick to link your account.', 409);
      const supplier = await tx.supplier.create({ data: {
        name: body.companyName, contactName: body.contactName, email: body.email || undefined,
        phone: body.phone, street: body.address.addressLine1, city: body.address.city,
        state: body.address.province, zipCode: body.address.postalCode, country: body.address.country,
        status: 'inactive', applicationStatus: 'pending', paymentTerms: 'net_30', notes: productNotes,
      } });
      const link = await tx.user.updateMany({ where: { id: user.id, supplierId: null }, data: { supplierId: supplier.id, ...(user.role === 'customer' ? { role: 'supplier' as const } : {}) } });
      if (link.count !== 1) throw new RegistrationError('Your supplier account changed. Retry to load its current link.', 409);
      return { supplier, created: true, updated: false };
    });

    if (result.created || result.updated) {
      await notifyAdmins(result.supplier.id, result.supplier.name, result.updated);
    }

    const message = result.created
      ? 'Supplier application saved'
      : result.updated
        ? 'Supplier application updated'
        : 'Supplier account already linked';
    return NextResponse.json({ message, supplier: { ...result.supplier, _id: result.supplier.id } }, { status: result.created ? 201 : 200 });
  } catch (error) {
    if (error instanceof RegistrationError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') return NextResponse.json({ error: 'These supplier contact details are already registered. Contact FreshPick for help.' }, { status: 409 });
    console.error('Supplier registration failed', error);
    return NextResponse.json({ error: 'Unable to save your supplier application. Please retry.' }, { status: 500 });
  }
}

export const POST = withRateLimit(handleRegister, 'auth');
