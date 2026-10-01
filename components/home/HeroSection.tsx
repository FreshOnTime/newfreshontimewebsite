import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">Your everyday market.</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">Groceries, ready meals and local favourites in Colombo.</p>
          </div>
          <Link href="/homemade" className="inline-flex items-center gap-2 py-2 text-sm font-medium text-brand-green hover:underline">Explore local makers <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <form action="/search" role="search" className="mt-6 flex min-h-14 max-w-3xl items-center gap-3 rounded-xl border border-border bg-card px-4 focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/10">
          <Search className="h-5 w-5 shrink-0 text-brand-green" aria-hidden="true" />
          <label htmlFor="home-search" className="sr-only">Search the market</label>
          <input id="home-search" name="q" type="search" placeholder="Search for groceries, meals or recipes" className="min-w-0 flex-1 border-none bg-transparent py-4 text-sm text-foreground outline-none focus:ring-0 md:text-base" />
          <button type="submit" className="rounded-lg bg-brand-amber px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-brand-amber/85">Search</button>
        </form>
      </div>
    </section>
  );
}
