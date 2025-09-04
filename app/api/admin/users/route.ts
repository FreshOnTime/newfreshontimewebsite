import { NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
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

function generateUserId() {
  return `USR-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
}

export const GET = requireAdminSimple(async (request) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const filter: Record<string, unknown> = {};
    if (query.search) {
      filter.$or = [
        { firstName: { $regex: query.search, $options: 'i' } },
        { lastName: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { phoneNumber: { $regex: query.search, $options: 'i' } },
        { userId: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.role) {
      filter.role = query.role;
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const sort: Record<string, 1 | -1> = {};
    sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    return NextResponse.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
});

export const POST = requireAdminSimple(async (request) => {
  try {
    await connectDB();
    const body = await request.json();
    const data = createUserSchema.parse(body);

    const userId = data.userId?.trim() || generateUserId();

    // Normalize email/phone
    const email = data.email?.trim().toLowerCase();
    const phone = data.phoneNumber.trim();

    // Uniqueness checks
    const existing = await User.findOne({
      $or: [
        { userId },
        ...(email ? [{ email }] : []),
        { phoneNumber: phone },
      ],
    });
    if (existing) {
      return NextResponse.json({ error: 'User with same ID, email, or phone already exists' }, { status: 400 });
    }

    const created = await User.create({
      ...data,
      userId,
      email,
      phoneNumber: phone,
    });

    await logAuditAction(request.user!.userId, 'create', 'user', created._id.toString(), undefined, created.toObject(), request);

    return NextResponse.json({ user: created }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    const err = error as { code?: number; keyPattern?: Record<string, unknown> };
    if (err && err.code === 11000) {
      return NextResponse.json({ error: 'Duplicate key error' }, { status: 400 });
    }
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
});
