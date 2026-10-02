import Link from "next/link";
import { ArrowRight, ShoppingBasket } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-5 py-14 md:py-20">
      <section className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-brand-green"><ShoppingBasket strokeWidth={1.5} aria-hidden="true" className="h-7 w-7" /></div>
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">404 · Page not found</p>
        <h1 className="mt-3 text-3xl font-medium leading-tight tracking-tight text-brand-green md:text-4xl">We couldn’t find that page.</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-muted-foreground">The link may have changed. Browse the market or search for your everyday favourites.</p>
        <Link href="/products" className="mt-7 inline-flex min-h-11 items-center justify-center gap-3 rounded-lg bg-brand-amber px-6 py-3 text-sm font-semibold text-accent-foreground hover:bg-brand-amber/85">Shop the market <ArrowRight strokeWidth={1.75} aria-hidden="true" className="h-4 w-4" /></Link>
        <nav aria-label="Find your way" className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-brand-green"><Link href="/categories" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">Browse categories</Link><Link href="/search" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">Search FreshPick</Link></nav>
      </section>
    </div>
  );
}
