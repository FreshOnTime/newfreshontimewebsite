import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section aria-labelledby="home-title" className="editorial-wrap pt-5 md:pt-8">
      <div className="grid items-stretch gap-7 md:grid-cols-[0.85fr_1.15fr] md:gap-10">
        <div className="flex flex-col items-start justify-center py-7 md:py-12">
          <p className="editorial-label">The FreshPick market · Colombo</p>
          <h1 id="home-title" className="mt-6 max-w-lg font-serif text-[2.8rem] font-normal leading-[1.02] tracking-[-0.045em] text-brand-green sm:text-6xl lg:text-[5.25rem]">Good food starts with good produce.</h1>
          <p className="mt-6 max-w-sm text-sm leading-7 text-muted-foreground md:text-base">Fresh vegetables, fruit and everyday ingredients. A thoughtfully chosen market, delivered to your kitchen.</p>
          <Link href="/products" className="editorial-button mt-8">Shop fresh produce <ArrowRight strokeWidth={1.5} className="h-4 w-4" aria-hidden="true" /></Link>
          <Link href="/about" className="mt-5 inline-flex min-h-11 items-center text-sm text-brand-green underline decoration-border underline-offset-8 hover:decoration-brand-green">Get to know FreshPick</Link>
        </div>
        <figure className="min-w-0">
          <div className="relative aspect-[4/3] overflow-hidden md:h-full md:min-h-[520px] md:aspect-auto"><Image src="/images/home/produce-basket.webp" alt="Fresh vegetables gathered in a woven basket in natural light" fill priority sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1280px) 55vw, 680px" className="object-cover" /></div>
          <figcaption className="mt-3 flex justify-between gap-4 text-[10px] uppercase tracking-[0.12em] text-muted-foreground"><span>Fresh produce. Everyday cooking.</span><span>FreshPick</span></figcaption>
        </figure>
      </div>
      <nav aria-label="More ways to shop" className="mt-8 flex flex-wrap justify-between gap-x-5 border-b border-border py-3 text-xs text-muted-foreground md:mt-10">
        {[['The everyday market', '/products'], ['From local kitchens', '/homemade'], ['Your regular basket', '/subscriptions']].map(([label, href]) => <Link key={href} href={href} className="inline-flex min-h-11 items-center gap-3 hover:text-brand-green">{label}<ArrowRight strokeWidth={1.5} className="h-3.5 w-3.5" aria-hidden="true" /></Link>)}
      </nav>
    </section>
  );
}
