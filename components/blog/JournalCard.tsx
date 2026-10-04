import BlogImage from './BlogImage';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { JournalSummary } from '@/models/journal';

export default function JournalCard({ post, headingLevel = 'h3', href }: { post: JournalSummary; headingLevel?: 'h2' | 'h3'; href?: string }) {
  const Heading = headingLevel;
  const date = post.publishedAt ? new Date(post.publishedAt) : null;
  const validDate = date && Number.isFinite(date.getTime()) ? date : null;
  return (
    <article className="min-w-0">
      <Link href={href || `/blog/${encodeURIComponent(post.slug)}`} className="group block">
        <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-secondary">
          <BlogImage src={post.featuredImage?.url || '/images/editorial/pepper-mortar.webp'} alt={post.featuredImage?.alt || post.title} sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) 50vw, (max-width: 1440px) 33vw, 440px" />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold uppercase text-muted-foreground">
          <span>{post.category || 'From the market'}</span>
          {validDate && <time dateTime={validDate.toISOString()}>{new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Colombo' }).format(validDate)}</time>}
        </div>
        <Heading className="market-story-title mt-3 break-words text-xl leading-[1.3] group-hover:underline underline-offset-4 md:text-2xl">{post.title}</Heading>
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
        <span className="editorial-link mt-4">Read story <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
      </Link>
    </article>
  );
}
