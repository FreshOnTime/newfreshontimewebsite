import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
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
  type: z.enum(['Home', 'Business', 'School', 'Other']).optional(),
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

const updateUserSchema = z.object({
  firstName: z.string().trim().min(1).max(30).optional(),
  lastName: z.string().trim().max(30).optional(),
  email: optionalEmail,
  phoneNumber: optionalPhone,
  password: z.string().min(8).max(72).optional(),
  role: z.enum(roles).optional(),
  secondaryRoles: z.array(z.enum(roles)).optional(),
  isBanned: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
  giftCardBalance: z.number().nonnegative().optional(),
  registrationAddress: addressSchema.optional(),
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
    const data = updateUserSchema.parse(await request.json());

    const before = await prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!before) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const nextRole = data.role ?? before.role;
    const nextSecondaryRoles = data.secondaryRoles ?? before.secondaryRoles;
    if (id === request.user!.userId) {
      if (data.isBanned) {
        return NextResponse.json({ error: 'You cannot ban your own admin account' }, { status: 400 });
      }
      if (nextRole !== 'admin' && !nextSecondaryRoles.includes('admin')) {
        return NextResponse.json({ error: 'You cannot remove your own admin access' }, { status: 400 });
      }
    }

    const normalizedEmail =
      data.email === undefined ? undefined : data.email ? data.email.trim().toLowerCase() : null;
    const normalizedPhone =
      data.phoneNumber === undefined ? undefined : data.phoneNumber ? data.phoneNumber.trim() : null;

    if (normalizedEmail) {
      const exists = await prisma.user.findFirst({ where: { email: normalizedEmail, NOT: { id } } });
      if (exists) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
    if (normalizedPhone) {
      const exists = await prisma.user.findFirst({ where: { phoneNumber: normalizedPhone, NOT: { id } } });
      if (exists) return NextResponse.json({ error: 'Phone number already in use' }, { status: 409 });
    }

    const passwordHash = data.password ? await bcrypt.hash(data.password, 12) : undefined;
    const { registrationAddress } = data;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName === undefined ? undefined : data.lastName || null,
        email: normalizedEmail,
        phoneNumber: normalizedPhone,
        passwordHash,
        role: data.role,
        secondaryRoles: data.secondaryRoles,
        isBanned: data.isBanned,
        isEmailVerified: data.isEmailVerified,
        giftCardBalance: data.giftCardBalance,
      },
      select: userSelect,
    });

    if (registrationAddress) {
      await prisma.address.updateMany({
        where: { userId: id, isRegistration: true },
        data: registrationAddress,
      });
    }

    if (data.password) {
      await prisma.refreshToken.deleteMany({ where: { userId: id } });
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Email address or phone number already in use' }, { status: 409 });
    }
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (request: AdminRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    if (id === request.user!.userId) {
      return NextResponse.json({ error: 'You cannot delete your own admin account' }, { status: 400 });
    }

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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json(
        { error: 'This user has related records such as orders and cannot be permanently deleted. Ban the account instead.' },
        { status: 409 }
      );
    }
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
});
