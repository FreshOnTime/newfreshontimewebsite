import { NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectDB from '@/lib/database';
import Supplier from '@/lib/models/Supplier';
import { requireAdmin, logAuditAction } from '@/lib/middleware/adminAuth';

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  contactName: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(3).optional(),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
  }).optional(),
  paymentTerms: z.enum(['net-15', 'net-30', 'net-60', 'net-90', 'cod', 'prepaid']).optional(),
  notes: z.string().max(1000).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const GET = requireAdmin(async (_request, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid supplier ID' }, { status: 400 });
    }
    const supplier = await Supplier.findById(params.id);
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }
    return NextResponse.json({ supplier });
  } catch (error) {
    console.error('Get supplier error:', error);
    return NextResponse.json({ error: 'Failed to fetch supplier' }, { status: 500 });
  }
});

export const PUT = requireAdmin(async (request, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid supplier ID' }, { status: 400 });
    }
    const body = await request.json();
    const data = updateSchema.parse(body);
    const before = await Supplier.findById(params.id);
    if (!before) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }
    // Ensure unique email if changed
    if (data.email && data.email !== before.email) {
      const exists = await Supplier.findOne({ email: data.email, _id: { $ne: params.id } });
      if (exists) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
    }
    const updated = await Supplier.findByIdAndUpdate(params.id, { $set: data }, { new: true, runValidators: true });
    await logAuditAction(request.user!.userId, 'update', 'supplier', params.id, before.toObject(), updated!.toObject(), request);
    return NextResponse.json({ supplier: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Update supplier error:', error);
    return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (request, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid supplier ID' }, { status: 400 });
    }
    const before = await Supplier.findById(params.id);
    if (!before) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }
    await Supplier.findByIdAndDelete(params.id);
    await logAuditAction(request.user!.userId, 'delete', 'supplier', params.id, before.toObject(), undefined, request);
    return NextResponse.json({ message: 'Supplier deleted' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 });
  }
});
