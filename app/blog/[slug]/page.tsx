import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { BlogPost } from '@/components/blog/BlogPost';
import connectDB from '@/lib/database';
import Blog from '@/lib/models/Blog';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

// Enable dynamic rendering with caching
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

// Helper function to get blog data (shared between metadata and page)
async function getBlogData(slug: string) {
  await connectDB();
  const blog = await Blog.findOne({ 
    slug, 
    isDeleted: false,
    published: true,
  })
  .select('title slug excerpt content featuredImage category tags publishedAt views authorName metaTitle metaDescription metaKeywords')
  .lean();
  
  return blog as any;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const blogData = await getBlogData(slug);
    
    if (!blogData) {
      return {
        title: 'Blog Post Not Found',
      };
    }
    
    return {
      title: blogData.metaTitle || blogData.title,
      description: blogData.metaDescription || blogData.excerpt,
      keywords: blogData.metaKeywords,
      openGraph: {
        title: blogData.title,
        description: blogData.excerpt,
        type: 'article',
        publishedTime: blogData.publishedAt?.toISOString?.() || blogData.publishedAt,
        images: blogData.featuredImage ? [blogData.featuredImage.url] : [],
      },
    };
  } catch (error) {
    console.error('Error fetching blog metadata:', error);
    return {
      title: 'Blog Post',
    };
  }
}

// Loading fallback component
function BlogSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="h-10 w-32 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params;
  
  try {
    const blogData = await getBlogData(slug);
    
    if (!blogData) {
      notFound();
    }

    // Increment view count in background (non-blocking)
    Blog.updateOne(
      { slug, isDeleted: false, published: true },
      { $inc: { views: 1 } }
    ).exec().catch(() => {});

    // Convert to plain object and serialize dates
    const serializedBlog = {
      ...blogData,
      _id: blogData._id?.toString?.() || blogData._id,
      createdAt: blogData.createdAt?.toISOString?.() || blogData.createdAt,
      updatedAt: blogData.updatedAt?.toISOString?.() || blogData.updatedAt,
      publishedAt: blogData.publishedAt?.toISOString?.() || blogData.publishedAt,
    };
    
    return (
      <Suspense fallback={<BlogSkeleton />}>
        <BlogPost blog={serializedBlog} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error fetching blog:', error);
    notFound();
  }
}
