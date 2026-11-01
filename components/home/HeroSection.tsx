import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * A market-wide photo wall, not a produce-only hero or an autoplaying carousel.
 * Each tile leads to a real FreshPick destination.
 */
const marketSelections = [
  {
    name: "Ready meals",
    image: "/images/categories/cooked-food.webp",
    alt: "A freshly prepared Sri Lankan rice and curry meal",
    href: "/meals",
    size: "col-span-4 row-span-2",
  },
  {
    name: "Bakery",
    image: "/images/categories/bakery.webp",
    alt: "Bread and freshly baked food on a table",
    href: "/products?search=bread",
    size: "col-span-2",
  },
  {
    name: "Pantry staples",
    image: "/images/categories/pantry-staples.webp",
    alt: "Rice, lentils and other everyday pantry ingredients",
    href: "/products?search=pantry",
    size: "col-span-2",
  },
  {
    name: "Fresh produce",
    image: "/images/editorial/market-crates.webp",
    alt: "An assortment of seasonal vegetables",
    href: "/categories",
    size: "col-span-2",
  },
  {
    name: "Dairy & eggs",
    image: "/images/categories/dairy-eggs.webp",
    alt: "Dairy and eggs for everyday cooking",
    href: "/products?search=dairy",
    size: "col-span-2",
  },
  {
    name: "Beverages",
    image: "/images/categories/beverages.webp",
    alt: "Refreshing drinks and beverages",
    href: "/products?search=beverages",
    size: "col-span-2",
  },
] as const;

export default function HeroSection() {
  return (
    <section
      aria-label="Introducing the FreshPick food market"
      className="relative isolate overflow-hidden bg-brand-green-deep text-white"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_5%_15%,rgba(97,181,71,.11),transparent_50%)]" />
      <div className="editorial-wrap relative grid min-w-0 items-center gap-9 py-10 sm:py-12 lg:grid-cols-[minmax(0,.86fr)_minmax(0,1.14fr)] lg:gap-10 lg:py-14 xl:gap-14">
        <div className="min-w-0 pb-1 lg:py-7">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.18em] text-white/75">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand-amber" />
            Your everyday food market · Colombo
          </p>
          <h1 className="mt-6 max-w-[12ch] font-heading text-[clamp(3rem,5vw,5.6rem)] font-semibold leading-[1.05] tracking-[-.055em] text-white">
            A whole market.
            <span className="block text-[#c5d9b8]">For every table.</span>
          </h1>
          <p className="mt-6 max-w-[47ch] text-base leading-[1.8] text-white/85 sm:text-lg">
            Fresh produce, ready meals, bakery, pantry essentials, beverages and food from local makers. All in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/products"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-cream px-7 py-3 text-sm font-semibold text-brand-green-deep transition-colors hover:bg-white"
            >
              Explore the market <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex min-h-12 items-center gap-2 border-b border-white/50 px-1 text-sm font-semibold text-white transition-colors hover:border-white"
            >
              How FreshPick works <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <p className="mt-8 max-w-[38ch] text-xs leading-6 text-white/60">
            Explore what is currently available. Prices and products are confirmed in the live market.
          </p>
        </div>
        <nav
          aria-label="Explore FreshPick by food type"
          className="grid h-[340px] min-w-0 grid-cols-6 grid-rows-3 gap-2 sm:h-[460px] sm:gap-2.5 lg:h-[505px] xl:h-[545px]"
        >
          {marketSelections.map((selection, index) => (
            <Link
              key={selection.name}
              href={selection.href}
              className={`group relative isolate min-w-0 overflow-hidden rounded-xl bg-brand-green shadow-[0_10px_24px_-20px_rgba(0,0,0,.8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${selection.size}`}
              aria-label={`Explore ${selection.name}`}
            >
              <Image
                src={selection.image}
                alt={selection.alt}
                fill
                priority={index === 0}
                sizes={index === 0
                  ? "(max-width: 1023px) 67vw, 40vw"
                  : "(max-width: 1023px) 34vw, 24vw"}
                className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.045]"
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0a2518]/80 via-[#0a2518]/15 to-transparent" />
              <span className={`absolute bottom-2 left-2 right-2 font-semibold leading-tight text-white drop-shadow-sm sm:bottom-3 sm:left-3 sm:right-3 ${index === 0 ? "text-base sm:text-xl" : "text-[10px] sm:text-xs xl:text-sm"}`}>
                {selection.name}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
