import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

interface SupplierPayload {
  companyName: string;
  contactName: string;
  email?: string;
  phone?: string;
  address?: {
    addressLine1?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  };
  productListCsv?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SupplierPayload;
    console.log('Supplier register payload:', body);

    // Basic validation
    if (!body.companyName || !body.contactName || !body.phone) {
      return NextResponse.json({ error: 'companyName, contactName and phone are required' }, { status: 400 });
    }

    // Dedupe: reuse an existing supplier that matches by email or phone before
    // creating a new one (avoids duplicate suppliers and unique-constraint errors).
    const dedupeConditions: Prisma.SupplierWhereInput[] = [];
    if (body.email) dedupeConditions.push({ email: body.email });
    if (body.phone) dedupeConditions.push({ phone: body.phone });

    let supplier = dedupeConditions.length
      ? await prisma.supplier.findFirst({ where: { OR: dedupeConditions } })
      : null;

    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: {
          name: body.companyName,
          contactName: body.contactName,
          email: body.email || undefined,
          phone: body.phone,
          street: body.address?.addressLine1 || '',
          city: body.address?.city || '',
          state: body.address?.province || '',
          zipCode: body.address?.postalCode || '',
          country: body.address?.country || '',
          paymentTerms: 'net_30',
        },
      });
    }

    // If user is authenticated, link supplier to user account and set role.
    // Only promote a plain customer to 'supplier' — never downgrade an elevated
    // role (admin/manager/etc.).
    try {
      const authUser = await verifyToken(request);
      if (authUser) {
        await prisma.user.update({
          where: { id: authUser.userId },
          data: {
            supplierId: supplier.id,
            ...(authUser.role === 'customer' ? { role: 'supplier' as const } : {}),
          },
        });
      }
    } catch (linkErr) {
      console.warn('Failed to link supplier to user:', linkErr);
    }

    return NextResponse.json(
      { message: 'Supplier created', supplier: { ...supplier, _id: supplier.id } },
      { status: 201 }
    );
  } catch (e) {
    console.error('Supplier register error', e);
    return NextResponse.json({ error: 'Failed to register supplier' }, { status: 500 });
  }
}
