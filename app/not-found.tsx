import Link from "next/link";
import { ArrowRight, Compass, Home, ShoppingBasket } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[65vh] items-center justify-center bg-background px-5 py-14 md:py-20">
      <section aria-labelledby="not-found-title" className="w-full max-w-xl rounded-3xl border border-border bg-card p-7 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-brand-green">
          <ShoppingBasket strokeWidth={1.5} aria-hidden="true" className="h-7 w-7" />
        </div>
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">404 · Page not found</p>
        <h1 id="not-found-title" className="mt-3 text-3xl font-normal leading-tight tracking-tight text-brand-green md:text-4xl">A little off the food trail.</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-muted-foreground">This page may have moved or is no longer available. There is still plenty to discover across Sri Lanka.</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/discover" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-leaf px-5 py-3 text-sm font-semibold text-brand-ink hover:bg-brand-leaf/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
            <Compass size={18} aria-hidden="true" /> Discover food <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-semibold text-brand-green hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
            <Home size={18} aria-hidden="true" /> Back home
          </Link>
        </div>
        <nav aria-label="Find your way" className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-brand-green">
          {([['/food-atlas','Food atlas'],['/eat-drink','Eat & drink'],['/makers','Food businesses'],['/stories','Food stories']] as const).map(([href,label]) => (
            <Link key={href} href={href} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline focus-visible:underline">{label}</Link>
          ))}
        </nav>
      </section>
    </div>
  );
}
