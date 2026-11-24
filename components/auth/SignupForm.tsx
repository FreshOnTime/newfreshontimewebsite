import { accountLink } from '@/lib/authNavigation';
import Link from "next/link";
import { ArrowUpRight, ShoppingBag, Store, UserRound } from "lucide-react";

export function SignupForm({ requestedDestination }: { requestedDestination?: string }) {
  return (
    <div className="bg-background">

      <section className="flex items-start justify-center px-0 py-4 sm:px-4 lg:px-2 xl:py-8">
        <div className="w-full max-w-[560px]">

          <div className="mt-0">
            <span className="text-xs font-bold normal-case text-brand-green">Create an account</span>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight text-foreground">Create an account</h1>
            <p className="mt-4 max-w-lg text-sm font-normal leading-6 text-muted-foreground">Explore local food or open your own maker page.</p>
          </div>

          <div className="mt-9 space-y-4">
            <Link href={accountLink('/auth/signup/customer', requestedDestination)} className="group block overflow-hidden rounded-xl border border-border bg-background p-6 transition-all hover:border-border">
              <div className="flex items-start justify-between gap-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-brand-green">
                  <UserRound className="h-5 w-5" />
                </span>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-green" />
              </div>
              <h2 className="mt-7 font-serif text-xl font-normal text-foreground">Member account</h2>
              <p className="mt-3 text-sm font-normal leading-6 text-muted-foreground">Create a login to manage your FreshPick account.</p>
              <div className="mt-6 flex items-center gap-2 border-t border-border pt-4 text-xs font-medium text-brand-green">
                <ShoppingBag className="h-4 w-4" /> Member account
              </div>
            </Link>

            <Link href={accountLink('/join', requestedDestination)} className="group block overflow-hidden rounded-xl border border-border bg-background p-6 text-foreground transition-all hover:border-primary/50">
              <div className="flex items-start justify-between gap-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-brand-green ring-1 ring-white/10">
                  <Store className="h-5 w-5" />
                </span>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-green" />
              </div>
              <h2 className="mt-7 font-serif text-xl font-normal text-foreground">Maker page</h2>
              <p className="mt-3 text-sm font-normal leading-6 text-muted-foreground">Publish items, open batches and tell the stories behind your food.</p>
              <div className="mt-6 border-t border-border pt-4 text-xs font-medium text-brand-green">Open a maker page</div>
            </Link>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href={accountLink('/auth/login', requestedDestination)} className="font-semibold text-brand-green hover:text-brand-green">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
