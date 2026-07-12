import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Category, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdminSimple, logAuditAction } from '@/lib/middleware/adminAuth';

const schema = z.object({ name: z.string().min(1).max(100), slug: z.string().optional(), description: z.string().max(500).optional(), parentCategoryId: z.string().optional(), imageUrl: z.string().url().nullable().optional(), isActive: z.boolean().optional(), sortOrder: z.number().int().optional() });
const querySchema = z.object({ page: z.string().optional().transform((v)=>v?parseInt(v):1), limit: z.string().optional().transform((v)=>v?Math.min(parseInt(v),100):100), search: z.string().optional() });

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-');
}

function serializeCategory(c: Category) {
  return { ...c, _id: c.id };
}

export const GET = requireAdminSimple(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const q = querySchema.parse(Object.fromEntries(searchParams));
    const where: Prisma.CategoryWhereInput = {};
    if (q.search) where.name = { contains: q.search, mode: 'insensitive' };
    const page = q.page; const limit = q.limit; const skip = (page - 1) * limit;
    const [categories, total] = await Promise.all([
      prisma.category.findMany({ where, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], skip, take: limit }),
      prisma.category.count({ where }),
    ]);
    return NextResponse.json({ categories: categories.map(serializeCategory), pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
});

export const POST = requireAdminSimple(async (request) => {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    const slug = slugify(data.slug || data.name);
    const exists = await prisma.category.findUnique({ where: { slug } });
    if (exists) return NextResponse.json({ error: 'Category slug exists' }, { status: 400 });
    const cat = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        parentCategoryId: data.parentCategoryId || null,
        imageUrl: data.imageUrl ?? null,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
    const serialized = serializeCategory(cat);
    await logAuditAction(request.user!.userId, 'create', 'category', cat.id, undefined, serialized, request);
    return NextResponse.json({ category: serialized }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input', details: e.errors }, { status: 400 });
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
});
