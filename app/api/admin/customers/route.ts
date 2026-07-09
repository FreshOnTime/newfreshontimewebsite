import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdminSimple, logAuditAction, checkRateLimit, getClientIP } from '@/lib/middleware/adminAuth';

const createCustomerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
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

const querySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 100) : 20),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'totalSpent']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Customers ARE users with role 'customer'. Select the fields we need plus the
// registration address so we can present the legacy Customer shape.
const customerUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  createdAt: true,
  addresses: {
    where: { isRegistration: true },
    take: 1,
    select: { streetAddress: true, city: true, state: true, postalCode: true, countryCode: true },
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

export const GET = requireAdminSimple(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const where: Prisma.UserWhereInput = { role: 'customer' };
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phoneNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const skip = (query.page - 1) * query.limit;
    // totalSpent is computed post-query, so it can't be a DB sort key; fall back to createdAt.
    const sortField = query.sortBy === 'name' ? 'firstName' : query.sortBy === 'email' ? 'email' : 'createdAt';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { [sortField]: query.sortOrder },
        skip,
        take: query.limit,
        select: customerUserSelect,
      }),
      prisma.user.count({ where }),
    ]);

    // Aggregate order stats (count, total spent, last order date) per customer.
    const ids = users.map((u) => u.id);
    const grouped = ids.length
      ? await prisma.order.groupBy({
          by: ['customerId'],
          where: { customerId: { in: ids } },
          _count: { _all: true },
          _sum: { total: true },
          _max: { createdAt: true },
        })
      : [];
    const statMap = new Map(
      grouped.map((g) => [
        g.customerId,
        {
          totalOrders: g._count._all,
          totalSpent: Number(g._sum.total ?? 0),
          lastOrderDate: g._max.createdAt,
        },
      ])
    );

    const customers = users.map((u) => toCustomerShape(u, statMap.get(u.id)));

    return NextResponse.json({
      customers,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
});

export const POST = requireAdminSimple(async (request) => {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(`create-customer-${clientIP}`, 10, 60000)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const data = createCustomerSchema.parse(body);

    // A customer is a User with role 'customer'; phoneNumber is required & unique.
    const phone = data.phone?.trim();
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required to create a customer' },
        { status: 400 }
      );
    }
    const email = data.email.trim().toLowerCase();

    // Uniqueness checks against the users table
    const existingByEmail = await prisma.user.findFirst({ where: { email } });
    if (existingByEmail) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 400 }
      );
    }
    const existingByPhone = await prisma.user.findFirst({ where: { phoneNumber: phone } });
    if (existingByPhone) {
      return NextResponse.json(
        { error: 'Customer with this phone already exists' },
        { status: 400 }
      );
    }

    // Split the display name into first/last for the User model.
    const nameParts = data.name.trim().split(/\s+/);
    const firstName = nameParts.shift() || data.name.trim();
    const lastName = nameParts.length ? nameParts.join(' ') : null;

    const created = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber: phone,
        role: 'customer',
        ...(data.address
          ? {
              addresses: {
                create: [
                  {
                    recipientName: data.name,
                    streetAddress: data.address.street || '',
                    town: data.address.city || '',
                    city: data.address.city || '',
                    state: data.address.state || '',
                    postalCode: data.address.zipCode || '',
                    countryCode: data.address.country || 'LK',
                    phoneNumber: phone,
                    isRegistration: true,
                  },
                ],
              },
            }
          : {}),
      },
      select: customerUserSelect,
    });

    const customer = toCustomerShape(created);

    await logAuditAction(
      request.user!.userId,
      'create',
      'customer',
      created.id,
      undefined,
      customer as unknown as Record<string, unknown>,
      request
    );

    return NextResponse.json(
      { customer },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
});
