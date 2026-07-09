import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { BlogPost } from '@/components/blog/BlogPost';
import prisma from '@/lib/prisma';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

// ISR: revalidate every 60 seconds so blog content stays fresh without
// re-rendering on every request. `force-dynamic` was removed because it
// contradicts and overrides the `revalidate` directive.
export const revalidate = 60;

// Helper function to get blog data (shared between metadata and page)
async function getBlogData(slug: string) {
  const blog = await prisma.blog.findFirst({
    where: {
      slug,
      isDeleted: false,
      published: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      featuredImage: true,
      category: true,
      tags: true,
      publishedAt: true,
      views: true,
      authorName: true,
      metaTitle: true,
      metaDescription: true,
      metaKeywords: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!blog) return null;
  return { ...blog, _id: blog.id } as any;
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
    prisma.blog.update({
      where: { id: blogData.id },
      data: { views: { increment: 1 } },
    }).catch(() => {});

    // Convert to plain object and serialize dates
    const serializedBlog = {
      ...blogData,
      _id: blogData._id || blogData.id,
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
