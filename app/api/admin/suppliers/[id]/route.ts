import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PaymentTerms, Supplier } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin, logAuditAction } from '@/lib/middleware/adminAuth';

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  contactName: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(3).optional(),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
  }).optional(),
  paymentTerms: z.enum(['net-15', 'net-30', 'net-60', 'net-90', 'cod', 'prepaid']).optional(),
  notes: z.string().max(1000).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// The UI uses hyphenated payment terms (net-30); the DB enum uses underscores (net_30).
function termsToDb(t: string): PaymentTerms {
  return t.replace('-', '_') as PaymentTerms;
}

function termsToApi(t: string): string {
  return t.replace('_', '-');
}

// Preserve the old API shape consumed by SupplierDialog/SuppliersPage.
function serializeSupplier(s: Supplier) {
  return {
    _id: s.id,
    name: s.name,
    contactName: s.contactName,
    email: s.email ?? '',
    phone: s.phone,
    address: {
      street: s.street ?? '',
      city: s.city ?? '',
      state: s.state ?? '',
      zipCode: s.zipCode ?? '',
      country: s.country ?? '',
    },
    paymentTerms: termsToApi(s.paymentTerms),
    notes: s.notes ?? undefined,
    status: s.status,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export const GET = requireAdmin(async (_request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  try {
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    return NextResponse.json({ supplier: serializeSupplier(supplier) });
  } catch (error) {
    console.error('Get supplier error:', error);
    return NextResponse.json({ error: 'Failed to fetch supplier' }, { status: 500 });
  }
});

export const PUT = requireAdmin(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const data = updateSchema.parse(body);
    const before = await prisma.supplier.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    // Ensure unique email if changed
    if (data.email && data.email !== before.email) {
      const exists = await prisma.supplier.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });
      if (exists) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.contactName !== undefined ? { contactName: data.contactName } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.address !== undefined
          ? {
              street: data.address.street,
              city: data.address.city,
              state: data.address.state,
              zipCode: data.address.zipCode,
              country: data.address.country,
            }
          : {}),
        ...(data.paymentTerms !== undefined ? { paymentTerms: termsToDb(data.paymentTerms) } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });

    const serializedBefore = serializeSupplier(before);
    const serializedUpdated = serializeSupplier(updated);
    await logAuditAction(
      request.user!.userId,
      'update',
      'supplier',
      id,
      serializedBefore as unknown as Record<string, unknown>,
      serializedUpdated as unknown as Record<string, unknown>,
      request
    );
    return NextResponse.json({ supplier: serializedUpdated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Update supplier error:', error);
    return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  try {
    const before = await prisma.supplier.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    await prisma.supplier.delete({ where: { id } });
    await logAuditAction(
      request.user!.userId,
      'delete',
      'supplier',
      id,
      serializeSupplier(before) as unknown as Record<string, unknown>,
      undefined,
      request
    );
    return NextResponse.json({ message: 'Supplier deleted' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 });
  }
});
