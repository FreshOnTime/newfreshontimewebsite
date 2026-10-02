import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCategoryImage } from '@/lib/categoryImage';

interface Category { name: string; slug: string; imageUrl?: string; description?: string; }

export default function CategoryBento({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;
  return (
    <section aria-labelledby="categories-title" className="mx-auto max-w-7xl px-4 pt-9 md:px-8 md:pt-12">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h2 id="categories-title" className="text-2xl font-semibold text-brand-green md:text-[1.75rem]">Shop by category</h2>
        <Link href="/categories" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-green hover:underline">View all <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
      <nav aria-label="Featured categories" className="grid grid-cols-3 gap-x-3 gap-y-6 border-b border-border pb-9 md:grid-cols-6 md:gap-x-5 md:pb-12">
        {categories.slice(0, 6).map((category) => {
          const image = getCategoryImage(category.slug, category.imageUrl);
          return <Link key={category.slug} href={`/categories/${encodeURIComponent(category.slug)}`} className="group flex min-w-0 flex-col items-center rounded-lg px-1 py-2 text-center">
          <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-full bg-secondary/70 transition-colors group-hover:bg-secondary md:h-24 md:w-24"><Image src={image} alt="" fill sizes="(min-width: 768px) 96px, 80px" className={!image.split('?')[0].endsWith('.svg') ? 'object-cover' : 'object-contain p-5 md:p-6'} /></div>
          <span className="text-sm font-medium leading-5 text-foreground group-hover:text-brand-green group-hover:underline underline-offset-4">{category.name}</span>
        </Link>;
        })}
      </nav>
    </section>
  );
}
