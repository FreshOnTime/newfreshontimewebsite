import { NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectDB from '@/lib/database';
import Blog from '@/lib/models/Blog';
import { requireAdmin, logAuditAction } from '@/lib/middleware/adminAuth';

const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const updateBlogSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  slug: z.string().min(1).max(250).optional(),
  excerpt: z.string().min(10).max(500).optional(),
  content: z.string().min(50).optional(),
  featuredImage: imageSchema.optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  tags: z.array(z.string()).max(20).optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  metaTitle: z.string().max(100).optional().nullable(),
  metaDescription: z.string().max(300).optional().nullable(),
  metaKeywords: z.array(z.string()).optional(),
});

export const GET = requireAdmin(async (request, { params }) => {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid blog ID' }, { status: 400 });
    }

    const blog = await Blog.findOne({ _id: id, isDeleted: false })
      .populate('author', 'name email firstName lastName')
      .lean();

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error('Get blog error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
});

export const PUT = requireAdmin(async (request, { params }) => {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid blog ID' }, { status: 400 });
    }

    const body = await request.json();
    const data = updateBlogSchema.parse(body);

    const existingBlog = await Blog.findOne({ _id: id, isDeleted: false });
    if (!existingBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // If slug is being updated, ensure it's unique
    if (data.slug && data.slug !== existingBlog.slug) {
      const slug = data.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      const slugExists = await Blog.findOne({ 
        slug, 
        isDeleted: false, 
        _id: { $ne: id } 
      });
      
      if (slugExists) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
      }
      
      data.slug = slug;
    }

    // Update publishedAt if publishing for the first time
    const updateData: Record<string, unknown> = { ...data };
    if (data.published && !existingBlog.published && !data.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const before = existingBlog.toObject();
    const updated = await Blog.findByIdAndUpdate(
      id,
      { 
        ...updateData, 
        updatedBy: request.user!.userId 
      },
      { new: true, runValidators: true }
    ).populate('author', 'name email firstName lastName');

    await logAuditAction(
      request.user!.userId,
      'update',
      'product',
      id,
      before,
      updated?.toObject(),
      request
    );

    return NextResponse.json({ blog: updated });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    
    console.error('Update blog error:', error);
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (request, { params }) => {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid blog ID' }, { status: 400 });
    }

    const blog = await Blog.findOne({ _id: id, isDeleted: false });
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const before = blog.toObject();
    
    // Soft delete
    await Blog.findByIdAndUpdate(id, { 
      isDeleted: true, 
      updatedBy: request.user!.userId 
    });

    await logAuditAction(
      request.user!.userId,
      'delete',
      'product',
      id,
      before,
      undefined,
      request
    );

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
});
