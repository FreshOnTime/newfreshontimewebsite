import { NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectDB from '@/lib/database';
import Category from '@/lib/models/Category';
import { requireAdmin, logAuditAction } from '@/lib/middleware/adminAuth';

const schema = z.object({ name: z.string().min(1).max(100).optional(), slug: z.string().optional(), description: z.string().max(500).optional(), parentCategoryId: z.string().nullable().optional(), imageUrl: z.string().url().optional(), isActive: z.boolean().optional(), sortOrder: z.number().int().optional() });

export const GET = requireAdmin(async (_request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    const category = await Category.findById(id);
    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    return NextResponse.json({ category });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
});

export const PUT = requireAdmin(async (request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    const body = await request.json();
    const data = schema.parse(body);
    const before = await Category.findById(id);
    if (!before) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    // compute slug if provided name without slug
  const update: Partial<{ name: string; slug: string; description?: string; parentCategoryId?: string | null; imageUrl?: string; isActive?: boolean; sortOrder?: number }> = {};
  if (typeof data.name !== 'undefined') update.name = data.name;
  if (typeof data.slug !== 'undefined') update.slug = data.slug;
  if (typeof data.description !== 'undefined') update.description = data.description;
  if (typeof data.parentCategoryId !== 'undefined') update.parentCategoryId = (data.parentCategoryId ?? null) as string | null;
  if (typeof data.imageUrl !== 'undefined') update.imageUrl = data.imageUrl;
  if (typeof data.isActive !== 'undefined') update.isActive = data.isActive;
  if (typeof data.sortOrder !== 'undefined') update.sortOrder = data.sortOrder;
    if (!update.slug && data.name) {
      update.slug = data.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-');
    }
    const updated = await Category.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
    await logAuditAction(request.user!.userId, 'update', 'category', id, before.toObject(), updated!.toObject(), request);
    return NextResponse.json({ category: updated });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input', details: e.errors }, { status: 400 });
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    const before = await Category.findById(id);
    if (!before) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    await Category.findByIdAndDelete(id);
    await logAuditAction(request.user!.userId, 'delete', 'category', id, before.toObject(), undefined, request);
    return NextResponse.json({ message: 'Category deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
});
