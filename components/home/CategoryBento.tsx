import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCategoryImage } from '@/lib/categoryImage';

interface Category { name: string; slug: string; imageUrl?: string; description?: string; }
const marketEdits = [
  { name: 'Fresh produce', href: '/products?search=vegetables', image: '/images/editorial/market-crates.webp', description: 'Vegetables, fruit and the ingredients for everyday cooking.' },
  { name: 'From the kitchen', href: '/meals', image: '/images/categories/cooked-food.webp', description: 'Explore prepared meals for the days you would rather skip the cooking.' },
];

export default function CategoryBento({ categories }: { categories: Category[] }) {
  const produce = categories.find(category => category.slug === 'fresh-produce');
  const featured = produce ? [produce, ...categories.filter(category => category !== produce)] : categories;
  const tiles = featured.length ? featured.slice(0, 2).map(category => ({ name: category.name, href: `/categories/${encodeURIComponent(category.slug)}`, image: getCategoryImage(category.slug, category.imageUrl), description: category.description })) : marketEdits;
  return (
    <section aria-labelledby="categories-title" className="editorial-wrap editorial-section">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5 md:mb-12"><h2 id="categories-title" className="editorial-title">From the market.</h2><Link href="/categories" className="editorial-link">All categories <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      <nav aria-label="Featured categories" className="grid gap-x-5 gap-y-10 sm:grid-cols-2 md:gap-x-6">
        {tiles.map(tile => <Link key={tile.href} href={tile.href} className="group min-w-0">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary"><Image src={tile.image} alt="" fill sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1440px) 50vw, 668px" className={tile.image.split('?')[0].endsWith('.svg') ? 'object-contain p-12' : 'object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.015]'} /></div>
          <h3 className="market-story-title mt-5 text-xl md:text-2xl">{tile.name}</h3>
          {tile.description && <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">{tile.description}</p>}
          <span className="editorial-link mt-4">Shop category <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
        </Link>)}
      </nav>
    </section>
  );
}
