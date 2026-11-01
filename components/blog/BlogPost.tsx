import Link from 'next/link';
import BlogImage from './BlogImage';
import { normalizeBlogImage } from '@/lib/blogImages';

import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
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
  path?: string;
}

export function BlogPost({ blog, path = `/blog/${encodeURIComponent(blog.slug)}` }: BlogPostProps) {
  const image = normalizeBlogImage(blog.featuredImage);
  const readingMinutes = Math.max(1, Math.ceil(blog.content.split(/\s+/).length / 200));
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
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': absoluteUrl(`${path}#article`),
        url: absoluteUrl(path),
        headline: blog.title,
        description: blog.excerpt,
        mainEntityOfPage: absoluteUrl(path),
        image: absoluteUrl(image.url),
        datePublished: blog.publishedAt || undefined,
        dateModified: blog.updatedAt || undefined,
        author: { '@type': blog.authorName && blog.authorName !== 'FreshPick' ? 'Person' : 'Organization', name: blog.authorName || 'FreshPick' },
        publisher: { '@id': absoluteUrl('/#organization') },
        isPartOf: { '@type': 'Blog', '@id': absoluteUrl('/blog#blog'), name: 'The FreshPick blog', url: absoluteUrl('/blog') },
        inLanguage: 'en-LK',
        articleSection: blog.category,
        keywords: blog.tags,
        about: blog.tags.map((tag) => ({ '@type': 'Thing', name: tag })),
        wordCount: blog.content.split(/\s+/).length,
      }} />
      <BreadcrumbJsonLd items={[{ name: 'Home', url: absoluteUrl('/') }, { name: 'Blog', url: absoluteUrl('/blog') }, { name: blog.title, url: absoluteUrl(path) }]} />
      <nav aria-label="Article navigation" className="border-b border-brand-green/10 bg-brand-cream">
        <div className="editorial-wrap py-3">
          <Link href="/blog" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-green transition-colors hover:text-brand-green-deep">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to the journal
          </Link>
        </div>
      </nav>

      <header className="border-b border-brand-green/10 bg-brand-cream py-12 sm:py-16 lg:py-20">
        <div className="editorial-wrap">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-brand-green">
              {blog.category && (
                <span>{blog.category}</span>
              )}
              <span>{readingMinutes} min read</span>
              <span>By {blog.authorName || 'FreshPick'}</span>
              {blog.publishedAt && (
                <time dateTime={blog.publishedAt}>{formatDate(blog.publishedAt)}</time>
              )}
            </div>

            <h1 className="mt-7 max-w-[21ch] font-heading text-[clamp(2.75rem,5.4vw,5.7rem)] font-semibold leading-[1.06] tracking-[-.052em] text-brand-green-deep">
              {blog.title}
            </h1>

            <p className="mt-7 max-w-[65ch] text-lg leading-[1.8] text-foreground/75 md:text-xl">
              {blog.excerpt}
            </p>
            <a href="#article-content" className="mt-8 inline-flex min-h-11 items-center gap-2 border-b border-brand-green/35 text-sm font-semibold text-brand-green hover:border-brand-green">Read article <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
          </div>
        </div>
      </header>

      <figure className="editorial-wrap mx-auto mt-8 max-w-[1160px] md:mt-12">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-secondary shadow-[0_20px_50px_-35px_rgba(16,46,30,.35)] md:aspect-[16/9] md:rounded-[2rem]">
          <BlogImage src={image.url} alt={image.alt || blog.title} priority
            sizes="(max-width: 1024px) calc(100vw - 40px), 960px" />
        </div>
      </figure>

      <section id="article-content" aria-label="Article content" className="scroll-mt-32 bg-background">
        <div className="editorial-wrap py-12 md:py-20">
          <div className="mx-auto max-w-[770px]">
            <div className="prose prose-base max-w-none break-words text-foreground/85 md:prose-lg prose-headings:font-heading prose-headings:font-semibold prose-headings:leading-[1.2] prose-headings:tracking-[-.035em] prose-headings:text-brand-green-deep prose-h2:mb-5 prose-h2:mt-12 prose-h2:text-3xl prose-h3:mt-9 prose-h3:text-2xl prose-p:leading-[1.95] prose-p:text-foreground/80 prose-strong:text-brand-green-deep prose-a:font-semibold prose-a:text-brand-green prose-a:underline prose-a:decoration-brand-green/30 prose-a:underline-offset-4 hover:prose-a:decoration-brand-green prose-li:leading-[1.85] prose-blockquote:rounded-r-xl prose-blockquote:border-l-4 prose-blockquote:border-brand-amber prose-blockquote:bg-white/75 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:not-italic prose-blockquote:text-brand-green-deep [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_pre]:overflow-x-auto prose-img:rounded-2xl">
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
              <div className="mt-12 border-t border-brand-green/15 pt-8">
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span key={index} className="rounded-full border border-brand-green/15 bg-white px-4 py-2 text-xs font-medium text-brand-green">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-brand-green/10 bg-brand-cream py-14 md:py-20" aria-labelledby="keep-reading-heading">
        <div className="editorial-wrap grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,.8fr)] md:items-end">
          <div>
            <h2 id="keep-reading-heading" className="max-w-[15ch] font-heading text-[clamp(2.2rem,4vw,3.7rem)] font-semibold leading-[1.1] tracking-[-.045em] text-brand-green-deep">There’s more at the market.</h2>
            <p className="mt-5 max-w-lg text-base leading-8 text-muted-foreground">Keep exploring practical guides and ingredients for everyday cooking.</p>
          </div>
          <nav aria-label="Keep exploring" className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Link href="/blog" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-brand-green/25 bg-white px-6 py-3 text-sm font-semibold text-brand-green hover:border-brand-green">More stories <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link href="/products" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-green-deep px-6 py-3 text-sm font-semibold text-white hover:bg-brand-green">Shop the market <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </nav>
        </div>
      </section>
    </article>
  );
}
