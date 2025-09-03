import { NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectDB from '@/lib/database';
import Customer from '@/lib/models/Customer';
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

// GET /api/admin/customers/[id]
export const GET = requireAdmin(async (request, { params }: { params: { id: string } }) => {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    const customer = await Customer.findById(params.id);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Get customer error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
});

// PUT /api/admin/customers/[id]
export const PUT = requireAdmin(async (request, { params }: { params: { id: string } }) => {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = updateCustomerSchema.parse(body);

    // Get original customer for audit log
    const originalCustomer = await Customer.findById(params.id);
    if (!originalCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if email already exists (if being updated)
    if (data.email && data.email !== originalCustomer.email) {
      const existingCustomer = await Customer.findOne({ 
        email: data.email, 
        _id: { $ne: params.id } 
      });
      if (existingCustomer) {
        return NextResponse.json(
          { error: 'Customer with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Update customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    );

    // Log audit action
    await logAuditAction(
      request.user!.userId,
      'update',
      'customer',
      params.id,
      originalCustomer.toObject(),
      updatedCustomer!.toObject(),
      request
    );

    return NextResponse.json({ customer: updatedCustomer });
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
export const DELETE = requireAdmin(async (request, { params }: { params: { id: string } }) => {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    // Get customer for audit log
    const customer = await Customer.findById(params.id);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Delete customer
    await Customer.findByIdAndDelete(params.id);

    // Log audit action
    await logAuditAction(
      request.user!.userId,
      'delete',
      'customer',
      params.id,
      customer.toObject(),
      undefined,
      request
    );

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
});
