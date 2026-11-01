"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

/**
 * A deliberately manual carousel. Keeping the heading and calls to action
 * stable avoids moving targets, unexpected motion and layout shifts.
 */
const slides = [
  {
    id: "produce",
    image: "/images/home/market-produce-box.webp",
    alt: "Market basket with carrots, aubergines, cabbage, green beans and limes",
    caption: "Fresh vegetables & greens",
    position: "center center",
  },
  {
    id: "fruit",
    image: "/images/home/fresh-market-hero.webp",
    alt: "A colourful selection of papaya, bananas, limes and leafy greens",
    caption: "Fruit & market favourites",
    position: "center center",
  },
  {
    id: "pantry",
    image: "/images/home/market-pantry.webp",
    alt: "Rice, lentils, coconut and spices for everyday cooking",
    caption: "Pantry essentials",
    position: "center center",
  },
] as const;

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const slide = slides[active];
  const goTo = (direction: -1 | 1) => setActive((index) => (index + direction + slides.length) % slides.length);

  const arrowClass = "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/45 bg-brand-green-deep/35 text-white backdrop-blur-md transition-colors hover:border-white/80 hover:bg-brand-green-deep/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <section className="relative isolate overflow-hidden border-b border-brand-green/10 bg-brand-cream" aria-label="FreshPick market introduction">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(121,147,108,.10),transparent_50%)]" />

      <div className="editorial-wrap relative grid min-w-0 items-stretch gap-9 py-9 sm:gap-11 sm:py-12 lg:min-h-[600px] lg:grid-cols-[minmax(0,.94fr)_minmax(0,1.06fr)] lg:gap-14 lg:py-14">
        <div className="flex min-w-0 flex-col justify-center py-2 sm:py-5 lg:py-10">
          <h1 className="max-w-[12ch] font-heading text-[clamp(3.15rem,5.4vw,6.1rem)] font-semibold leading-[1.035] tracking-[-.06em] text-brand-green-deep [text-wrap:balance]">
            Good food,
            <span className="block text-brand-green">every day.</span>
          </h1>

          <p className="mt-7 max-w-[43ch] text-base leading-[1.8] text-foreground/75 sm:mt-8 sm:text-lg sm:leading-[1.8]">
            Fresh vegetables, fruit, pantry staples and food from local makers. All the everyday good things, in one easy-to-shop market.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 sm:mt-9">
            <Link href="/products" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-green-deep px-7 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_-18px_rgba(16,46,30,.55)] transition-[transform,background-color,box-shadow] duration-200 hover:bg-brand-green hover:shadow-[0_18px_36px_-18px_rgba(16,46,30,.5)] motion-safe:hover:-translate-y-0.5">
              Shop the market <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/categories" className="inline-flex min-h-12 items-center gap-2 border-b border-brand-green/35 text-sm font-semibold text-brand-green transition-colors hover:border-brand-green">
              Browse categories <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="FreshPick market photography"
          className="relative isolate min-h-[350px] overflow-hidden rounded-[1.5rem] border border-brand-green/10 bg-brand-green-deep shadow-[0_22px_70px_-40px_rgba(16,46,30,.5)] sm:min-h-[465px] lg:min-h-[500px] lg:rounded-[2rem]"
        >
          {slides.map((item, index) => (
            <div
              key={item.id}
              className={"absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none " + (active === index ? "opacity-100" : "pointer-events-none opacity-0")}
              aria-hidden={index !== active}
            >
              <Image
                src={item.image}
                alt={active === index ? item.alt : ""}
                fill
                priority={index === 0}
                sizes="(max-width: 1023px) calc(100vw - 32px), (max-width: 1439px) 50vw, 700px"
                className="object-cover"
                style={{ objectPosition: item.position }}
              />
            </div>
          ))}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-brand-green-deep/90 via-brand-green-deep/45 to-transparent" />

          <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3 text-white sm:inset-x-7 sm:bottom-7 lg:inset-x-8 lg:bottom-8">
            <div className="min-w-0 max-w-[60%]">
              <p className="font-heading text-lg font-semibold leading-snug tracking-[-.035em] sm:text-xl lg:text-2xl" aria-live="polite" aria-atomic="true">{slide.caption}</p>
              <p className="mt-2 text-xs font-medium tabular-nums text-white/80" aria-label={"Image " + (active + 1) + " of " + slides.length}>
                {String(active + 1).padStart(2, "0")} <span aria-hidden="true" className="px-1 text-white/55">/</span> {String(slides.length).padStart(2, "0")}
              </p>
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
