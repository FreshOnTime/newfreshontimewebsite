import Link from "next/link";
import { ArrowUpRight, ShoppingBag, Store, UserRound } from "lucide-react";

export function SignupForm() {
  return (
    <main className="bg-background">

      <section className="flex items-start justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="w-full max-w-[560px]">

          <div className="mt-0">
            <span className="text-xs font-bold normal-case text-emerald-700">Create an account</span>
            <h1 className="mt-4 font-sans text-4xl font-semibold leading-tight text-zinc-950">Create an account</h1>
            <p className="mt-4 max-w-lg text-sm font-normal leading-6 text-zinc-500">Customer accounts are instant. Supplier accounts begin a curated partner application.</p>
          </div>

          <div className="mt-9 space-y-4">
            <Link href="/auth/signup/customer" className="group block overflow-hidden rounded-xl border border-zinc-200 bg-background p-6 transition-all hover:border-emerald-300">
              <div className="flex items-start justify-between gap-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-900">
                  <UserRound className="h-5 w-5" />
                </span>
                <ArrowUpRight className="h-5 w-5 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-700" />
              </div>
              <h2 className="mt-7 font-sans text-xl font-semibold text-zinc-950">Customer account</h2>
              <p className="mt-3 text-sm font-normal leading-6 text-zinc-500">Build bags, order groceries, save favourites and get personal picks from your real FreshPick activity.</p>
              <div className="mt-6 flex items-center gap-2 border-t border-zinc-100 pt-4 text-xs font-medium text-emerald-800">
                <ShoppingBag className="h-4 w-4" /> Customer account
              </div>
            </Link>

            <Link href="/auth/signup/supplier" className="group block overflow-hidden rounded-xl border border-zinc-200 bg-background p-6 text-accent-foreground transition-all hover:border-emerald-700/50">
              <div className="flex items-start justify-between gap-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-brand-green ring-1 ring-white/10">
                  <Store className="h-5 w-5" />
                </span>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-green" />
              </div>
              <h2 className="mt-7 font-sans text-3xl font-semibold text-foreground">Supplier account</h2>
              <p className="mt-3 text-sm font-normal leading-6 text-muted-foreground">Apply to join the curated partner network. Supplier onboarding is reviewed rather than opened as a public marketplace.</p>
              <div className="mt-6 border-t border-border pt-4 text-xs font-medium text-brand-green">Partner application</div>
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
