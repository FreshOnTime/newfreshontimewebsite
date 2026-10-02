"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import { useBag } from "@/contexts/BagContext";
import { useAuth } from "@/contexts/AuthContext";
import BagItemRow from "@/components/cart/BagItemRow";

export default function BagView() {
  const params = useParams<{ id: string }>();
  const { bags, loading, updating, error, selectBag, getTotalPrice, fetchBags } = useBag();
  const { user, loading: authLoading } = useAuth();
  const bag = bags.find((candidate) => candidate.id === params.id);
  const ready = Boolean(bag?.items.length && bag.items.every((item) => item.quantity <= item.product.stock) && !loading && !updating);

  useEffect(() => { if (bag) selectBag(bag.id); }, [bag, selectBag]);

  if (authLoading || (loading && !bag)) return <div role="status" className="mx-auto max-w-7xl px-5 py-14 text-sm text-muted-foreground">Loading your bag…</div>;
  if (!user) return <section className="mx-auto max-w-lg px-5 py-16 text-center"><h1 className="text-3xl font-normal text-brand-green">Sign in to view your bag.</h1><p className="mt-4 text-sm leading-7 text-muted-foreground">Your saved groceries will be waiting for you.</p><Link href={'/auth/login?redirect=' + encodeURIComponent('/bags/' + params.id)} className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-accent-foreground hover:bg-primary/85">Sign in</Link></section>;
  if (!bag) return <section className="mx-auto max-w-lg px-5 py-16 text-center"><ShoppingBag strokeWidth={1.5} aria-hidden="true" className="mx-auto h-9 w-9 text-brand-green" /><h1 className="mt-6 text-3xl font-normal text-brand-green">{error ? 'We couldn’t load this bag.' : 'We couldn’t find this bag.'}</h1><p className="mt-4 text-sm leading-7 text-muted-foreground">{error ? 'Please try again in a moment.' : 'It may have been deleted. You can continue with another shopping bag.'}</p>{error && <button type="button" disabled={loading} onClick={() => fetchBags()} className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-accent-foreground">Try again</button>}<Link href="/bags" className="mt-5 flex min-h-11 items-center justify-center text-sm text-brand-green hover:underline">View your bags</Link></section>;

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 md:px-8 md:pb-16">
      <Link href="/bags" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-brand-green"><ArrowLeft strokeWidth={1.75} aria-hidden="true" className="h-4 w-4" />Your bags</Link>
      <header className="mt-5 border-b border-border pb-8"><h1 className="break-words text-3xl font-normal tracking-tight text-brand-green md:text-4xl">{bag.name}</h1>{bag.description && <p className="mt-3 max-w-xl break-words text-sm leading-7 text-muted-foreground">{bag.description}</p>}<p className="mt-3 text-xs text-muted-foreground">{bag.items.length} {bag.items.length === 1 ? 'product' : 'products'}</p></header>
      {error && <p role="alert" className="mt-6 rounded-lg border border-destructive/20 px-4 py-3 text-sm text-destructive">We couldn’t update your bag. Please try again.</p>}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
        <section aria-label="Bag items" aria-busy={loading || updating} className="min-w-0">
          {bag.items.length > 0 ? <div className="divide-y divide-border">{bag.items.map((item) => <BagItemRow key={item.product.id} bagId={bag.id} item={item} />)}</div> : <div className="py-12 text-center"><ShoppingBag strokeWidth={1.5} aria-hidden="true" className="mx-auto h-8 w-8 text-brand-green" /><h2 className="mt-5 text-2xl font-normal text-brand-green">A fresh start.</h2><p className="mt-3 text-sm text-muted-foreground">Fill your bag with favourites from the market.</p><Link href="/products" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-green hover:underline">Shop the market <ArrowRight strokeWidth={1.75} aria-hidden="true" className="h-4 w-4" /></Link></div>}
        </section>
        <aside className="rounded-lg border border-border bg-secondary/40 p-6 lg:sticky lg:top-40">
          <h2 className="text-lg font-normal text-brand-green">Bag summary</h2><div className="mt-5 flex items-baseline justify-between gap-4 border-t border-border pt-5"><span className="text-sm text-muted-foreground">Items total</span><strong className="text-xl tabular-nums">Rs. {getTotalPrice(bag.id).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
          <p className="mt-3 text-xs leading-6 text-muted-foreground">Review your delivery details at checkout.</p>
          {bag.items.some((item) => item.quantity > item.product.stock) && <p className="mt-4 text-xs leading-6 text-destructive">Remove unavailable items or reduce quantities before checking out.</p>}
          {ready ? <Link href={{ pathname: '/checkout', query: { bagId: bag.id } }} className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-accent-foreground hover:bg-primary/85">Proceed to checkout <ArrowRight strokeWidth={1.75} aria-hidden="true" className="h-4 w-4" /></Link> : <button disabled className="mt-5 min-h-11 w-full rounded-lg bg-background px-4 text-sm text-muted-foreground">Proceed to checkout</button>}
          <Link href="/products" className="mt-3 flex min-h-11 items-center justify-center text-sm text-brand-green hover:underline">Continue shopping</Link>
          <p role="status" aria-live="polite" className="mt-3 text-center text-xs text-muted-foreground">{loading || updating ? 'Updating your bag…' : ''}</p>
        </aside>
      </div>
    </div>
  );
}
