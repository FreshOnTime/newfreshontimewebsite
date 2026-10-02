import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const features = [
  { title: 'Dinner, taken care of.', description: 'Discover ready meals for the days you’d rather skip the cooking.', label: 'Explore ready meals', href: '/meals', image: '/images/categories/cooked-food.webp', alt: 'Rice and curry served with vegetables and sliced onions', eyebrow: 'Ready when you are' },
  { title: 'Make it a weekly thing.', description: 'Explore recurring grocery baskets for your regular essentials.', label: 'Find your basket', href: '/subscriptions', image: '/images/editorial/kitchen-basket.webp', alt: 'A woven basket with vegetables, limes and lemongrass', eyebrow: 'Stock up regularly' },
];

export default function ShopFeatures() {
  return (
    <section aria-label="Meals and weekly groceries" className="mx-auto grid max-w-7xl gap-5 px-5 pt-10 md:grid-cols-2 md:px-8 md:pt-14">
      {features.map((feature) => <article key={feature.href} className="grid grid-cols-[1.25fr_0.75fr] gap-4 border-t border-border pt-6">
        <div className="flex flex-col items-start py-4 lg:py-6">
          <p className="text-xs font-medium text-muted-foreground">{feature.eyebrow}</p>
          <h2 className="mt-2 font-serif text-[1.6rem] font-normal leading-tight text-brand-green lg:text-3xl">{feature.title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
          <Link href={feature.href} className="mt-auto inline-flex min-h-11 items-center gap-2 pt-4 text-sm font-semibold text-brand-green hover:underline">{feature.label} <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>
        </div>
        <div className="relative min-w-0 min-h-60"><Image src={feature.image} alt={feature.alt} fill sizes="(max-width: 767px) 38vw, (max-width: 1280px) 20vw, 235px" className="object-cover" /></div>
      </article>)}
    </section>
  );
}
