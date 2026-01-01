import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, ArrowLeft, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: {
    url: string;
    alt?: string;
  };
  category?: string;
  tags: string[];
  publishedAt?: string;
  views: number;
  authorName?: string;
  author?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

interface BlogPostProps {
  blog: Blog;
}

export function BlogPost({ blog }: BlogPostProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <article className="min-h-screen bg-white">
      {/* Back Button - Minimalist */}
      <div className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md z-40 border-b border-zinc-100">
        <div className="container mx-auto px-4 py-4">
          <Link href="/blog" className="inline-flex items-center text-xs font-bold tracking-[0.2em] uppercase text-zinc-500 hover:text-emerald-800 transition-colors">
            <ArrowLeft className="h-3 w-3 mr-2" />
            Back to Journal
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="pt-32 pb-16 md:pt-40 md:pb-24 bg-zinc-50 border-b border-zinc-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Meta Info */}
            <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-bold tracking-[0.2em] uppercase text-emerald-900">
              {blog.category && (
                <span>{blog.category}</span>
              )}
              <span className="text-zinc-300">•</span>
              {blog.publishedAt && (
                <span>{formatDate(blog.publishedAt)}</span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium text-zinc-900 leading-[1.1] tracking-tight">
              {blog.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl md:text-2xl text-zinc-500 font-light leading-relaxed max-w-2xl mx-auto">
              {blog.excerpt}
            </p>
          </div>
        </div>
      </div>

      {/* Featured Image - Full Width/Cinematic */}
      {blog.featuredImage?.url && (
        <div className="w-full h-[50vh] md:h-[70vh] relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20 z-10" />
          <Image
            src={blog.featuredImage.url}
            alt={blog.featuredImage.alt || blog.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-xl prose-zinc max-w-none 
              prose-headings:font-serif prose-headings:font-medium prose-headings:tracking-tight 
              prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
              prose-p:font-light prose-p:leading-loose prose-p:text-zinc-600
              prose-a:text-emerald-700 prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-l-2 prose-blockquote:border-emerald-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-zinc-800
              prose-img:rounded-sm prose-img:shadow-lg">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              >
                {blog.content}
              </ReactMarkdown>
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-16 pt-8 border-t border-zinc-100">
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-medium uppercase tracking-wider rounded-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer CTA - Minimalist */}
      <div className="bg-zinc-950 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6">Continue Reading</h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto font-light">
            Explore more insights from our collection of curated articles.
          </p>
          <Link href="/blog">
            <Button size="lg" className="bg-white text-zinc-950 hover:bg-emerald-50 rounded-none px-12 py-6 uppercase tracking-widest text-xs font-bold transition-all">
              View All Articles
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
