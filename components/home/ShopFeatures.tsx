import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const features = [
  { title: 'Dinner, taken care of.', description: 'Discover ready meals for the days you’d rather skip the cooking.', label: 'Explore ready meals', href: '/meals', image: '/images/categories/cooked-food.webp', alt: 'Rice and curry served with vegetables and sliced onions', eyebrow: 'From the kitchen' },
  { title: 'Make it a weekly thing.', description: 'Explore recurring grocery baskets for your regular essentials.', label: 'Find your basket', href: '/subscriptions', image: '/images/editorial/kitchen-basket.webp', alt: 'A woven basket with vegetables, limes and lemongrass', eyebrow: 'Your regular delivery' },
];

export default function ShopFeatures() {
  return (
    <section aria-label="Meals and weekly groceries" className="editorial-wrap editorial-section grid gap-10 md:grid-cols-2 md:gap-6">
      {features.map(feature => <article key={feature.href} className="min-w-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-secondary"><Image src={feature.image} alt={feature.alt} fill sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1440px) 50vw, 668px" className="object-cover" /></div>
        <p className="editorial-label mt-5">{feature.eyebrow}</p>
        <h2 className="mt-3 text-2xl font-bold uppercase leading-tight text-foreground lg:text-3xl">{feature.title}</h2>
        <p className="mt-3 max-w-lg text-base leading-7 text-muted-foreground">{feature.description}</p>
        <Link href={feature.href} className="editorial-link mt-4">{feature.label} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </article>)}
    </section>
  );
}
