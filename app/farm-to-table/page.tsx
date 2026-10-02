import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import PremiumPageHeader from '@/components/ui/PremiumPageHeader';

export const metadata: Metadata = {
  title: 'Our producers & sourcing | FreshPick',
  description: 'Explore fresh produce, local makers and the people supplying the FreshPick market in Sri Lanka.',
};

export default function FarmToTablePage() {
  return <div>
    <PremiumPageHeader eyebrow="Our producers & sourcing" title="Good food has a human side." subtitle="Behind the ingredients we bring home are growers, suppliers and independent makers. Explore their food through the FreshPick market." backgroundImage="/images/editorial/sri-lankan-fields.webp" />
    <section className="editorial-wrap editorial-section grid gap-10 md:grid-cols-[1fr_1.3fr] md:gap-20">
      <h2 className="editorial-title">Closer to the food on your table.</h2>
      <div className="space-y-6 text-base leading-8 text-muted-foreground">
        <p>Shopping for good food starts with paying attention: to the ingredients, the people making them and what is available today. Our market brings fresh produce, everyday essentials and food from local businesses into one place.</p>
        <p>Explore the current selection, choose what suits your kitchen and find something new alongside the things you buy every week.</p>
        <Link href="/products" className="editorial-link">Explore the market</Link>
      </div>
    </section>
    <section className="bg-secondary">
      <div className="editorial-wrap editorial-section grid items-center gap-10 md:grid-cols-2 md:gap-20">
        <div className="relative aspect-[4/3] bg-background"><Image src="/images/editorial/hands-at-work.webp" alt="Hands kneading dough on a kitchen work surface" fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" /></div>
        <div><p className="editorial-label mb-5">Independent makers</p><h2 className="editorial-title">Small kitchens. Plenty of character.</h2><p className="mt-6 max-w-lg text-base leading-8 text-muted-foreground">From homemade food to handcrafted goods, discover what local businesses are making. Browse their available products and bring a little of their craft into your everyday life.</p><Link href="/homemade" className="editorial-link mt-7">Meet the market’s makers</Link></div>
      </div>
    </section>
    <section className="editorial-wrap editorial-section flex flex-col gap-6 border-b border-border md:flex-row md:items-center md:justify-between"><div><p className="editorial-label mb-3">Grow with FreshPick</p><h2 className="font-serif text-3xl text-brand-green">Have something good to share?</h2></div><Link href="/b2b" className="editorial-button">Become a partner</Link></section>
  </div>;
}
