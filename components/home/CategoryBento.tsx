import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCategoryImage } from '@/lib/categoryImage';

interface Category { name: string; slug: string; imageUrl?: string; description?: string; }
const marketEdits = [
  { name: 'Vegetables for the week', href: '/products?search=vegetables', image: '/images/home/produce-basket.webp' },
  { name: 'Something green', href: '/products?search=greens', image: '/images/home/market-bag.webp' },
  { name: 'Everyday favourites', href: '/products', image: '/images/home/tomatoes.webp' },
];
export default function CategoryBento({ categories }: { categories: Category[] }) {
  const tiles = categories.length ? categories.slice(0, 3).map(category => ({ name: category.name, href: `/categories/${encodeURIComponent(category.slug)}`, image: getCategoryImage(category.slug, category.imageUrl) })) : marketEdits;
  return (
    <section aria-labelledby="categories-title" className="editorial-wrap editorial-section">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="editorial-label mb-3">A little inspiration</p><h2 id="categories-title" className="editorial-title">Find your next good ingredient.</h2></div><Link href="/categories" className="editorial-link">Explore the market <ArrowRight strokeWidth={1.5} className="h-4 w-4" aria-hidden="true" /></Link></div>
      <nav aria-label="Featured categories" className="grid gap-x-5 gap-y-8 sm:grid-cols-3 md:gap-x-8">
        {tiles.map((tile, index) => <Link key={tile.href} href={tile.href} className="group min-w-0"><div className="relative aspect-[4/3] overflow-hidden bg-secondary"><Image src={tile.image} alt="" fill sizes="(max-width: 639px) calc(100vw - 40px), 33vw" className={tile.image.split('?')[0].endsWith('.svg') ? 'object-contain p-12' : 'object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.025]'} /></div><div className="mt-4 flex items-center justify-between gap-3"><h3 className="font-serif text-xl font-normal text-brand-green md:text-2xl">{tile.name}</h3><ArrowRight strokeWidth={1.5} className="h-4 w-4 shrink-0 text-brand-green" aria-hidden="true" /></div><p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Market selection / 0{index + 1}</p></Link>)}
      </nav>
    </section>
  );
}
