import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Category { name: string; slug: string; imageUrl?: string; description?: string; }

export default function CategoryBento({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;
  return (
    <section aria-labelledby="categories-title" className="mx-auto max-w-7xl px-4 pt-9 md:px-8 md:pt-12">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h2 id="categories-title" className="text-2xl font-semibold text-brand-green md:text-[1.75rem]">Shop by category</h2>
        <Link href="/categories" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-green hover:underline">View all <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
      <nav aria-label="Featured categories" className="grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-4">
        {categories.slice(0, 6).map((category) => <Link key={category.slug} href={`/categories/${category.slug}`} className="group flex min-w-0 flex-col items-center rounded-lg border border-border bg-background px-2 pb-4 pt-4 text-center transition-colors hover:border-brand-green hover:bg-secondary/40 md:px-3">
          <div className="relative mb-3 h-16 w-16 md:h-20 md:w-20"><Image src={category.imageUrl || '/category-icons/placeholder.svg'} alt="" fill sizes="80px" className="object-contain" /></div>
          <span className="text-sm font-medium leading-5 text-brand-green">{category.name}</span>
        </Link>)}
      </nav>
    </section>
  );
}
