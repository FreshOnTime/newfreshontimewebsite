import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/database';
import Blog from '@/lib/models/Blog';

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
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const filter: Record<string, unknown> = { 
      isDeleted: false,
      published: true,
    };
    
    if (query.search) {
      // Use text index for faster search when available
      filter.$text = { $search: query.search };
    }
    
    if (query.category) {
      filter.category = query.category;
    }
    
    if (query.tag) {
      filter.tags = query.tag;
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    // Optimized query with minimal fields for list view
    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .select('title slug excerpt featuredImage category tags publishedAt views authorName')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        blogs,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
      { headers: CACHE_HEADERS }
    );
  } catch (error) {
    console.error('Get public blogs error:', error);
    // Fallback to regex search if text index fails
    if (error instanceof Error && error.message.includes('text index')) {
      return handleRegexSearch(request);
    }
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

// Fallback regex search function
async function handleRegexSearch(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const filter: Record<string, unknown> = { 
      isDeleted: false,
      published: true,
    };
    
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { excerpt: { $regex: query.search, $options: 'i' } },
      ];
    }
    
    if (query.category) filter.category = query.category;
    if (query.tag) filter.tags = query.tag;

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .select('title slug excerpt featuredImage category tags publishedAt views authorName')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        blogs,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
      { headers: CACHE_HEADERS }
    );
  } catch (error) {
    console.error('Regex search error:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}
