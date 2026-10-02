import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const features = [
  { title: 'Dinner, taken care of.', description: 'Discover ready meals for the days you’d rather skip the cooking.', label: 'Explore ready meals', href: '/meals', image: '/images/home/kitchen.webp', alt: 'Fresh ingredients laid out for a meal', eyebrow: 'Ready when you are' },
  { title: 'Make it a weekly thing.', description: 'Explore recurring grocery baskets for your regular essentials.', label: 'Find your basket', href: '/subscriptions', image: '/images/home/market-bag.webp', alt: 'A reusable shopping bag filled with green vegetables', eyebrow: 'Stock up regularly' },
];

export default function ShopFeatures() {
  return (
    <section aria-label="Meals and weekly groceries" className="mx-auto grid max-w-7xl gap-5 px-4 pt-10 md:grid-cols-2 md:px-8 md:pt-14">
      {features.map((feature) => <article key={feature.href} className="grid grid-cols-[1.25fr_0.75fr] overflow-hidden rounded-lg border border-border bg-secondary/40">
        <div className="flex flex-col items-start px-5 py-6 lg:px-7 lg:py-8">
          <p className="text-xs font-medium text-muted-foreground">{feature.eyebrow}</p>
          <h2 className="mt-2 text-[1.375rem] font-semibold leading-tight text-brand-green lg:text-[1.75rem]">{feature.title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
          <Link href={feature.href} className="mt-auto inline-flex min-h-11 items-center gap-2 pt-4 text-sm font-semibold text-brand-green hover:underline">{feature.label} <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>
        </div>
        <div className="relative min-w-0"><Image src={feature.image} alt={feature.alt} fill sizes="(max-width: 767px) 38vw, (max-width: 1280px) 20vw, 235px" className="object-cover" /></div>
      </article>)}
    </section>
  );
}
