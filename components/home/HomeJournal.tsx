import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import JournalCard from '@/components/blog/JournalCard';
import type { JournalSummary } from '@/models/journal';

export default function HomeJournal({ posts }: { posts: JournalSummary[] }) {
  return (
    <section aria-labelledby="blog-title" className="editorial-wrap editorial-section">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5 md:mb-12">
        <div><p className="editorial-label mb-3">Stories, ingredients and ideas</p><h2 id="blog-title" className="editorial-title">From the blog.</h2></div>
        <Link href="/blog" className="editorial-link">All stories <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
      {posts.length ? <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{posts.map(post => <JournalCard key={post.id} post={post} />)}</div> : (
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
          <Link href="/blog" aria-label="Explore the FreshPick blog" className="relative block aspect-[3/2] overflow-hidden rounded-xl bg-secondary"><Image src="/images/editorial/pepper-mortar.webp" alt="" fill sizes="(max-width: 767px) calc(100vw - 40px), 50vw" className="object-cover" /></Link>
          <div><p className="max-w-lg text-lg leading-8 text-muted-foreground">Explore our blog for ingredient ideas, cooking inspiration and news from FreshPick.</p><Link href="/blog" className="editorial-link mt-6">Explore the blog <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
        </div>
      )}
    </section>
  );
}
