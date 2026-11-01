import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * Editorial, static homepage masthead. The photograph is an existing, licensed
 * FreshPick asset documented in docs/HOMEPAGE_HERO.md, not Natoora artwork.
 */
const MARKET_HERO_PHOTO =
  "https://images.unsplash.com/photo-1595275522477-c3ce3ca9714b?auto=format&fit=crop&w=1440&q=85";

export default function HeroSection() {
  return (
    <section aria-labelledby="home-hero-heading" className="overflow-hidden bg-brand-cream">
      <div className="editorial-wrap pb-9 pt-10 text-center sm:pb-12 sm:pt-16 lg:pb-16 lg:pt-20">
        <p className="mb-5 text-[10px] font-bold uppercase tracking-[.23em] text-brand-green sm:text-xs">
          Sri Lanka&apos;s online food market
        </p>
        <h1
          id="home-hero-heading"
          className="mx-auto max-w-[17ch] font-heading text-[clamp(2.65rem,6.6vw,6.6rem)] font-semibold uppercase leading-[.99] tracking-[-.065em] text-brand-green-deep"
        >
          A whole market.
          <span className="mt-1 block font-normal normal-case italic tracking-[-.065em] text-brand-green" style={{ fontFamily: "Georgia, Times New Roman, serif" }}>
            For every table.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-[51ch] text-sm leading-7 text-foreground/75 sm:mt-7 sm:text-base sm:leading-8">
          Fresh produce, bakery, pantry staples, dairy, ready meals and food from local makers.
          Good food for the way you shop and cook.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:mt-9">
          <Link
            href="/products"
            className="inline-flex min-h-12 items-center justify-center gap-3 bg-brand-green-deep px-7 py-3 text-xs font-semibold uppercase tracking-[.1em] text-white transition-colors hover:bg-brand-green"
          >
            Shop the market <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex min-h-12 items-center justify-center gap-3 border border-brand-green-deep px-7 py-3 text-xs font-semibold uppercase tracking-[.1em] text-brand-green-deep transition-colors hover:bg-brand-green-deep hover:text-white"
          >
            How it works <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="relative h-[250px] w-full bg-brand-green-deep sm:h-[390px] lg:h-[490px] xl:h-[540px]">
        <Image
          src={MARKET_HERO_PHOTO}
          alt="Bread, milk, eggs, fruit and other foods selected for everyday grocery shopping"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/65 to-transparent" />
        <div className="editorial-wrap absolute inset-x-0 bottom-5 flex items-end justify-between gap-3 text-white sm:bottom-8">
          <p className="max-w-[22ch] text-xs font-semibold uppercase leading-5 tracking-[.18em] sm:text-sm">
            Everyday food, all together.
          </p>
          <Link
            href="/categories"
            className="inline-flex min-h-11 items-center gap-2 border-b border-white/80 text-xs font-semibold uppercase tracking-[.12em] hover:border-white sm:text-sm"
          >
            Explore categories <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
