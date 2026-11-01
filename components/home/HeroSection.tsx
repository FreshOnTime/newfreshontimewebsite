import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Wordmark from "@/components/brand/Wordmark";

/**
 * Full-bleed, static FreshPick campaign masthead.
 * Overlay copy and brand artwork remain real DOM/SVG, never baked into the photo.
 * Photo attribution: docs/HOMEPAGE_HERO.md.
 */
const MARKET_HERO_PHOTO =
  "https://images.unsplash.com/photo-1595275522477-c3ce3ca9714b?auto=format&fit=crop&w=1920&q=86";

export default function HeroSection() {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative isolate overflow-hidden bg-brand-green-deep text-white"
    >
      <div className="absolute inset-0">
        <Image
          src={MARKET_HERO_PHOTO}
          alt="Fresh bread, milk, eggs, fruit and other everyday foods arranged on a market table"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[63%_center] sm:object-center"
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#092318]/95 via-[#102e1e]/80 to-[#102e1e]/25 lg:from-[#092318]/95 lg:via-[#102e1e]/75 lg:to-[#102e1e]/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#061c11]/75 via-transparent to-transparent"
      />

      <div className="editorial-wrap relative z-10 flex min-h-[590px] flex-col justify-center py-20 sm:min-h-[620px] lg:min-h-[660px] lg:py-24 xl:min-h-[700px]">
        <div className="max-w-[750px]">
          <p className="mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/85 sm:mb-7 sm:text-xs">
            <span aria-hidden="true" className="h-[2px] w-8 bg-brand-amber" />
            FreshPick · Sri Lanka&apos;s online food market
          </p>
          <h1
            id="home-hero-heading"
            className="max-w-[13ch] font-heading text-[clamp(3rem,6.8vw,6.75rem)] font-semibold leading-[1.02] tracking-[-.06em] text-white"
          >
            A whole market.
            <span
              className="mt-2 block font-normal italic tracking-[-.06em] text-[#e0ecd6]"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              For every table.
            </span>
          </h1>
          <p className="mt-6 max-w-[49ch] text-base leading-[1.8] text-white/90 sm:mt-8 sm:text-lg">
            Fresh produce, bakery, dairy, pantry essentials, ready meals and food from local makers.
            All in one easy-to-shop market.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4">
            <Link
              href="/products"
              className="inline-flex min-h-12 items-center justify-center gap-3 bg-brand-cream px-7 py-3 text-xs font-bold uppercase tracking-[.1em] text-brand-green-deep transition-colors hover:bg-white"
            >
              Shop the market <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex min-h-12 items-center justify-center gap-3 border border-white/75 px-7 py-3 text-xs font-bold uppercase tracking-[.1em] text-white transition-colors hover:bg-white hover:text-brand-green-deep"
            >
              How it works <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        <div className="editorial-wrap flex items-end justify-between gap-5 pb-6 sm:pb-8">
          <Link
            href="/categories"
            className="pointer-events-auto inline-flex min-h-11 items-center gap-2 border-b border-white/65 text-[11px] font-semibold uppercase tracking-[.15em] text-white hover:border-white"
          >
            Explore categories <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <div
            aria-label="FreshPick branded food market"
            className="hidden shrink-0 items-center gap-3 bg-brand-cream/95 px-5 py-3 text-brand-green-deep shadow-lg sm:flex"
          >
            <Wordmark className="text-[28px]" />
            <span className="border-l border-brand-green/20 pl-3 text-[10px] font-semibold uppercase leading-4 tracking-[.13em]">
              Food for<br />every table
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
