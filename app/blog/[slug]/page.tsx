import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPost } from '@/components/blog/BlogPost';
import connectDB from '@/lib/database';
import Blog from '@/lib/models/Blog';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    await connectDB();
    const blog = await Blog.findOne({ 
      slug, 
      isDeleted: false,
      published: true,
    })
    .populate('author', 'firstName lastName email')
    .lean();
    
    if (!blog) {
      return {
        title: 'Blog Post Not Found',
      };
    }

    // Type assertion for the blog object
    const blogData = blog as any;
    
    return {
      title: blogData.metaTitle || blogData.title,
      description: blogData.metaDescription || blogData.excerpt,
      keywords: blogData.metaKeywords,
      openGraph: {
        title: blogData.title,
        description: blogData.excerpt,
        type: 'article',
        publishedTime: blogData.publishedAt?.toISOString?.() || blogData.publishedAt,
        authors: [blogData.authorName],
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

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params;
  
  try {
    await connectDB();
    const blog = await Blog.findOne({ 
      slug, 
      isDeleted: false,
      published: true,
    })
    .populate('author', 'firstName lastName email')
    .lean();
    
    if (!blog) {
      notFound();
    }

    // Type assertion for the blog object
    const blogData = blog as any;

    // Increment view count
    await Blog.findOneAndUpdate(
      { slug, isDeleted: false, published: true },
      { $inc: { views: 1 } }
    );

    // Convert to plain object and serialize dates
    const serializedBlog = {
      ...blogData,
      _id: blogData._id?.toString?.() || blogData._id,
      createdAt: blogData.createdAt?.toISOString?.() || blogData.createdAt,
      updatedAt: blogData.updatedAt?.toISOString?.() || blogData.updatedAt,
      publishedAt: blogData.publishedAt?.toISOString?.() || blogData.publishedAt,
      author: blogData.author ? {
        ...blogData.author,
        _id: blogData.author._id?.toString?.() || blogData.author._id,
      } : undefined,
    };
    
    return <BlogPost blog={serializedBlog} />;
  } catch (error) {
    console.error('Error fetching blog:', error);
    notFound();
  }
}
