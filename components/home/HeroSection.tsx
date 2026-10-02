import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section aria-labelledby="home-title" className="mx-auto max-w-7xl px-5 md:px-8">
      <div className="grid gap-8 py-8 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-12 md:py-12 lg:gap-20">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">FreshPick · Colombo</p>
          <h1 id="home-title" className="home-display mt-5 text-[2.8rem] leading-[1.02] text-brand-green sm:text-6xl lg:text-[4.5rem]">The everyday<br />market.</h1>
          <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground md:text-base">Fresh groceries, pantry staples and local food, all in one place.</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 md:gap-x-6">
            <Link href="/products" className="inline-flex min-h-12 items-center gap-5 rounded-md bg-brand-amber px-5 text-sm font-medium text-accent-foreground transition-colors hover:bg-brand-amber/85">Shop the market <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link href="/homemade" className="inline-flex min-h-12 items-center gap-2 text-sm font-medium text-brand-green hover:underline underline-offset-4">Local makers <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
        <figure className="min-w-0">
          <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-secondary md:aspect-[8/5]">
            <Image src="/images/home/tomatoes.webp" alt="Ripe tomatoes on the vine, ready for the kitchen" fill priority sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1280px) 50vw, 580px" className="object-cover" />
          </div>
          <figcaption className="flex items-center justify-between gap-4 border-b border-border py-3 text-xs text-muted-foreground"><span>Good ingredients. Everyday cooking.</span><Link href="/recipes" className="inline-flex min-h-8 shrink-0 items-center gap-2 text-brand-green hover:underline">Find a recipe <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></Link></figcaption>
        </figure>
      </div>
    </section>
  );
}
