import { NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/database';
import Category from '@/lib/models/Category';
import { requireAdminSimple, logAuditAction } from '@/lib/middleware/adminAuth';

const schema = z.object({ name: z.string().min(1).max(100), slug: z.string().optional(), description: z.string().max(500).optional(), parentCategoryId: z.string().optional(), imageUrl: z.string().url().optional(), isActive: z.boolean().optional(), sortOrder: z.number().int().optional() });
const querySchema = z.object({ page: z.string().optional().transform((v)=>v?parseInt(v):1), limit: z.string().optional().transform((v)=>v?Math.min(parseInt(v),100):100), search: z.string().optional() });

export const GET = requireAdminSimple(async (request) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = querySchema.parse(Object.fromEntries(searchParams));
    const filter: Record<string, unknown> = {};
    if (q.search) filter.name = { $regex: q.search, $options: 'i' };
    const page = q.page; const limit = q.limit; const skip = (page - 1) * limit;
    const [categories, total] = await Promise.all([
      Category.find(filter).sort({ sortOrder: 1, name: 1 }).skip(skip).limit(limit).lean(),
      Category.countDocuments(filter),
    ]);
    return NextResponse.json({ categories, pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
});

export const POST = requireAdminSimple(async (request) => {
  try {
    await connectDB();
    const body = await request.json();
    const data = schema.parse(body);
    const slug = (data.slug || data.name).toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-');
    const exists = await Category.findOne({ slug });
    if (exists) return NextResponse.json({ error: 'Category slug exists' }, { status: 400 });
    const cat = await Category.create({ ...data, slug });
    await logAuditAction(request.user!.userId, 'create', 'category', cat._id.toString(), undefined, cat.toObject(), request);
    return NextResponse.json({ category: cat }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input', details: e.errors }, { status: 400 });
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
});
