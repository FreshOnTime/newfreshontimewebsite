"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

/** A manual carousel: visitors control the content and the shopping actions remain stationary. */
const slides = [
  {
    id: "produce",
    image: "/images/home/market-produce-box.webp",
    alt: "A crate of carrots, aubergines, cabbage, green beans and limes",
    caption: "Fresh vegetables & greens",
    href: "/products?search=vegetables",
  },
  {
    id: "fruit",
    image: "/images/home/fresh-market-hero.webp",
    alt: "Papaya, bananas, limes and leafy greens from the market",
    caption: "Fruit & seasonal favourites",
    href: "/products?search=fruit",
  },
  {
    id: "pantry",
    image: "/images/home/market-pantry.webp",
    alt: "Rice, lentils, coconut and spices for everyday cooking",
    caption: "For the everyday pantry",
    href: "/products?search=pantry",
  },
] as const;

const arrowClass =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/50 bg-brand-green-deep/30 text-white backdrop-blur-sm transition-colors hover:bg-brand-green-deep/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-11 sm:w-11";

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const slide = slides[active];
  const goTo = (direction: -1 | 1) => {
    setActive((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <section aria-label="FreshPick market introduction" className="relative isolate overflow-hidden border-b border-brand-green/10 bg-brand-cream">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_100%,rgba(124,150,116,.13),transparent_48%)]" />
      <div className="editorial-wrap relative grid min-w-0 items-center gap-9 py-8 sm:gap-11 sm:py-10 lg:grid-cols-[minmax(0,.94fr)_minmax(0,1.06fr)] lg:gap-12 lg:py-11 xl:gap-16">
        <div className="min-w-0 py-2 lg:py-6">
          <div className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.16em] text-brand-green sm:mb-7">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand-amber" />
            The FreshPick market · Colombo
          </div>
          <h1 className="max-w-[13ch] font-heading text-[clamp(3.1rem,5.4vw,5.8rem)] font-semibold leading-[1.04] tracking-[-.06em] text-brand-green-deep">
            Good food,<span className="block text-brand-green">every day.</span>
          </h1>
          <p className="mt-5 max-w-[44ch] text-base leading-[1.8] text-foreground/75 sm:mt-7 sm:text-lg">
            Fresh vegetables, fruit, pantry staples and favourites from local makers. All in one easy-to-shop market.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-9 sm:gap-4">
            <Link
              href="/products"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-green-deep px-7 py-3 text-sm font-semibold text-white shadow-[0_15px_35px_-25px_rgba(16,46,30,.65)] transition-[transform,background-color,box-shadow] hover:bg-brand-green hover:shadow-lg motion-safe:hover:-translate-y-0.5"
            >
              Shop the market <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/categories"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-brand-green/35 px-6 py-3 text-sm font-semibold text-brand-green transition-colors hover:border-brand-green hover:bg-brand-green/5"
            >
              Browse categories <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Explore food from FreshPick"
          className="relative isolate h-[325px] min-w-0 overflow-hidden rounded-[1.5rem] bg-brand-green-deep shadow-[0_24px_75px_-42px_rgba(16,46,30,.58)] sm:h-[430px] lg:h-[490px] xl:h-[525px] lg:rounded-[1.75rem]"
        >
          <Image
            key={slide.id}
            src={slide.image}
            alt={slide.alt}
            fill
            priority={active === 0}
            sizes="(max-width: 1023px) calc(100vw - 32px), (max-width: 1439px) 50vw, 720px"
            className="object-cover"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-brand-green-deep/95 via-brand-green-deep/55 to-transparent" />
          <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3 sm:inset-x-7 sm:bottom-7">
            <div className="min-w-0 max-w-[75%] text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/75">Discover the market</p>
              <p className="mt-2 font-heading text-xl font-semibold leading-snug tracking-[-.04em] sm:text-2xl" aria-live="polite" aria-atomic="true">{slide.caption}</p>
              <Link href={slide.href} className="mt-2 inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white">
                Shop this selection <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <div className="mt-4 flex items-center gap-2" aria-label={"Photo " + (active + 1) + " of " + slides.length}>
                {slides.map((item, index) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setActive(index)}
                    aria-label={"Show " + item.caption}
                    aria-pressed={active === index}
                    className={"h-1.5 rounded-full transition-[width,background-color] " + (active === index ? "w-9 bg-white" : "w-5 bg-white/40 hover:bg-white/75")}
                  />
                ))}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" className={arrowClass} onClick={() => goTo(-1)} aria-label="Previous market image">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" className={arrowClass} onClick={() => goTo(1)} aria-label="Next market image">
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
