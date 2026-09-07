"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Check, Loader2, RefreshCw, ShoppingBag, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";

type ProductUi = {
  _id: string;
  sku: string;
  name: string;
  image: { url: string };
  discountPercentage: number;
  baseMeasurementQuantity: number;
  pricePerBaseQuantity: number;
  measurementUnit: "g" | "kg" | "ml" | "l" | "ea" | "lb";
  isSoldAsUnit: boolean;
};

type TasteSignal = {
  key: string;
  label: string;
  score: number;
  normalized: number;
};

type IntelligenceData = {
  taste: {
    signalCount: number;
    confidence: number;
    topCategories: TasteSignal[];
    topTags: TasteSignal[];
    generatedAt: string;
  };
  smartBasket: Array<{
    product: ProductUi;
    purchaseCount: number;
    averageIntervalDays: number;
    daysSinceLastPurchase: number;
    dueInDays: number;
    dueScore: number;
    confidence: number;
  }>;
  recommendations: Array<{
    product: ProductUi;
    score: number;
    reason: string;
  }>;
};

export default function ForYouClient() {
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "guest" | "error">("loading");
  const [building, setBuilding] = useState(false);
  const [added, setAdded] = useState<number | null>(null);

  const load = async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/intelligence/me", { cache: "no-store" });
      if (response.status === 401) {
        setStatus("guest");
        return;
      }
      if (!response.ok) throw new Error("Failed to load intelligence");
      const body = await response.json();
      setData(body.data);
      setStatus("ready");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const dueNow = useMemo(
    () => data?.smartBasket.filter((item) => item.dueInDays <= 0) || [],
    [data],
  );

  const buildSmartBasket = async () => {
    if (!data || building) return;
    setBuilding(true);
    setAdded(null);
    try {
      const response = await fetch("/api/intelligence/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: data.smartBasket.map((item) => item.product._id) }),
      });
      if (!response.ok) throw new Error("Failed to build Smart Basket");
      const body = await response.json();
      setAdded(Number(body.added || 0));
    } catch (error) {
      console.error(error);
      setAdded(0);
    } finally {
      setBuilding(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-[75vh] bg-[#f5f6f3] px-5 pb-24 pt-32">
        <div className="mx-auto flex max-w-6xl items-center gap-3 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Building your FreshPick view from real shopping signals…
        </div>
      </main>
    );
  }

  if (status === "guest") {
    return (
      <main className="min-h-[75vh] bg-[#f5f6f3] px-5 pb-24 pt-32">
        <section className="mx-auto max-w-4xl border border-zinc-200 bg-white p-8 md:p-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-700">FreshPick Intelligence</span>
          <h1 className="mt-5 max-w-3xl font-serif text-5xl font-normal leading-[0.98] text-zinc-950 md:text-7xl">Your food graph starts with your own history.</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-600">Sign in to turn past orders, saved baskets and wishlist activity into personalized recommendations and replenishment timing. FreshPick does not fabricate a profile before it has signals.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/auth/login" className="inline-flex h-12 items-center gap-2 bg-zinc-950 px-6 text-sm font-semibold text-white">Sign in <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/products" className="inline-flex h-12 items-center border border-zinc-300 px-6 text-sm font-semibold text-zinc-800">Browse catalogue</Link>
          </div>
        </section>
      </main>
    );
  }

  if (status === "error" || !data) {
    return (
      <main className="min-h-[75vh] bg-[#f5f6f3] px-5 pb-24 pt-32">
        <div className="mx-auto max-w-4xl border border-zinc-200 bg-white p-8">
          <p className="text-zinc-700">FreshPick Intelligence could not be generated right now.</p>
          <button onClick={() => void load()} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800"><RefreshCw className="h-4 w-4" /> Retry</button>
        </div>
      </main>
    );
  }

  const hasSignals = data.taste.signalCount > 0;

  return (
    <main className="min-h-screen bg-[#f5f6f3] pb-24 pt-28 text-zinc-950">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <header className="grid gap-8 border-b border-zinc-300 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-700"><BrainCircuit className="h-4 w-4" /> FreshPick Intelligence</div>
            <h1 className="mt-5 font-serif text-5xl font-normal leading-none md:text-7xl">For you, from your data.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600">This page is calculated from your real FreshPick behaviour. No demo preferences, invented scores or generic AI recommendations.</p>
          </div>
          <div className="flex gap-2 text-xs text-zinc-500">
            <span className="border border-zinc-300 bg-white px-3 py-2">{data.taste.signalCount} signals</span>
            <span className="border border-zinc-300 bg-white px-3 py-2">{data.taste.confidence}% profile confidence</span>
          </div>
        </header>

        <section className="grid gap-px border-x border-b border-zinc-300 bg-zinc-300 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-[#0b1710] p-7 text-white md:p-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-200">Taste Graph</p>
                <h2 className="mt-3 font-serif text-4xl font-normal">What your basket says you value.</h2>
              </div>
              <Sparkles className="h-6 w-6 text-emerald-200" />
            </div>

            {!hasSignals ? (
              <div className="mt-10 border border-white/15 p-5 text-sm leading-7 text-white/65">There is not enough shopping history yet. Add products to a saved basket, wishlist items, or complete orders and this graph will form automatically.</div>
            ) : (
              <div className="mt-10 space-y-5">
                {data.taste.topCategories.slice(0, 5).map((signal) => (
                  <div key={signal.key}>
                    <div className="mb-2 flex items-center justify-between text-sm"><span>{signal.label}</span><span className="text-white/45">{signal.normalized}</span></div>
                    <div className="h-1.5 bg-white/10"><div className="h-full bg-emerald-300" style={{ width: `${signal.normalized}%` }} /></div>
                  </div>
                ))}
              </div>
            )}

            {data.taste.topTags.length > 0 && (
              <div className="mt-9 flex flex-wrap gap-2 border-t border-white/10 pt-6">
                {data.taste.topTags.slice(0, 8).map((tag) => <span key={tag.key} className="border border-white/15 px-3 py-2 text-xs text-white/65">{tag.label}</span>)}
              </div>
            )}
          </div>

          <div className="bg-white p-7 md:p-10">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-700">Smart Basket</p>
                <h2 className="mt-3 font-serif text-4xl font-normal">What may be running out next.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">Intervals are estimated from repeat purchases. FreshPick only suggests items with at least two delivered-order signals.</p>
              </div>
              <button
                onClick={() => void buildSmartBasket()}
                disabled={building || data.smartBasket.length === 0}
                className="inline-flex h-11 items-center gap-2 bg-zinc-950 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {building ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
                Add predicted refills
              </button>
            </div>

            {added !== null && (
              <div className="mt-5 flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"><Check className="h-4 w-4" /> {added > 0 ? `${added} predicted refill${added === 1 ? "" : "s"} added to your active basket.` : "No eligible refills were added."}</div>
            )}

            <div className="mt-8 divide-y divide-zinc-200 border-y border-zinc-200">
              {data.smartBasket.length === 0 ? (
                <div className="py-8 text-sm leading-6 text-zinc-500">No repeat items have enough history to predict yet.</div>
              ) : data.smartBasket.slice(0, 7).map((item) => (
                <div key={item.product._id} className="grid gap-3 py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <div>
                    <div className="font-medium text-zinc-950">{item.product.name}</div>
                    <div className="mt-1 text-xs text-zinc-500">Bought {item.purchaseCount}× · typical interval {item.averageIntervalDays} days</div>
                  </div>
                  <div className={`text-xs font-semibold ${item.dueInDays <= 0 ? "text-rose-700" : "text-amber-700"}`}>{item.dueInDays <= 0 ? `${Math.abs(item.dueInDays)}d overdue` : `due in ${item.dueInDays}d`}</div>
                  <div className="text-xs text-zinc-400">{item.confidence}% confidence</div>
                </div>
              ))}
            </div>

            {dueNow.length > 0 && <p className="mt-5 text-xs text-zinc-500">{dueNow.length} item{dueNow.length === 1 ? " is" : "s are"} currently at or past the predicted replenishment point.</p>}
          </div>
        </section>

        <section className="pt-16">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-zinc-300 pb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-700">Recommended</p>
              <h2 className="mt-3 font-serif text-4xl font-normal md:text-5xl">Ranked against your Taste Graph.</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-zinc-700">Open full catalogue →</Link>
          </div>

          {data.recommendations.length === 0 ? (
            <div className="border-b border-zinc-300 py-12 text-sm text-zinc-500">FreshPick needs more signals before it can produce personalized recommendations. Until then, the catalogue stays neutral.</div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {data.recommendations.slice(0, 10).map((item, index) => (
                <div key={item.product._id}>
                  <div className="mb-2 min-h-10 text-xs leading-5 text-zinc-500">{item.reason}</div>
                  <ProductCard
                    id={item.product._id}
                    sku={item.product.sku}
                    name={item.product.name}
                    image={item.product.image?.url || ""}
                    discountPercentage={item.product.discountPercentage || 0}
                    baseMeasurementQuantity={item.product.baseMeasurementQuantity}
                    pricePerBaseQuantity={item.product.pricePerBaseQuantity}
                    measurementType={item.product.measurementUnit}
                    isDiscreteItem={item.product.isSoldAsUnit}
                    priority={index < 2}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
