import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

const querySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(parseInt(v), 50) : 12)),
  search: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
});

// Cache headers for better performance
const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const where: Prisma.BlogWhereInput = {
      isDeleted: false,
      published: true,
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { excerpt: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.tag) {
      where.tags = { has: query.tag };
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    // Optimized query with minimal fields for list view
    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          category: true,
          tags: true,
          publishedAt: true,
          views: true,
          authorName: true,
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blog.count({ where }),
    ]);

    return NextResponse.json(
      {
        blogs: blogs.map(({ id, ...rest }) => ({ _id: id, ...rest })),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
      { headers: CACHE_HEADERS }
    );
  } catch (error) {
    console.error('Get public blogs error:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}
