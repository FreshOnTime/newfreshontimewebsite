import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag, Store, UserRound } from "lucide-react";

export function SignupForm() {
  return (
    <main className="min-h-screen bg-[#f4f5f1] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#08130d] lg:block">
        <Image
          src="/bgs/home-hero.jpg"
          alt="FreshPick food and produce"
          fill
          priority
          sizes="52vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07110c] via-[#07110c]/35 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07110c]/20 via-transparent to-[#07110c]/45" />

        <div className="absolute inset-x-0 bottom-0 p-10 text-white xl:p-16">
          <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-emerald-200">FreshPick membership</span>
          <h2 className="mt-5 max-w-2xl font-serif text-5xl font-normal leading-[0.94] tracking-[-0.035em] xl:text-7xl">
            One account for the food you <span className="italic text-emerald-200">come back to.</span>
          </h2>
          <p className="mt-6 max-w-xl text-base font-light leading-8 text-white/65">
            Save bags, follow your orders, discover recipes, build recurring routines and keep your FreshPick experience connected.
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-24 sm:px-8 lg:px-12 xl:px-16">
        <div className="w-full max-w-[560px]">
          <Link href="/" className="inline-flex flex-col leading-none">
            <span className="font-serif text-3xl font-bold tracking-[-0.035em] text-emerald-950">
              Fresh<span className="italic text-emerald-500">Pick</span>
            </span>
            <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.32em] text-emerald-950/40">Colombo</span>
          </Link>

          <div className="mt-12">
            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-700">Create an account</span>
            <h1 className="mt-4 font-serif text-5xl font-normal leading-none tracking-[-0.03em] text-zinc-950">Choose how you&apos;ll use FreshPick.</h1>
            <p className="mt-4 max-w-lg text-sm font-light leading-6 text-zinc-500">Customer accounts are instant. Supplier accounts begin a curated partner application.</p>
          </div>

          <div className="mt-9 space-y-4">
            <Link href="/auth/signup/customer" className="group block overflow-hidden rounded-[1.6rem] border border-zinc-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-start justify-between gap-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-900">
                  <UserRound className="h-5 w-5" />
                </span>
                <ArrowUpRight className="h-5 w-5 text-zinc-300 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-700" />
              </div>
              <h2 className="mt-7 font-serif text-3xl font-normal text-zinc-950">I&apos;m here to shop.</h2>
              <p className="mt-3 text-sm font-light leading-6 text-zinc-500">Build bags, order groceries, save favourites and get personal picks from your real FreshPick activity.</p>
              <div className="mt-6 flex items-center gap-2 border-t border-zinc-100 pt-4 text-xs font-medium text-emerald-800">
                <ShoppingBag className="h-4 w-4" /> Customer account
              </div>
            </Link>

            <Link href="/auth/signup/supplier" className="group block overflow-hidden rounded-[1.6rem] border border-zinc-200 bg-[#0b1710] p-6 text-white transition-all hover:-translate-y-0.5 hover:border-emerald-700/50 hover:shadow-[0_20px_60px_rgba(6,24,15,0.14)]">
              <div className="flex items-start justify-between gap-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/8 text-emerald-200 ring-1 ring-white/10">
                  <Store className="h-5 w-5" />
                </span>
                <ArrowUpRight className="h-5 w-5 text-white/25 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-200" />
              </div>
              <h2 className="mt-7 font-serif text-3xl font-normal text-white">I want to supply FreshPick.</h2>
              <p className="mt-3 text-sm font-light leading-6 text-white/52">Apply to join the curated partner network. Supplier onboarding is reviewed rather than opened as a public marketplace.</p>
              <div className="mt-6 border-t border-white/10 pt-4 text-xs font-medium text-emerald-200">Partner application</div>
            </Link>
          </div>

          <p className="mt-8 text-sm text-zinc-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-emerald-800 hover:text-emerald-950">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
