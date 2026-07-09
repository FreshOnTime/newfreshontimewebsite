import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin, logAuditAction, AdminRequest } from '@/lib/middleware/adminAuth';

const addressSchema = z.object({
  recipientName: z.string().min(1).max(80).optional(),
  streetAddress: z.string().min(1).max(100).optional(),
  streetAddress2: z.string().max(100).optional(),
  town: z.string().min(1).max(100).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  postalCode: z.string().min(1).max(100).optional(),
  countryCode: z.string().length(2).toUpperCase().optional(),
  phoneNumber: z.string().min(3).optional(),
  type: z.enum(['Home','Business','School','Other']).optional(),
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

const updateUserSchema = z.object({
  firstName: z.string().min(1).max(30).optional(),
  lastName: z.string().max(30).optional(),
  email: z.string().email().optional().nullable(),
  phoneNumber: z.string().min(3).optional(),
  passwordHash: z.string().optional(),
  role: z.enum(roles).optional(),
  secondaryRoles: z.array(z.enum(roles)).optional(),
  isBanned: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
  giftCardBalance: z.number().nonnegative().optional(),
  registrationAddress: addressSchema.optional(),
  addresses: z.array(addressSchema).optional(),
});

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

export const GET = requireAdmin(async (_request: AdminRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
});

export const PATCH = requireAdmin(async (request: AdminRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateUserSchema.parse(body);

    // Ensure unique email/phone if provided
    if (data.email) {
      const exists = await prisma.user.findFirst({ where: { email: data.email, NOT: { id } } });
      if (exists) return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }
    if (data.phoneNumber) {
      const exists = await prisma.user.findFirst({ where: { phoneNumber: data.phoneNumber, NOT: { id } } });
      if (exists) return NextResponse.json({ error: 'Phone already in use' }, { status: 400 });
    }

    const before = await prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!before) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { registrationAddress } = data;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        passwordHash: data.passwordHash,
        role: data.role,
        secondaryRoles: data.secondaryRoles,
        isBanned: data.isBanned,
        isEmailVerified: data.isEmailVerified,
        giftCardBalance: data.giftCardBalance,
      },
      select: userSelect,
    });

    // Addresses live in their own table now; update the registration address in place
    // when provided (partial fields only). The `addresses` array replacement from the
    // legacy embedded-document model is not supported here.
    if (registrationAddress) {
      await prisma.address.updateMany({
        where: { userId: id, isRegistration: true },
        data: registrationAddress,
      });
    }

    const serializedBefore = serializeUser(before);
    const serializedAfter = serializeUser(updated);
    await logAuditAction(
      request.user!.userId,
      'update',
      'user',
      id,
      serializedBefore as unknown as Record<string, unknown>,
      serializedAfter as unknown as Record<string, unknown>,
      request
    );
    return NextResponse.json({ user: serializedAfter });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (request: AdminRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const existing = await prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await prisma.user.delete({ where: { id } });
    await logAuditAction(
      request.user!.userId,
      'delete',
      'user',
      id,
      serializeUser(existing) as unknown as Record<string, unknown>,
      undefined,
      request
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    // Orders reference the user with onDelete: Restrict, so a user with orders
    // cannot be hard-deleted. Surface a clear message instead of a raw 500.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete user with related records (e.g. orders). Remove them first.' },
        { status: 400 }
      );
    }
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
});
