import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin, logAuditAction } from '@/lib/middleware/adminAuth';

const updateCustomerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }).optional(),
  notes: z.string().max(1000).optional(),
});

// A customer is a User with role 'customer'.
const customerUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  role: true,
  createdAt: true,
  addresses: {
    where: { isRegistration: true },
    take: 1,
    select: {
      id: true,
      streetAddress: true,
      city: true,
      state: true,
      postalCode: true,
      countryCode: true,
    },
  },
} satisfies Prisma.UserSelect;

type CustomerUser = Prisma.UserGetPayload<{ select: typeof customerUserSelect }>;

function toCustomerShape(
  u: CustomerUser,
  stats?: { totalOrders: number; totalSpent: number; lastOrderDate: Date | null }
) {
  const reg = u.addresses[0];
  return {
    _id: u.id,
    name: `${u.firstName} ${u.lastName ?? ''}`.trim(),
    email: u.email || '',
    phone: u.phoneNumber,
    address: reg
      ? {
          street: reg.streetAddress || '',
          city: reg.city || '',
          state: reg.state || '',
          zipCode: reg.postalCode || '',
          country: reg.countryCode || '',
        }
      : undefined,
    totalOrders: stats?.totalOrders ?? 0,
    totalSpent: stats?.totalSpent ?? 0,
    lastOrderDate: stats?.lastOrderDate ?? undefined,
    createdAt: u.createdAt,
    source: 'user' as const,
  };
}

async function getOrderStats(customerId: string) {
  const agg = await prisma.order.aggregate({
    where: { customerId },
    _count: { _all: true },
    _sum: { total: true },
    _max: { createdAt: true },
  });
  return {
    totalOrders: agg._count._all,
    totalSpent: Number(agg._sum.total ?? 0),
    lastOrderDate: agg._max.createdAt,
  };
}

// GET /api/admin/customers/[id]
export const GET = requireAdmin(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  try {
    const user = await prisma.user.findUnique({ where: { id }, select: customerUserSelect });
    if (!user || user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const stats = await getOrderStats(id);
    return NextResponse.json({ customer: toCustomerShape(user, stats) });
  } catch (error) {
    console.error('Get customer error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
});

// PUT /api/admin/customers/[id]
export const PUT = requireAdmin(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const data = updateCustomerSchema.parse(body);

    const original = await prisma.user.findUnique({ where: { id }, select: customerUserSelect });
    if (!original || original.role !== 'customer') {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if email already exists (if being updated)
    if (data.email && data.email !== original.email) {
      const existing = await prisma.user.findFirst({ where: { email: data.email, NOT: { id } } });
      if (existing) {
        return NextResponse.json(
          { error: 'Customer with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Split display name into first/last for the User model.
    let firstName: string | undefined;
    let lastName: string | null | undefined;
    if (data.name !== undefined) {
      const parts = data.name.trim().split(/\s+/);
      firstName = parts.shift() || data.name.trim();
      lastName = parts.length ? parts.join(' ') : null;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email: data.email,
        phoneNumber: data.phone,
      },
      select: customerUserSelect,
    });

    // Update (or create) the registration address if one was supplied.
    if (data.address) {
      const reg = original.addresses[0];
      const addrData = {
        streetAddress: data.address.street || '',
        town: data.address.city || '',
        city: data.address.city || '',
        state: data.address.state || '',
        postalCode: data.address.zipCode || '',
        countryCode: data.address.country || 'LK',
      };
      if (reg) {
        await prisma.address.update({ where: { id: reg.id }, data: addrData });
      } else {
        await prisma.address.create({
          data: {
            userId: id,
            recipientName: updated.firstName,
            phoneNumber: updated.phoneNumber,
            isRegistration: true,
            ...addrData,
          },
        });
      }
    }

    // Re-read with the (possibly updated) registration address for the response.
    const fresh = await prisma.user.findUnique({ where: { id }, select: customerUserSelect });
    const customer = toCustomerShape(fresh ?? updated);

    await logAuditAction(
      request.user!.userId,
      'update',
      'customer',
      id,
      toCustomerShape(original) as unknown as Record<string, unknown>,
      customer as unknown as Record<string, unknown>,
      request
    );

    return NextResponse.json({ customer });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update customer error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
});

// DELETE /api/admin/customers/[id]
export const DELETE = requireAdmin(async (request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  try {
    const customer = await prisma.user.findUnique({ where: { id }, select: customerUserSelect });
    if (!customer || customer.role !== 'customer') {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    await prisma.user.delete({ where: { id } });

    await logAuditAction(
      request.user!.userId,
      'delete',
      'customer',
      id,
      toCustomerShape(customer) as unknown as Record<string, unknown>,
      undefined,
      request
    );

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    // Orders reference the user with onDelete: Restrict.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing orders.' },
        { status: 400 }
      );
    }
    console.error('Delete customer error:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
});
