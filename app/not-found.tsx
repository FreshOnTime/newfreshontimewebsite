import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-background px-5 py-10 text-zinc-950">
      <section className="w-full max-w-3xl overflow-hidden rounded-xl border border-zinc-200 bg-background">
        <div className="bg-background p-8 text-foreground md:p-12">
          <span className="text-xs font-bold normal-case text-brand-green">404 · FreshPick</span>
          <h1 className="mt-4 max-w-2xl font-sans text-4xl font-semibold leading-tight md:text-4xl">That page isn&apos;t on the menu.</h1>
          <p className="mt-5 max-w-xl text-sm font-normal leading-7 text-muted-foreground">The link may be old, the item may have moved, or the route may no longer be part of the FreshPick experience.</p>
        </div>
        <div className="grid gap-3 p-6 sm:grid-cols-3 md:p-8">
          <Link href="/discover" className="group rounded-[1.25rem] border border-zinc-200 p-5 transition-colors hover:border-emerald-300">
            <p className="text-xs font-bold normal-case text-emerald-700">Discover</p>
            <p className="mt-2 text-sm font-medium text-zinc-900">Start from what to eat</p>
            <ArrowRight className="mt-5 h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-700" />
          </Link>
          <Link href="/products" className="group rounded-[1.25rem] border border-zinc-200 p-5 transition-colors hover:border-emerald-300">
            <p className="text-xs font-bold normal-case text-emerald-700">Market</p>
            <p className="mt-2 text-sm font-medium text-zinc-900">Browse the live catalogue</p>
            <ArrowRight className="mt-5 h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-700" />
          </Link>
          <Link href="/search" className="group rounded-[1.25rem] border border-zinc-200 p-5 transition-colors hover:border-emerald-300">
            <p className="inline-flex items-center gap-1 text-xs font-bold normal-case text-emerald-700"><Search className="h-3 w-3" /> Search</p>
            <p className="mt-2 text-sm font-medium text-zinc-900">Find food another way</p>
            <ArrowRight className="mt-5 h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-700" />
          </Link>
        </div>
      </section>
    </main>
  );
}
