import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f5f1] px-5 py-24 text-zinc-950">
      <section className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.05)]">
        <div className="bg-[#0b1710] p-8 text-white md:p-12">
          <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-emerald-200">404 · FreshPick</span>
          <h1 className="mt-4 max-w-2xl font-serif text-5xl font-normal leading-none tracking-[-0.035em] md:text-6xl">That page isn&apos;t on the menu.</h1>
          <p className="mt-5 max-w-xl text-sm font-light leading-7 text-white/55">The link may be old, the item may have moved, or the route may no longer be part of the FreshPick experience.</p>
        </div>
        <div className="grid gap-3 p-6 sm:grid-cols-3 md:p-8">
          <Link href="/discover" className="group rounded-[1.25rem] border border-zinc-200 p-5 transition-colors hover:border-emerald-300">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">Discover</p>
            <p className="mt-2 text-sm font-medium text-zinc-900">Start from what to eat</p>
            <ArrowRight className="mt-5 h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-700" />
          </Link>
          <Link href="/products" className="group rounded-[1.25rem] border border-zinc-200 p-5 transition-colors hover:border-emerald-300">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">Market</p>
            <p className="mt-2 text-sm font-medium text-zinc-900">Browse the live catalogue</p>
            <ArrowRight className="mt-5 h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-700" />
          </Link>
          <Link href="/search" className="group rounded-[1.25rem] border border-zinc-200 p-5 transition-colors hover:border-emerald-300">
            <p className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700"><Search className="h-3 w-3" /> Search</p>
            <p className="mt-2 text-sm font-medium text-zinc-900">Find food another way</p>
            <ArrowRight className="mt-5 h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-700" />
          </Link>
        </div>
      </section>
    </main>
  );
}
