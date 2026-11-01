import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import JournalCard from "@/components/blog/JournalCard";
import type { JournalSummary } from "@/models/journal";

export default function HomeJournal({ posts }: { posts: JournalSummary[] }) {
  return (
    <section aria-labelledby="blog-title" className="editorial-wrap py-14 md:py-20">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-5 border-b border-brand-green-deep/20 pb-6">
        <div>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[.22em] text-brand-green">A little inspiration</p>
          <h2 id="blog-title" className="font-heading text-[clamp(2.2rem,4vw,4.5rem)] font-semibold uppercase leading-none tracking-[-.055em] text-brand-green-deep">
            From the journal.
          </h2>
        </div>
        <Link href="/blog" className="inline-flex min-h-11 items-center gap-2 border-b border-brand-green-deep text-xs font-bold uppercase tracking-[.1em] text-brand-green-deep">
          All stories <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      {posts.length ? (
        <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map(post => <JournalCard key={post.id} post={post} />)}
        </div>
      ) : (
        <div className="grid items-center gap-7 md:grid-cols-2 md:gap-12">
          <Link href="/blog" aria-label="Explore the FreshPick blog" className="relative block aspect-[5/3] overflow-hidden bg-secondary">
            <Image src="/images/editorial/pepper-mortar.webp" alt="" fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" />
          </Link>
          <div>
            <p className="font-serif text-2xl leading-8 text-brand-green-deep">Ingredients, ideas and stories worth bringing to the table.</p>
            <Link href="/blog" className="mt-6 inline-flex min-h-11 items-center gap-2 border-b border-brand-green-deep text-xs font-bold uppercase tracking-[.1em] text-brand-green-deep">
              Explore the journal <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
