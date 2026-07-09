import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdminSimple, logAuditAction } from '@/lib/middleware/adminAuth';

const addressSchema = z.object({
  recipientName: z.string().min(1).max(80),
  streetAddress: z.string().min(1).max(100),
  streetAddress2: z.string().max(100).optional(),
  town: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(100),
  countryCode: z.string().length(2).toUpperCase().default('LK'),
  phoneNumber: z.string().min(3),
  type: z.enum(['Home','Business','School','Other']).default('Home'),
});

const roles = [
  'customer',
  'admin',
  'manager',
  'delivery_staff',
  'customer_support',
  'marketing_specialist',
  'order_processor',
  'inventory_manager',
] as const;

const createUserSchema = z.object({
  userId: z.string().optional(),
  firstName: z.string().min(1).max(30),
  lastName: z.string().max(30).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(3),
  passwordHash: z.string().optional(),
  role: z.enum(roles).default('customer'),
  secondaryRoles: z.array(z.enum(roles)).optional(),
  isBanned: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
  giftCardBalance: z.number().nonnegative().optional(),
  registrationAddress: addressSchema,
  addresses: z.array(addressSchema).optional(),
});

// Note: Single-user update schema lives in [id]/route.ts

const querySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(parseInt(v), 100) : 20)),
  search: z.string().optional(),
  role: z.enum(roles).optional(),
  sortBy: z.enum(['createdAt','firstName','email']).optional().default('createdAt'),
  sortOrder: z.enum(['asc','desc']).optional().default('desc'),
});

// Fields returned to the admin UI. passwordHash is intentionally excluded.
const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  role: true,
  secondaryRoles: true,
  isBanned: true,
  isEmailVerified: true,
  isPhoneVerified: true,
  giftCardBalance: true,
  supplierId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

type UserRow = Prisma.UserGetPayload<{ select: typeof userSelect }>;

// Map a Prisma user row to the JSON shape the old Mongoose route returned.
// IDs are UUIDs now; expose them as both `id`/`_id` and (for UI compat) `userId`.
function serializeUser(u: UserRow) {
  return {
    ...u,
    _id: u.id,
    userId: u.id,
    giftCardBalance: Number(u.giftCardBalance),
  };
}

export const GET = requireAdminSimple(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const where: Prisma.UserWhereInput = {};
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phoneNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.role) {
      where.role = query.role;
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip,
        take: limit,
        select: userSelect,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users: users.map(serializeUser),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
});

export const POST = requireAdminSimple(async (request) => {
  try {
    const body = await request.json();
    const data = createUserSchema.parse(body);

    // Normalize email/phone
    const email = data.email?.trim().toLowerCase();
    const phone = data.phoneNumber.trim();

    // Uniqueness checks
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          { phoneNumber: phone },
        ],
      },
    });
    if (existing) {
      return NextResponse.json({ error: 'User with same ID, email, or phone already exists' }, { status: 400 });
    }

    const { registrationAddress, addresses } = data;

    const created = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName ?? null,
        email: email ?? null,
        phoneNumber: phone,
        passwordHash: data.passwordHash ?? null,
        role: data.role,
        secondaryRoles: data.secondaryRoles ?? [],
        isBanned: data.isBanned ?? false,
        isEmailVerified: data.isEmailVerified ?? false,
        giftCardBalance: data.giftCardBalance ?? 0,
        addresses: {
          create: [
            { ...registrationAddress, isRegistration: true },
            ...(addresses ?? []).map((a) => ({ ...a, isRegistration: false })),
          ],
        },
      },
      select: userSelect,
    });

    const serialized = serializeUser(created);
    await logAuditAction(
      request.user!.userId,
      'create',
      'user',
      created.id,
      undefined,
      serialized as unknown as Record<string, unknown>,
      request
    );

    return NextResponse.json({ user: serialized }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Duplicate key error' }, { status: 400 });
    }
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
});
