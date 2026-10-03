import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import JsonLd from '@/components/seo/JsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { absoluteUrl } from '@/lib/config/site';

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
  updatedAt?: string;
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
      const date = new Date(dateString);
      if (!Number.isFinite(date.getTime())) return '';
      return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Colombo',
      });
    } catch {
      return '';
    }
  };

  return (
    <article className="min-h-screen bg-background">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': absoluteUrl(`/blog/${encodeURIComponent(blog.slug)}#article`), headline: blog.title, description: blog.excerpt, mainEntityOfPage: absoluteUrl(`/blog/${encodeURIComponent(blog.slug)}`), image: blog.featuredImage?.url ? absoluteUrl(blog.featuredImage.url) : undefined, datePublished: blog.publishedAt || undefined, dateModified: blog.updatedAt || undefined, author: { '@type': blog.authorName && blog.authorName !== 'FreshPick' ? 'Person' : 'Organization', name: blog.authorName || 'FreshPick' }, publisher: { '@id': absoluteUrl('/#organization') }, inLanguage: 'en-LK' }} />
      <BreadcrumbJsonLd items={[{ name: 'Home', url: absoluteUrl('/') }, { name: 'Blog', url: absoluteUrl('/blog') }, { name: blog.title, url: absoluteUrl(`/blog/${encodeURIComponent(blog.slug)}`) }]} />
      {/* Back Button - Minimalist */}
      <div className="w-full bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link href="/blog" className="inline-flex items-center text-xs font-bold normal-case text-muted-foreground hover:text-brand-green transition-colors">
            <ArrowLeft className="h-3 w-3 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="pt-12 pb-8 md:pt-12 md:pb-10 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Meta Info */}
            <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-bold normal-case text-brand-green">
              {blog.category && (
                <span>{blog.category}</span>
              )}
              <span>By {blog.authorName || 'FreshPick'}</span>
              {blog.publishedAt && (
                <time dateTime={blog.publishedAt}>{formatDate(blog.publishedAt)}</time>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-foreground leading-[1.1] tracking-tight">
              {blog.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl md:text-2xl text-muted-foreground font-normal leading-relaxed max-w-2xl mx-auto">
              {blog.excerpt}
            </p>
          </div>
        </div>
      </div>

      {/* Featured Image - Full Width/Cinematic */}
      {blog.featuredImage?.url && (
        <div className="w-full h-[50vh] md:h-[70vh] relative overflow-hidden">

          <Image
            src={blog.featuredImage.url}
            alt={blog.featuredImage.alt || blog.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      )}

      {/* Content */}
      <div className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg prose-zinc max-w-[68ch] mx-auto prose-headings:font-serif prose-headings:font-medium prose-headings:tracking-tight prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:font-normal prose-p:leading-[1.8] prose-p:text-muted-foreground prose-a:text-brand-green prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:not-italic prose-blockquote:text-foreground prose-img:rounded-sm prose-img:shadow-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
                components={{ h1: ({ children }) => <h2>{children}</h2> }}
              >
                {blog.content}
              </ReactMarkdown>
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-background text-muted-foreground text-xs font-medium normal-case rounded-sm">
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
      <div className="bg-secondary text-foreground py-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-2xl font-serif mb-6">Continue Reading</h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto font-normal">
            Explore more insights from our collection of curated articles.
          </p>
          <Link href="/blog">
            <Button size="lg" className="bg-background text-foreground hover:bg-secondary rounded-lg px-12 py-6 normal-case text-xs font-bold transition-all">
              View All Articles
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
