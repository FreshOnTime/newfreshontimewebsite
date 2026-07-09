import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
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

const AUTHOR_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
} as const;

type BlogWithAuthor = Prisma.BlogGetPayload<{ include: { author: { select: typeof AUTHOR_SELECT } } }>;

function serializeBlog(blog: BlogWithAuthor) {
  const { author, ...rest } = blog;
  return {
    ...rest,
    _id: blog.id,
    author: author ? { ...author, _id: author.id } : null,
  };
}

export const GET = requireAdmin(async (request, { params }) => {
  try {
    const { id } = await params;

    const blog = await prisma.blog.findFirst({
      where: { id, isDeleted: false },
      include: { author: { select: AUTHOR_SELECT } },
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ blog: serializeBlog(blog) });
  } catch (error) {
    console.error('Get blog error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
});

export const PUT = requireAdmin(async (request, { params }) => {
  try {
    const { id } = await params;

    const body = await request.json();
    const data = updateBlogSchema.parse(body);

    const existingBlog = await prisma.blog.findFirst({ where: { id, isDeleted: false } });
    if (!existingBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const updateData: Prisma.BlogUncheckedUpdateInput = {};

    // If slug is being updated, ensure it's unique
    if (data.slug && data.slug !== existingBlog.slug) {
      const slug = data.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      const slugExists = await prisma.blog.findFirst({
        where: { slug, isDeleted: false, id: { not: id } },
      });

      if (slugExists) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
      }

      updateData.slug = slug;
    }

    if (data.title !== undefined) updateData.title = data.title;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.published !== undefined) updateData.published = data.published;
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
    if (data.metaKeywords !== undefined) updateData.metaKeywords = data.metaKeywords;
    if (data.featuredImage !== undefined) {
      updateData.featuredImage = data.featuredImage === null
        ? Prisma.JsonNull
        : (data.featuredImage as Prisma.InputJsonValue);
    }
    if (data.publishedAt !== undefined) {
      updateData.publishedAt = data.publishedAt === null ? null : new Date(data.publishedAt);
    }

    // Update publishedAt if publishing for the first time
    if (data.published && !existingBlog.published && data.publishedAt == null) {
      updateData.publishedAt = new Date();
    }

    const updated = await prisma.blog.update({
      where: { id },
      data: updateData,
      include: { author: { select: AUTHOR_SELECT } },
    });

    await logAuditAction(
      request.user!.userId,
      'update',
      'product',
      id,
      existingBlog as unknown as Record<string, unknown>,
      updated as unknown as Record<string, unknown>,
      request
    );

    return NextResponse.json({ blog: serializeBlog(updated) });
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
    const { id } = await params;

    const blog = await prisma.blog.findFirst({ where: { id, isDeleted: false } });
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Soft delete
    await prisma.blog.update({ where: { id }, data: { isDeleted: true } });

    await logAuditAction(
      request.user!.userId,
      'delete',
      'product',
      id,
      blog as unknown as Record<string, unknown>,
      undefined,
      request
    );

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
});
