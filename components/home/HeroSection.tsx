import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * The homepage hero is intentionally a single editorial photograph, not a carousel.
 * Nothing changes unexpectedly, and the two actions remain visible on every breakpoint.
 */
export default function HeroSection() {
  return (
    <section
      aria-label="Introducing the FreshPick market"
      className="relative isolate overflow-hidden bg-brand-green-deep text-white"
    >
      <Image
        src="/images/home/fresh-market-hero.webp"
        alt=""
        fill
        priority
        quality={85}
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0b271b]/95 via-[#102e1e]/75 to-[#102e1e]/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#081a11]/65 via-transparent to-transparent"
      />

      <div className="editorial-wrap relative flex min-h-[550px] items-end py-12 sm:min-h-[575px] sm:py-16 lg:min-h-[605px] lg:items-center lg:py-20">
        <div className="max-w-[690px]">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand-amber" />
            The FreshPick market · Colombo
          </p>

          <h1
            className="mt-6 max-w-[12ch] text-[clamp(3.6rem,7.6vw,7rem)] font-normal leading-[.98] tracking-[-.055em] text-white"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Bring the market
            <span className="block italic text-[#e3eadb]">home.</span>
          </h1>

          <p className="mt-6 max-w-[46ch] text-base leading-[1.75] text-white/90 sm:mt-8 sm:text-lg">
            Fresh vegetables, fruit, pantry essentials and food from local makers.
            All together for the way Colombo shops and cooks.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-9 sm:gap-5">
            <Link
              href="/products"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-cream px-7 py-3 text-sm font-semibold text-brand-green-deep transition-[background-color,transform] hover:bg-white motion-safe:hover:-translate-y-0.5"
            >
              Explore the market <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex min-h-12 items-center gap-2 border-b border-white/65 px-1 text-sm font-semibold text-white transition-colors hover:border-white hover:text-white"
            >
              How FreshPick works <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
