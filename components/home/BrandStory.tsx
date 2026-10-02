import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BrandStory() {
  return (
    <section aria-labelledby="sourcing-title" className="editorial-wrap">
      <div className="grid gap-9 border-t border-border py-12 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:py-20">
        <div>
          <p className="editorial-label mb-5">The people behind your food</p>
          <h2 id="sourcing-title" className="editorial-title">A closer connection<br className="hidden lg:block" /> to what you eat.</h2>
          <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground">Good food has a story before it reaches your kitchen. Our work is to choose carefully and bring together growers, makers and people who care about what they cook.</p>
          <Link href="/farm-to-table" className="editorial-link mt-6">Our approach to sourcing <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary md:mt-20"><Image src="/images/editorial/sri-lankan-fields.webp" alt="Green fields and trees in the Sri Lankan countryside" fill sizes="(max-width: 767px) calc(100vw - 40px), 50vw" className="object-cover" /></div>
      </div>
      <div className="bg-brand-green px-6 py-12 text-center text-white md:px-12 md:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.08em]">The FreshPick approach</p>
        <h2 className="mx-auto mt-6 max-w-4xl text-[clamp(2.1rem,6vw,5.5rem)] font-bold uppercase leading-[1.01] text-white">Chosen with care.<br />For your kitchen.<br />For every day.</h2>
        <Link href="/about" className="mt-7 inline-flex min-h-11 items-center gap-3 border-b border-white/70 text-xs font-semibold uppercase">Our story <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
    </section>
  );
}

export function BusinessStory() {
  return <section aria-labelledby="business-title" className="editorial-wrap pb-12 md:pb-20">
    <div className="relative isolate flex min-h-[460px] items-center justify-center overflow-hidden bg-foreground px-6 py-14 text-center text-white md:min-h-[560px] md:px-14">
      <Image src="/images/editorial/restaurant-kitchen.webp" alt="Food being prepared at a restaurant kitchen counter" fill sizes="(max-width: 1440px) 100vw, 1360px" className="-z-20 object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/55" />
      <div className="max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[0.08em]">FreshPick for business</p>
        <h2 id="business-title" className="mt-5 text-[clamp(2.5rem,6.5vw,5.75rem)] font-bold uppercase leading-[1.01] text-white">Good ingredients.<br />For a bigger table.</h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white">For restaurants, cafés, hotels and workplaces. Let’s discuss a supply arrangement that fits your business.</p>
        <Link href="/b2b" className="mt-7 inline-flex min-h-12 items-center gap-4 border border-white px-6 py-3 text-xs font-bold uppercase transition-colors hover:bg-white hover:text-foreground">Talk to FreshPick <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
    </div>
  </section>;
}
