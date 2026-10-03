import { adminDataError } from '@/lib/adminApiErrors';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma, PaymentTerms, Supplier } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdminSimple, logAuditAction } from '@/lib/middleware/adminAuth';

const supplierSchema = z.object({
  name: z.string().min(1).max(200),
  contactName: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().min(3),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
  }),
  paymentTerms: z.enum(['net-15', 'net-30', 'net-60', 'net-90', 'cod', 'prepaid']).default('net-30'),
  notes: z.string().max(1000).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).default(20).transform(value => Math.min(value, 100)),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// The UI uses hyphenated payment terms (net-30); the DB enum uses underscores (net_30).
function termsToDb(t: string): PaymentTerms {
  return t.replace('-', '_') as PaymentTerms;
}
function termsToApi(t: string): string {
  return t.replace('_', '-');
}

// Map a Prisma Supplier row back to the shape the old Mongoose route returned
// (nested `address` object, hyphenated `paymentTerms`, `_id`).
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
    applicationStatus: s.applicationStatus,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export const GET = requireAdminSimple(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const where: Prisma.SupplierWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.supplier.count({ where }),
    ]);

    return NextResponse.json({
      suppliers: suppliers.map(serializeSupplier),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid supplier filters' }, { status: 400 });
    return adminDataError(error, 'Failed to fetch suppliers. Please try again.');
  }
});

export const POST = requireAdminSimple(async (request) => {
  try {
    const body = await request.json();
    const data = supplierSchema.parse(body);

    const existing = await prisma.supplier.findFirst({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: 'Supplier with this email already exists' }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        street: data.address.street,
        city: data.address.city,
        state: data.address.state,
        zipCode: data.address.zipCode,
        country: data.address.country,
        paymentTerms: termsToDb(data.paymentTerms),
        notes: data.notes ?? null,
        status: data.status,
      },
    });

    const serialized = serializeSupplier(supplier);
    await logAuditAction(
      request.user!.userId,
      'create',
      'supplier',
      supplier.id,
      undefined,
      serialized as unknown as Record<string, unknown>,
      request
    );
    return NextResponse.json({ supplier: serialized }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return adminDataError(error, 'Failed to create supplier');
  }
});
