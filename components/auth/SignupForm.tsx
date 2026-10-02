import Link from "next/link";
import { ArrowUpRight, ShoppingBag, Store, UserRound } from "lucide-react";

export function SignupForm() {
  return (
    <div className="bg-background">

      <section className="flex items-start justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="w-full max-w-[560px]">

          <div className="mt-0">
            <span className="text-xs font-bold normal-case text-brand-green">Create an account</span>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight text-foreground">Create an account</h1>
            <p className="mt-4 max-w-lg text-sm font-normal leading-6 text-muted-foreground">Customer accounts are instant. Supplier accounts begin a curated partner application.</p>
          </div>

          <div className="mt-9 space-y-4">
            <Link href="/auth/signup/customer" className="group block overflow-hidden rounded-lg border border-border bg-background p-6 transition-all hover:border-border">
              <div className="flex items-start justify-between gap-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-brand-green">
                  <UserRound className="h-5 w-5" />
                </span>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-green" />
              </div>
              <h2 className="mt-7 font-serif text-xl font-normal text-foreground">Customer account</h2>
              <p className="mt-3 text-sm font-normal leading-6 text-muted-foreground">Build bags, order groceries, save favourites and get personal picks from your real FreshPick activity.</p>
              <div className="mt-6 flex items-center gap-2 border-t border-border pt-4 text-xs font-medium text-brand-green">
                <ShoppingBag className="h-4 w-4" /> Customer account
              </div>
            </Link>

            <Link href="/auth/signup/supplier" className="group block overflow-hidden rounded-lg border border-border bg-background p-6 text-foreground transition-all hover:border-primary/50">
              <div className="flex items-start justify-between gap-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-brand-green ring-1 ring-white/10">
                  <Store className="h-5 w-5" />
                </span>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-green" />
              </div>
              <h2 className="mt-7 font-serif text-3xl font-normal text-foreground">Supplier account</h2>
              <p className="mt-3 text-sm font-normal leading-6 text-muted-foreground">Apply to join the curated partner network. Supplier onboarding is reviewed rather than opened as a public marketplace.</p>
              <div className="mt-6 border-t border-border pt-4 text-xs font-medium text-brand-green">Partner application</div>
            </Link>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-brand-green hover:text-brand-green">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
