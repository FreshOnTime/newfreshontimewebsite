import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section aria-labelledby="home-title" className="mx-auto max-w-7xl px-4 pt-5 md:px-8 md:pt-7">
      <div className="grid overflow-hidden rounded-lg bg-brand-green md:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col items-start justify-center px-6 py-8 text-background md:px-10 md:py-12 lg:px-12 lg:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.15em]">FreshPick market</p>
          <h1 id="home-title" className="mt-4 max-w-lg text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[3.75rem]">Fresh food.<br />Every day.</h1>
          <p className="mt-5 max-w-sm text-base leading-7 text-background/90">Fruit, vegetables and pantry essentials for whatever you’re cooking.</p>
          <Link href="/products" className="mt-7 inline-flex min-h-12 items-center gap-6 rounded-md bg-brand-amber px-5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-brand-amber/90">Shop groceries <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <div className="relative min-w-0 aspect-[2/1] md:aspect-auto md:min-h-[400px] lg:min-h-[438px]">
          <Image src="/images/home/produce-basket.webp" alt="A basket of fresh vegetables in natural sunlight" fill priority sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1280px) 55vw, 670px" className="object-cover" />
        </div>
      </div>
      <nav aria-label="More ways to shop" className="grid grid-cols-3 border-b border-border py-2 md:py-3">
        {[
          ['Groceries & essentials', '/products'],
          ['Food from local makers', '/homemade'],
          ['Your weekly basket', '/subscriptions'],
        ].map(([label, href], index) => <Link key={href} href={href} className={`flex min-h-11 items-center justify-center px-2 text-center text-xs font-medium text-brand-green hover:underline underline-offset-4 sm:text-sm ${index > 0 ? 'border-l border-border' : ''}`}>{label}</Link>)}
      </nav>
    </section>
  );
}
