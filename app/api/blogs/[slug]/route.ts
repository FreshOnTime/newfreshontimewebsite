import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Blog from '@/lib/models/Blog';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;

    const blog = await Blog.findOne({ 
      slug, 
      isDeleted: false,
      published: true,
    })
    .populate('author', 'firstName lastName email')
    .lean();

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Increment view count
    await Blog.findOneAndUpdate(
      { slug, isDeleted: false, published: true },
      { $inc: { views: 1 } }
    );

    return NextResponse.json({ blog });
  } catch (error) {
    console.error('Get blog by slug error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
}
