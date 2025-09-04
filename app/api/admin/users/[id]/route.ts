import { NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
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

export const GET = requireAdmin(async (_request: AdminRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
  const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
  const user = await User.findById(id).lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
});

export const PATCH = requireAdmin(async (request: AdminRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
  const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
    const body = await request.json();
    const data = updateUserSchema.parse(body);

    // Ensure unique email/phone if provided
    if (data.email) {
      const exists = await User.findOne({ email: data.email, _id: { $ne: id } });
      if (exists) return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }
    if (data.phoneNumber) {
      const exists = await User.findOne({ phoneNumber: data.phoneNumber, _id: { $ne: id } });
      if (exists) return NextResponse.json({ error: 'Phone already in use' }, { status: 400 });
    }

        const before = await User.findById(id).lean();
    if (!before) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const updated = await User.findByIdAndUpdate(id, data, { new: true }).lean();
        await logAuditAction(
          request.user!.userId,
          'update',
          'user',
          id,
          before as unknown as Record<string, unknown>,
          updated as unknown as Record<string, unknown>,
          request
        );
    return NextResponse.json({ user: updated });
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
    await connectDB();
  const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
    const existing = await User.findById(id);
    if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await User.findByIdAndDelete(id);
    await logAuditAction(request.user!.userId, 'delete', 'user', id, existing.toObject(), undefined, request);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
});
