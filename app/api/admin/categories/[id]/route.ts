import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Category } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin, logAuditAction } from '@/lib/middleware/adminAuth';

const schema = z.object({ name: z.string().min(1).max(100).optional(), slug: z.string().optional(), description: z.string().max(500).optional(), parentCategoryId: z.string().nullable().optional(), imageUrl: z.string().url().nullable().optional(), isActive: z.boolean().optional(), sortOrder: z.number().int().optional() });

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-');
}

function serializeCategory(c: Category) {
  return { ...c, _id: c.id };
}

export const GET = requireAdmin(async (_request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    return NextResponse.json({ category: serializeCategory(category) });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
});

export const PUT = requireAdmin(async (request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = schema.parse(body);
    const before = await prisma.category.findUnique({ where: { id } });
    if (!before) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

    const update: Partial<{ name: string; slug: string; description: string | null; parentCategoryId: string | null; imageUrl: string | null; isActive: boolean; sortOrder: number }> = {};
    if (typeof data.name !== 'undefined') update.name = data.name;
    if (typeof data.slug !== 'undefined') update.slug = slugify(data.slug);
    if (typeof data.description !== 'undefined') update.description = data.description ?? null;
    if (typeof data.parentCategoryId !== 'undefined') update.parentCategoryId = data.parentCategoryId ?? null;
    if (typeof data.imageUrl !== 'undefined') update.imageUrl = data.imageUrl ?? null;
    if (typeof data.isActive !== 'undefined') update.isActive = data.isActive;
    if (typeof data.sortOrder !== 'undefined') update.sortOrder = data.sortOrder;
    if (!update.slug && data.name) {
      update.slug = slugify(data.name);
    }

    if (update.slug && update.slug !== before.slug) {
      const exists = await prisma.category.findUnique({ where: { slug: update.slug } });
      if (exists && exists.id !== id) return NextResponse.json({ error: 'Category slug exists' }, { status: 400 });
    }

    const updated = await prisma.category.update({ where: { id }, data: update });
    const beforeSerialized = serializeCategory(before);
    const updatedSerialized = serializeCategory(updated);
    await logAuditAction(request.user!.userId, 'update', 'category', id, beforeSerialized, updatedSerialized, request);
    return NextResponse.json({ category: updatedSerialized });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input', details: e.errors }, { status: 400 });
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const before = await prisma.category.findUnique({ where: { id } });
    if (!before) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    await prisma.category.delete({ where: { id } });
    await logAuditAction(request.user!.userId, 'delete', 'category', id, serializeCategory(before), undefined, request);
    return NextResponse.json({ message: 'Category deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
});
