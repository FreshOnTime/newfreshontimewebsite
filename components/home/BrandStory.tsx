import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BrandStory() {
  return (
    <>
      <section aria-labelledby="sourcing-title" className="bg-secondary">
        <div className="editorial-wrap grid items-center gap-9 py-10 md:grid-cols-2 md:gap-16 md:py-16">
          <div className="relative aspect-[4/5] max-h-[570px] overflow-hidden"><Image src="/images/editorial/sri-lankan-fields.webp" alt="Green fields and trees in the Sri Lankan countryside" fill sizes="(max-width: 767px) calc(100vw - 40px), 50vw" className="object-cover" /></div>
          <div className="max-w-lg"><p className="editorial-label">The people behind your food</p><h2 id="sourcing-title" className="editorial-title mt-5">A closer connection to what you eat.</h2><p className="mt-6 text-sm leading-7 text-muted-foreground md:text-base">Good food has a story before it reaches your kitchen. Our work is to choose carefully and bring together growers, makers and people who care about what they cook.</p><Link href="/farm-to-table" className="editorial-link mt-6">Our approach to sourcing <ArrowRight strokeWidth={1.5} className="h-4 w-4" aria-hidden="true" /></Link></div>
        </div>
      </section>
      <section aria-label="The FreshPick approach" className="editorial-wrap editorial-section"><div className="grid gap-7 border-y border-border py-9 sm:grid-cols-3 sm:gap-10">{[
        ['Chosen with care', 'A considered selection of produce and everyday ingredients.'],
        ['For your kitchen', 'Shop a single meal or put together your regular grocery bag.'],
        ['People, not just products', 'Discover independent kitchens, recipes and local food makers.'],
      ].map(([title,copy],index) => <div key={title}><span className="text-[10px] tabular-nums text-muted-foreground">0{index+1}</span><h3 className="mt-4 font-serif text-xl font-normal text-brand-green md:text-2xl">{title}</h3><p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">{copy}</p></div>)}</div></section>
    </>
  );
}
export function BusinessStory() {
  return <section aria-labelledby="business-title" className="editorial-wrap editorial-section"><div className="grid items-center gap-8 border-t border-border pt-12 md:grid-cols-2 md:gap-16 md:pt-16"><div><p className="editorial-label">FreshPick for business</p><h2 id="business-title" className="editorial-title mt-5">Good ingredients.<br />For a bigger table.</h2><p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground">For restaurants, cafés, hotels and workplaces. Tell us what you need, and let’s discuss a supply arrangement that fits your business.</p><Link href="/b2b" className="editorial-link mt-6">Talk to FreshPick <ArrowRight strokeWidth={1.5} className="h-4 w-4" aria-hidden="true" /></Link></div><div className="relative aspect-[4/3] overflow-hidden"><Image src="/images/editorial/restaurant-kitchen.webp" alt="Food being prepared at a restaurant kitchen counter" fill sizes="(max-width: 767px) calc(100vw - 40px), 50vw" className="object-cover" /></div></div></section>;
}
