import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BrandStory() {
  return <section aria-labelledby="sourcing-title" className="editorial-wrap py-12 md:py-16">
    <div className="grid items-center gap-8 border-t border-border pt-10 md:grid-cols-2 md:gap-14">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-secondary"><Image src="/images/about/everyday-kitchen.webp" alt="Fresh vegetables, fruit and rice ready for cooking in a home kitchen" fill sizes="(max-width: 767px) calc(100vw - 40px), 50vw" className="object-cover" /></div>
      <div><p className="editorial-label mb-4">FreshPick, for your everyday</p><h2 id="sourcing-title" className="editorial-title">A market that fits your home.</h2><p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">The vegetables for dinner. Fruit for the family. Pantry staples, something homemade and a drink to share. FreshPick brings everyday food shopping together, with room for the growers and small businesses behind it.</p><div className="mt-5 flex flex-wrap gap-x-7 gap-y-2"><Link href="/about" className="editorial-link">About FreshPick <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link><Link href="/farm-to-table" className="editorial-link">Our producers <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></div>
    </div>
  </section>;
}

export function BusinessStory() {
  return <section aria-labelledby="business-title" className="editorial-wrap pb-12 md:pb-20">
    <div className="relative isolate flex min-h-[460px] items-center justify-center overflow-hidden rounded-2xl bg-foreground px-6 py-14 text-center text-white md:min-h-[560px] md:px-14">
      <Image src="/images/editorial/restaurant-kitchen.webp" alt="Food being prepared at a restaurant kitchen counter" fill sizes="(max-width: 1440px) 100vw, 1360px" className="-z-20 object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/55" />
      <div className="max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[0.08em]">FreshPick for business</p>
        <h2 id="business-title" className="mt-5 text-[clamp(2.05rem,6.5vw,5.75rem)] font-bold uppercase leading-[1.01] text-white">Good ingredients.<br />For a bigger table.</h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white">For restaurants, cafés, hotels and workplaces. Let’s discuss a supply arrangement that fits your business.</p>
        <Link href="/b2b" className="mt-7 inline-flex min-h-12 items-center gap-4 rounded-lg border border-white px-6 py-3 text-xs font-bold uppercase transition-colors hover:bg-white hover:text-foreground">Talk to FreshPick <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
    </div>
  </section>;
}
