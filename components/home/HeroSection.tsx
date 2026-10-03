import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section aria-labelledby="home-title" className="editorial-wrap pt-5 md:pt-6">
      <div className="relative isolate overflow-hidden rounded-2xl bg-background text-brand-green lg:flex lg:min-h-[440px] lg:items-center xl:min-h-[520px]">
        <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-12 lg:w-[52%] lg:py-14 xl:px-12">
          <p className="max-w-xs text-[11px] font-medium uppercase leading-5 tracking-[0.12em] sm:max-w-none sm:text-xs">The FreshPick market · Colombo</p>
          <h1 id="home-title" className="mt-5 font-heading text-[clamp(2.5rem,9vw,5rem)] font-normal leading-[1.04] tracking-[-0.025em] text-brand-green lg:text-[clamp(3.25rem,6.2vw,6.5rem)]">
            <span className="block whitespace-nowrap">Fresh food.</span>
            <span className="block">Full of life.</span>
          </h1>
          <p className="mt-6 max-w-[23rem] text-base leading-7 text-brand-green xl:text-lg">Vegetables, fruit and everyday ingredients.<br />From the market to your kitchen.</p>
          <Link href="#categories-title" className="editorial-button mt-7">Shop by category <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <div className="relative aspect-[4/3] w-full sm:aspect-[2/1] lg:absolute lg:inset-0 lg:aspect-auto">
          <Image src="/images/home/fresh-market-hero.webp" alt="Papaya, bananas, carrots, aubergine, limes and leafy greens arranged on pale stone" fill priority sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1440px) calc(100vw - 80px), 1360px" className="object-cover object-right lg:object-center" />
        </div>
      </div>
      <nav aria-label="More ways to shop" className="flex flex-wrap justify-between gap-x-5 border-b border-border py-3 text-sm font-medium text-brand-green">
        {[['Browse all groceries', '/products'], ['Explore categories', '/categories'], ['Weekly baskets', '/subscriptions']].map(([label, href]) => <Link key={href} href={href} className="inline-flex min-h-11 items-center gap-3 hover:underline underline-offset-4">{label}<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>)}
      </nav>
    </section>
  );
}
