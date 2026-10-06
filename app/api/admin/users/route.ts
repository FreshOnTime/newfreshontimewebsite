import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
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
  type: z.enum(['Home', 'Business', 'School', 'Other']).default('Home'),
});

const roles = [
  'customer',
  'supplier',
  'admin',
  'manager',
  'delivery_staff',
  'customer_support',
  'marketing_specialist',
  'order_processor',
  'inventory_manager',
] as const;

const optionalEmail = z.union([z.string().trim().email(), z.literal(''), z.null()]).optional();
const optionalPhone = z.union([z.string().trim().min(3), z.literal(''), z.null()]).optional();

const createUserSchema = z.object({
  firstName: z.string().trim().min(1).max(30),
  lastName: z.string().trim().max(30).optional(),
  email: optionalEmail,
  phoneNumber: optionalPhone,
  password: z.string().min(8).max(72).optional(),
  role: z.enum(roles).default('customer'),
  secondaryRoles: z.array(z.enum(roles)).optional(),
  isBanned: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
  giftCardBalance: z.number().nonnegative().optional(),
  registrationAddress: addressSchema.optional(),
}).superRefine((data, ctx) => {
  if (!data.email && !data.phoneNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['email'],
      message: 'An email address or phone number is required',
    });
  }
});

const querySchema = z.object({
  page: z.string().optional().transform((v) => (v ? Math.max(parseInt(v, 10) || 1, 1) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(Math.max(parseInt(v, 10) || 20, 1), 100) : 20)),
  search: z.string().optional(),
  role: z.enum(roles).optional(),
  sortBy: z.enum(['createdAt', 'firstName', 'email']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Fields returned to the admin UI. Sensitive authentication data is intentionally excluded.
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
    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (query.role) where.role = query.role;

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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query', details: error.errors }, { status: 400 });
    }
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
});

export const POST = requireAdminSimple(async (request) => {
  try {
    const data = createUserSchema.parse(await request.json());

    const email = data.email ? data.email.trim().toLowerCase() : null;
    const phone = data.phoneNumber ? data.phoneNumber.trim() : null;

    const duplicateChecks: Prisma.UserWhereInput[] = [];
    if (email) duplicateChecks.push({ email });
    if (phone) duplicateChecks.push({ phoneNumber: phone });

    if (duplicateChecks.length) {
      const existing = await prisma.user.findFirst({ where: { OR: duplicateChecks } });
      if (existing) {
        return NextResponse.json({ error: 'A user with that email address or phone number already exists' }, { status: 409 });
      }
    }

    const passwordHash = data.password ? await bcrypt.hash(data.password, 12) : null;

    const created = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName || null,
        email,
        phoneNumber: phone,
        passwordHash,
        role: data.role,
        secondaryRoles: data.secondaryRoles ?? [],
        isBanned: data.isBanned ?? false,
        isEmailVerified: data.isEmailVerified ?? false,
        giftCardBalance: data.giftCardBalance ?? 0,
        ...(data.registrationAddress
          ? {
              addresses: {
                create: [{ ...data.registrationAddress, isRegistration: true }],
              },
            }
          : {}),
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
      return NextResponse.json({ error: 'A user with that email address or phone number already exists' }, { status: 409 });
    }
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
});
