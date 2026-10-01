"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useBag } from "@/contexts/BagContext";

export default function BagView() {
  const params = useParams<{ id: string }>();
  const { bags, loading, error, selectBag, getTotalPrice } = useBag();

  const bag = useMemo(() => bags.find(b => b.id === params.id) || null, [bags, params.id]);

  useEffect(() => {
    if (params.id) selectBag(params.id);
  }, [params.id, selectBag]);

  if (loading && !bag) {
    return <div role="status" className="mx-auto max-w-7xl px-5 py-12 text-sm text-muted-foreground">Loading your bag…</div>;
  }

  if (!bag) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-medium text-brand-green">We couldn’t find this bag.</h1>
        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
        <Link href="/bags" className="mt-5 inline-flex min-h-11 items-center text-sm text-brand-green hover:underline">View your bags</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 md:px-8 md:py-10">
      <Link href="/bags" className="inline-flex min-h-11 items-center text-sm text-brand-green hover:underline">Back to your bags</Link>
      <div className="flex items-center justify-between">
        <h1 className="min-w-0 break-words text-3xl font-medium tracking-tight text-brand-green">{bag.name}</h1>
        <div className="text-right">
          <p className="text-gray-600">Total</p>
          <p className="text-xl font-bold">Rs. {getTotalPrice(bag.id).toFixed(2)}</p>
        </div>
      </div>

      <div className="divide-y divide-border border-y border-border">
        {bag.items.length === 0 && <p className="py-8 text-sm text-muted-foreground">Your bag is empty. Browse the market to add something.</p>}
        {bag.items.map((item, idx) => {
          const firstImg = (item.product.images?.[0] as { url?: string } | string) ?? undefined;
          const imgUrl = typeof firstImg === 'string' ? firstImg : firstImg?.url;
          return (
            <div key={`${bag.id}-${item.product.id}-${idx}`} className="flex flex-wrap items-center gap-4 py-5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-background [&_img]:mix-blend-multiply">
                {imgUrl ? (
                  <Image src={imgUrl} alt={item.product.name} fill sizes="64px" className="object-contain" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-gray-600">Rs. {item.product.price.toFixed(2)} x {item.quantity}</p>
              </div>
              <div className="text-right font-semibold">
                Rs. {(item.product.price * item.quantity).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t flex justify-end">
        {bag.items.length > 0 ? <Link href={{ pathname: "/checkout", query: { bagId: bag.id } }} className="inline-flex min-h-12 items-center rounded-lg bg-brand-amber px-5 text-sm font-semibold text-accent-foreground hover:bg-brand-amber/85">Proceed to checkout</Link> : <Link href="/products" className="inline-flex min-h-12 items-center rounded-lg bg-brand-amber px-5 text-sm font-semibold text-accent-foreground hover:bg-brand-amber/85">Shop the market</Link>}
      </div>
    </div>
  );
}
