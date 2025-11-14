import { NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectDB from '@/lib/database';
import Blog from '@/lib/models/Blog';
import { requireAdminSimple, logAuditAction } from '@/lib/middleware/adminAuth';

const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const createBlogSchema = z.object({
  title: z.string().min(5).max(200),
  slug: z.string().min(1).max(250).optional(),
  excerpt: z.string().min(10).max(500),
  content: z.string().min(50),
  featuredImage: imageSchema.optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).max(20).default([]),
  published: z.boolean().default(false),
  publishedAt: z.string().datetime().optional(),
  metaTitle: z.string().max(100).optional(),
  metaDescription: z.string().max(300).optional(),
  metaKeywords: z.array(z.string()).optional(),
});

const querySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(parseInt(v), 100) : 20)),
  search: z.string().optional(),
  published: z.string().optional(),
  category: z.string().optional(),
});

export const GET = requireAdminSimple(async (request) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const filter: Record<string, unknown> = { isDeleted: false };
    
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { excerpt: { $regex: query.search, $options: 'i' } },
        { tags: { $regex: query.search, $options: 'i' } },
      ];
    }
    
    if (query.published !== undefined) {
      filter.published = query.published === 'true';
    }
    
    if (query.category) {
      filter.category = query.category;
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(filter),
    ]);

    return NextResponse.json({
      blogs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
});

export const POST = requireAdminSimple(async (request) => {
  try {
    await connectDB();
    const body = await request.json();
    const data = createBlogSchema.parse(body);

    // Generate slug from title if not provided
    let slug = data.slug || data.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Ensure slug is unique
    let slugExists = await Blog.findOne({ slug, isDeleted: false });
    let counter = 1;
    const originalSlug = slug;
    
    while (slugExists) {
      slug = `${originalSlug}-${counter}`;
      slugExists = await Blog.findOne({ slug, isDeleted: false });
      counter++;
    }

    // Get author name from user
    const authorName = `${request.user?.firstName || ''} ${request.user?.lastName || ''}`.trim() || request.user?.email || 'Admin';

    const blogData = {
      ...data,
      slug,
      author: new mongoose.Types.ObjectId(request.user!.userId),
      authorName,
      createdBy: request.user!.userId,
      updatedBy: request.user!.userId,
      publishedAt: data.published && !data.publishedAt ? new Date() : data.publishedAt,
    };

    const blog = await Blog.create(blogData);

    // Log audit action (using 'product' as placeholder for blog until audit log is updated)
    await logAuditAction(
      request.user!.userId,
      'create',
      'product',
      blog._id.toString(),
      undefined,
      blog.toObject(),
      request
    );

    return NextResponse.json({ blog }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    
    const err = error as { code?: number; keyPattern?: Record<string, unknown> };
    if (err && err.code === 11000) {
      const field = err.keyPattern && Object.keys(err.keyPattern)[0];
      const message = field ? `${field} already exists` : 'Duplicate key error';
      return NextResponse.json({ error: message }, { status: 400 });
    }
    
    console.error('Create blog error:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
});
