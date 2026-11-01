import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CirclePlay } from "lucide-react";

/**
 * One still photograph and two clear actions.
 * Keep this server-rendered hero free of carousel state and layout-shifting controls.
 * The licensed photo is from Unsplash; see docs/HOMEPAGE_HERO.md.
 */
const MARKET_HERO_PHOTO =
  "https://images.unsplash.com/photo-1595275522477-c3ce3ca9714b?auto=format&fit=crop&w=1440&q=85";

export default function HeroSection() {
  return (
    <section
      aria-label="FreshPick food market introduction"
      className="relative overflow-hidden border-b border-brand-green/10 bg-brand-cream"
    >
      <div className="editorial-wrap grid min-w-0 items-center gap-9 py-10 sm:gap-12 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-14 lg:py-16">
        <div className="min-w-0">
          <p className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.17em] text-brand-green">
            <span className="h-[2px] w-7 bg-brand-green" aria-hidden="true" />
            Sri Lanka&apos;s online food market
          </p>
          <h1 className="max-w-[13ch] font-heading text-[clamp(2.9rem,5.6vw,5.75rem)] font-semibold leading-[1.035] tracking-[-.055em] text-brand-green-deep">
            A whole market.
            <span className="block italic font-medium text-brand-green">For every table.</span>
          </h1>
          <p className="mt-6 max-w-[48ch] text-base leading-[1.75] text-foreground/75 sm:mt-7 sm:text-lg">
            Fresh produce, dairy, bakery, pantry essentials, ready meals and food from local makers. Everything you need, in one easy-to-shop market.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/products"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-green-deep px-7 py-3 text-sm font-semibold text-white transition-[background-color,transform] hover:bg-brand-green motion-safe:hover:-translate-y-0.5"
            >
              Shop the market <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-brand-green/35 px-6 py-3 text-sm font-semibold text-brand-green-deep transition-colors hover:border-brand-green hover:bg-brand-green/5"
            >
              <CirclePlay className="h-4 w-4" aria-hidden="true" />
              How it works
            </Link>
          </div>
        </div>

        <div className="relative min-w-0">
          <div className="relative aspect-[5/4] overflow-hidden rounded-[1.5rem] bg-secondary shadow-[0_22px_70px_-45px_rgba(16,46,30,.33)] sm:aspect-[4/3] lg:aspect-[6/5]">
            <Image
              src={MARKET_HERO_PHOTO}
              alt="A selection of groceries including fresh bread, milk, eggs, fruit and other everyday food"
              fill
              priority
              sizes="(max-width: 1023px) calc(100vw - 32px), (max-width: 1439px) 50vw, 700px"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
