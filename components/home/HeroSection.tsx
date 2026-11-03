import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * A static, subscription-first FreshPick campaign masthead.
 *
 * The locally hosted, original produce-box illustration is deliberately
 * separate from the heading and links, keeping everything accessible,
 * responsive, and editable. See docs/HOMEPAGE_HERO.md for asset provenance.
 */
const SUBSCRIPTION_BOX_PHOTO = "/images/home/market-produce-box.webp";

export default function HeroSection() {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative isolate overflow-hidden bg-brand-green-deep text-white"
    >
      <Image
        src={SUBSCRIPTION_BOX_PHOTO}
        alt="An illustrated kraft produce box filled with fresh vegetables and greens"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[59%_center] sm:object-center"
      />

      {/* Keep large live text readable without hiding the produce box. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#081b11]/50 sm:bg-[#081b11]/40"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#081b11]/75 via-transparent to-[#081b11]/15"
      />

      <div className="editorial-wrap relative z-10 flex min-h-[580px] flex-col items-center justify-center py-20 text-center sm:min-h-[650px] lg:min-h-[730px] lg:py-28">
        <div className="mx-auto w-full max-w-[1050px]">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-white/95 sm:text-xs">
            FreshPick · Recurring grocery boxes
          </p>
          <h1
            id="home-hero-heading"
            className="mx-auto mt-5 max-w-[17ch] font-heading text-[clamp(3.2rem,8vw,7.5rem)] font-bold uppercase leading-[.95] tracking-[-.065em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.3)]"
          >
            The FreshPick Box.
          </h1>
          <p className="mx-auto mt-6 max-w-[43ch] text-base leading-7 text-white/95 sm:mt-8 sm:text-lg sm:leading-8">
            Fresh food for your routine. Explore our available grocery boxes
            and choose a delivery schedule that works for you.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:mt-10 sm:flex-row sm:gap-6">
            <Link
              href="/subscriptions"
              className="inline-flex min-h-12 w-full items-center justify-center gap-3 border border-brand-cream bg-brand-cream px-7 py-3 text-xs font-bold uppercase tracking-[.11em] text-brand-green-deep transition-colors hover:border-white hover:bg-white sm:w-auto"
            >
              Explore subscription boxes
              <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
            <Link
              href="/products"
              className="inline-flex min-h-12 items-center justify-center gap-2 border-b border-white/75 px-2 text-xs font-bold uppercase tracking-[.11em] text-white transition-colors hover:border-white"
            >
              Shop the market
              <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
