"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Heart, Loader2, RefreshCw, ShoppingBag, Sparkles } from "lucide-react";
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

type TasteSignal = { key: string; label: string; score: number; normalized: number };

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

  const dueNow = useMemo(() => data?.smartBasket.filter((item) => item.dueInDays <= 0) || [], [data]);

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
      <main className="min-h-0 bg-background px-5 pb-10 pt-12">
        <div className="mx-auto flex max-w-6xl items-center gap-3 text-sm font-normal text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Finding the things that fit you…
        </div>
      </main>
    );
  }

  if (status === "guest") {
    return (
      <main className="min-h-screen bg-background px-5 pb-10 pt-12 text-foreground">
        <section className="mx-auto max-w-6xl py-8 md:py-10">
          <span className="inline-flex items-center gap-2 text-xs font-bold normal-case text-brand-green"><Heart className="h-4 w-4" /> For You</span>
          <h1 className="mt-6 max-w-5xl font-sans text-4xl font-semibold leading-tight md:text-4xl">
            A FreshPick that becomes <span className="not-italic text-brand-green">more yours.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-base font-normal leading-8 text-muted-foreground md:text-lg">
            Sign in and FreshPick can use your real shopping history to bring back favourites, suggest repeat essentials and rank products around what you actually choose.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/auth/login" className="inline-flex h-14 items-center gap-2 rounded-full bg-background px-7 text-xs font-bold normal-case text-[#08120d]">Sign in <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/discover" className="inline-flex h-14 items-center rounded-full border border-border px-7 text-xs font-bold normal-case text-muted-foreground">Explore FreshPick</Link>
          </div>
        </section>
      </main>
    );
  }

  if (status === "error" || !data) {
    return (
      <main className="min-h-0 bg-background px-5 pb-10 pt-12">
        <div className="mx-auto max-w-4xl rounded-xl border border-zinc-200 bg-background p-8">
          <p className="font-sans text-2xl text-zinc-900">Your picks are unavailable right now.</p>
          <button onClick={() => void load()} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800"><RefreshCw className="h-4 w-4" /> Try again</button>
        </div>
      </main>
    );
  }

  const hasSignals = data.taste.signalCount > 0;
  const tasteLabels = [...data.taste.topCategories.slice(0, 5), ...data.taste.topTags.slice(0, 4)]
    .filter((item, index, array) => array.findIndex((candidate) => candidate.label === item.label) === index)
    .slice(0, 7);

  return (
    <main className="min-h-screen bg-background pb-10 text-zinc-950">
      <section className="bg-background px-4 pb-8 pt-12 text-foreground md:px-8 md:pb-10 md:pt-12">
        <div className="mx-auto max-w-7xl">
          <span className="inline-flex items-center gap-2 text-xs font-bold normal-case text-brand-green"><Sparkles className="h-4 w-4" /> For You</span>
          <div className="mt-6 grid gap-10 xl:grid-cols-[1fr_420px] xl:items-end">
            <div>
              <h1 className="max-w-5xl font-sans text-4xl font-semibold leading-tight sm:text-4xl md:text-4xl lg:text-4xl">
                A little more like <span className="not-italic text-brand-green">you.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-base font-normal leading-8 text-muted-foreground md:text-lg">
                Favourites, repeat essentials and new things worth trying — shaped by the FreshPick choices you have actually made.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-secondary p-6">
              <p className="text-xs font-bold normal-case text-brand-green">Your flavour of FreshPick</p>
              {hasSignals ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {tasteLabels.map((signal) => (
                    <span key={`${signal.key}-${signal.label}`} className="rounded-full border border-border bg-secondary px-3.5 py-2 text-xs font-normal text-muted-foreground">{signal.label}</span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm font-normal leading-6 text-muted-foreground">Your profile will take shape as you save products, build baskets and complete orders.</p>
              )}
              {hasSignals && <p className="mt-5 text-xs font-normal text-muted-foreground">Based on {data.taste.signalCount} shopping signal{data.taste.signalCount === 1 ? "" : "s"}.</p>}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <section className="mt-6 relative z-10 rounded-xl border border-zinc-200 bg-background p-6 md:p-9">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold normal-case text-emerald-700">Running low?</p>
              <h2 className="mt-3 font-sans text-2xl font-semibold md:text-2xl">Things you may want again.</h2>
              <p className="mt-3 max-w-2xl text-sm font-normal leading-7 text-zinc-500">These only appear when repeat purchases form a real pattern.</p>
            </div>
            <button
              onClick={() => void buildSmartBasket()}
              disabled={building || data.smartBasket.length === 0}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-amber px-6 text-xs font-bold normal-case text-accent-foreground transition-colors hover:bg-brand-amber/85 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {building ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
              Add repeat essentials
            </button>
          </div>

          {added !== null && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs text-emerald-900"><Check className="h-4 w-4" /> {added > 0 ? `${added} item${added === 1 ? "" : "s"} added to your basket.` : "Nothing eligible was added."}</div>
          )}

          {data.smartBasket.length === 0 ? (
            <div className="mt-8 rounded-xl bg-background px-5 py-8 text-sm font-normal text-zinc-500">No repeat products have enough history yet.</div>
          ) : (
            <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {data.smartBasket.slice(0, 8).map((item) => (
                <div key={item.product._id} className="rounded-xl border border-zinc-200 bg-background p-5">
                  <p className="font-sans text-2xl leading-tight text-zinc-950">{item.product.name}</p>
                  <p className="mt-3 text-xs font-normal leading-5 text-zinc-500">Usually comes back around every {item.averageIntervalDays} days.</p>
                  <p className={`mt-5 text-xs font-bold normal-case ${item.dueInDays <= 0 ? "text-rose-700" : "text-amber-700"} `}>
                    {item.dueInDays <= 0 ? "Might be time again" : `Around ${item.dueInDays} day${item.dueInDays === 1 ? "" : "s"} away`}
                  </p>
                </div>
              ))}
            </div>
          )}

          {dueNow.length > 0 && <p className="mt-5 text-xs font-normal text-muted-foreground">{dueNow.length} repeat item{dueNow.length === 1 ? " looks" : "s look"} due based on your previous rhythm.</p>}
        </section>

        <section className="pt-8 md:pt-10">
          <div className="mb-6 grid gap-7 md:grid-cols-[1fr_0.65fr] md:items-end">
            <div>
              <p className="text-xs font-bold normal-case text-emerald-700">Picked for you</p>
              <h2 className="mt-4 font-sans text-2xl font-semibold leading-tight md:text-2xl">Things worth a look.</h2>
            </div>
            <p className="max-w-lg text-base font-normal leading-7 text-zinc-600 md:justify-self-end">Recommendations move as your actual FreshPick choices change.</p>
          </div>

          {data.recommendations.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-background px-6 py-14 text-sm font-normal text-zinc-500">FreshPick needs a little more history before it can make personal picks.</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {data.recommendations.slice(0, 10).map((item, index) => (
                <div key={item.product._id}>
                  <p className="mb-3 min-h-8 text-xs font-normal leading-5 text-zinc-500">{item.reason}</p>
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

          <div className="mt-10 text-center">
            <Link href="/products" className="inline-flex items-center gap-2 text-xs font-bold normal-case text-zinc-800 hover:text-emerald-700">Browse everything <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </div>
    </main>
  );
}
