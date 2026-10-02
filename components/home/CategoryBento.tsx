import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface Category { name: string; slug: string; imageUrl?: string; description?: string; }

export default function CategoryBento({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;
  return (
    <section aria-label="Shop by category" className="mx-auto max-w-7xl px-5 md:px-8">
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 border-y border-border py-4 md:flex md:flex-wrap md:gap-x-8 md:py-5">
        <p className="shrink-0 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">The market</p>
        <nav aria-label="Featured categories" className="col-span-2 row-start-2 flex min-w-0 items-center gap-x-6 overflow-x-auto pb-1 md:flex-1 md:flex-wrap md:gap-x-8 md:gap-y-1 md:overflow-visible md:pb-0">
          {categories.slice(0, 6).map((category) => <Link key={category.slug} href={`/categories/${category.slug}`} className="inline-flex min-h-10 shrink-0 items-center text-sm font-medium text-brand-green underline-offset-4 hover:underline">{category.name}</Link>)}
        </nav>
        <Link href="/categories" className="col-start-2 row-start-1 inline-flex min-h-10 items-center gap-2 text-xs text-muted-foreground hover:text-brand-green">All categories <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
