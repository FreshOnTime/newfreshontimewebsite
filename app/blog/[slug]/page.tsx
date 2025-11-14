import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPost } from '@/components/blog/BlogPost';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/blogs/${slug}`, { 
      cache: 'no-store' 
    });
    
    if (!res.ok) {
      return {
        title: 'Blog Post Not Found',
      };
    }
    
    const { blog } = await res.json();
    
    return {
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      keywords: blog.metaKeywords,
      openGraph: {
        title: blog.title,
        description: blog.excerpt,
        type: 'article',
        publishedTime: blog.publishedAt,
        authors: [blog.authorName],
        images: blog.featuredImage ? [blog.featuredImage.url] : [],
      },
    };
  } catch {
    return {
      title: 'Blog Post',
    };
  }
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params;
  
  let blog;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/blogs/${slug}`, { 
      cache: 'no-store' 
    });
    
    if (!res.ok) {
      notFound();
    }
    
    const data = await res.json();
    blog = data.blog;
  } catch {
    notFound();
  }
  
  return <BlogPost blog={blog} />;
}
