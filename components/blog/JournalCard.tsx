import BlogImage from './BlogImage';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { JournalSummary } from '@/models/journal';

export default function JournalCard({ post, headingLevel = 'h3', href }: { post: JournalSummary; headingLevel?: 'h2' | 'h3'; href?: string }) {
  const Heading = headingLevel;
  const date = post.publishedAt ? new Date(post.publishedAt) : null;
  const validDate = date && Number.isFinite(date.getTime()) ? date : null;
  return (
    <article className="group min-w-0 overflow-hidden rounded-2xl border border-brand-green/10 bg-white/80 p-3 shadow-[0_12px_45px_-32px_rgba(16,46,30,.3)] transition-[transform,border-color,box-shadow] duration-300 hover:border-brand-green/25 hover:shadow-[0_20px_45px_-26px_rgba(16,46,30,.3)] motion-safe:hover:-translate-y-1">
      <Link href={href || `/blog/${encodeURIComponent(post.slug)}`} className="flex h-full flex-col">
        <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-secondary [&_img]:transition-transform [&_img]:duration-500 motion-safe:group-hover:[&_img]:scale-[1.04]">
          <BlogImage src={post.featuredImage?.url || '/images/editorial/pepper-mortar.webp'} alt={post.featuredImage?.alt || post.title} sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) 50vw, (max-width: 1440px) 33vw, 440px" />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 px-2 text-xs font-medium text-brand-green">
          <span>{post.category || 'From the market'}</span>
          {validDate && <time dateTime={validDate.toISOString()}>{new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Colombo' }).format(validDate)}</time>}
        </div>
        <Heading className="market-story-title mt-4 break-words px-2 text-[1.3rem] font-semibold leading-[1.25] tracking-[-.035em] text-brand-green-deep group-hover:underline underline-offset-4 md:text-2xl">{post.title}</Heading>
        <p className="mt-4 line-clamp-3 px-2 text-sm leading-7 text-foreground/70">{post.excerpt}</p>
        <span className="mb-3 mt-auto inline-flex min-h-11 items-center gap-2 px-2 pt-5 text-sm font-semibold text-brand-green">Read story <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
      </Link>
    </article>
  );
}
