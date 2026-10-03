import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCategoryImage } from '@/lib/categoryImage';

interface Category { name: string; slug: string; imageUrl?: string; description?: string; }
// If the catalogue is temporarily unavailable, searches remain valid destinations.
const marketEdits = [
  { name: 'Vegetables & greens', href: '/products?search=vegetables', image: '/images/editorial/market-crates.webp' },
  { name: 'Fruit', href: '/products?search=fruit', image: '/images/categories/fruits.webp' },
  { name: 'Pantry staples', href: '/products?search=pantry', image: '/images/categories/pantry-staples.webp' },
  { name: 'Bakery', href: '/products?search=bread', image: '/images/categories/bakery.webp' },
  { name: 'Prepared food', href: '/products?search=cooked', image: '/images/categories/cooked-food.webp' },
  { name: 'Beverages', href: '/products?search=beverages', image: '/images/categories/beverages.webp' },
];

export default function CategoryBento({ categories }: { categories: Category[] }) {
  const produce = categories.find(category => category.slug === 'fresh-produce');
  const featured = produce ? [produce, ...categories.filter(category => category !== produce)] : categories;
  const tiles = featured.length ? featured.slice(0, 6).map(category => ({ name: category.name, href: `/categories/${encodeURIComponent(category.slug)}`, image: getCategoryImage(category.slug, category.imageUrl) })) : marketEdits;
  return (
    <section aria-labelledby="categories-title" className="editorial-wrap editorial-section">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div><h2 id="categories-title" className="editorial-title scroll-mt-32">Shop by category.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Start with what you need. Find the ingredients, essentials and little extras for your home.</p></div>
        <Link href="/categories" className="editorial-link">All categories <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
      <nav aria-label="Featured categories" className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:gap-x-6 md:gap-y-9">
        {tiles.map(tile => <Link key={tile.href} href={tile.href} className="group min-w-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-green">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-secondary"><Image src={tile.image} alt="" fill sizes="(max-width: 639px) 50vw, (max-width: 1440px) 33vw, 440px" className={tile.image.split('?')[0].endsWith('.svg') ? 'object-contain p-8' : 'object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.025]'} /></div>
          <div className="mt-4 flex items-start justify-between gap-2"><h3 className="text-base font-semibold leading-6 text-brand-green md:text-xl">{tile.name}</h3><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-brand-green" aria-hidden="true" /></div>
        </Link>)}
      </nav>
    </section>
  );
}
