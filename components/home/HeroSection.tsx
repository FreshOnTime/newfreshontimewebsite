import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, ShoppingBasket } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 md:grid-cols-2 md:px-8 md:py-16">
        <div className="max-w-xl">
          <p className="mb-5 flex items-center gap-2 text-sm font-medium text-brand-green">
            <MapPin className="h-4 w-4" aria-hidden="true" /> Your local market in Colombo
          </p>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-brand-green sm:text-5xl lg:text-6xl">
            Fresh food.<br />Everyday favourites.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground md:text-lg">
            Fresh produce, pantry staples, ready meals and food from local makers. Find what you need for your next meal, all in one place.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/products" prefetch={false} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-brand-amber px-6 py-3 font-semibold text-accent-foreground transition-colors hover:bg-brand-amber/85">
              <ShoppingBasket className="h-5 w-5" aria-hidden="true" /> Shop groceries
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/recipes" prefetch={false} className="inline-flex min-h-12 items-center rounded-lg border border-brand-green px-6 py-3 font-semibold text-brand-green transition-colors hover:bg-secondary">
              Find a recipe
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-border pt-5 text-sm text-brand-green">
            <Link href="/homemade" className="underline-offset-4 hover:underline">Meet local makers</Link>
            <Link href="/meals" className="underline-offset-4 hover:underline">Browse ready meals</Link>
            <Link href="/subscriptions" className="underline-offset-4 hover:underline">Your weekly basket</Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-secondary">
          <Image src="/bgs/home-hero.jpg" alt="Fresh produce and ingredients for everyday cooking" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority fetchPriority="high" unoptimized />
        </div>
      </div>
    </section>
  );
}
