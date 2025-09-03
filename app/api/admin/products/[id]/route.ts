import { NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectDB from '@/lib/database';
import EnhancedProduct from '@/lib/models/EnhancedProduct';
import { requireAdmin, logAuditAction } from '@/lib/middleware/adminAuth';

const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().nonnegative().optional(),
  costPrice: z.number().nonnegative().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  stockQty: z.number().int().nonnegative().optional(),
  minStockLevel: z.number().int().nonnegative().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  attributes: z.record(z.any()).optional(),
  archived: z.boolean().optional(),
});

export const GET = requireAdmin(async (_request, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }
  const product = await EnhancedProduct.findById(params.id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
});

export const PUT = requireAdmin(async (request, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }
    const body = await request.json();
    const data = updateProductSchema.parse(body);

  const before = await EnhancedProduct.findById(params.id);
    if (!before) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

  const updated = await EnhancedProduct.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    );

    await logAuditAction(request.user!.userId, 'update', 'product', params.id, before.toObject(), updated!.toObject(), request);

    return NextResponse.json({ product: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (request, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }
  const before = await EnhancedProduct.findById(params.id);
    if (!before) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
  await EnhancedProduct.findByIdAndDelete(params.id);
    await logAuditAction(request.user!.userId, 'delete', 'product', params.id, before.toObject(), undefined, request);
    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
});
