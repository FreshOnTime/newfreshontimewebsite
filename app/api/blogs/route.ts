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
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { excerpt: { $regex: query.search, $options: 'i' } },
        { content: { $regex: query.search, $options: 'i' } },
      ];
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

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .select('-content') // Exclude full content for list view
        .populate('author', 'firstName lastName email')
        .sort({ publishedAt: -1, createdAt: -1 })
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
    console.error('Get public blogs error:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}
