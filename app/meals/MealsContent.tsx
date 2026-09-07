import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  ChefHat,
  Clock3,
  Repeat,
  Sparkles,
  Utensils,
} from "lucide-react";
import ProductGrid from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/button";
import { Product } from "@/models/product";

interface MealsContentProps {
  products: Product[];
}

const benefits = [
  {
    icon: ChefHat,
    title: "Ready when cooking is not",
    description: "FreshPick treats prepared food as one mode inside the same food experience, not a disconnected catalogue.",
  },
  {
    icon: CalendarDays,
    title: "Choose for today",
    description: "Order individual meals or compose a basket for the household from what is currently available.",
  },
  {
    icon: Repeat,
    title: "Make favourites recurring",
    description: "Use the recurring-order flow at checkout when a meal belongs in your regular routine.",
  },
  {
    icon: Clock3,
    title: "Control the rhythm",
    description: "Manage, pause or end recurring orders from the FreshPick account instead of contacting support for every change.",
  },
];

const modeRows = [
  ["Mode", "Ready to eat"],
  ["Catalogue", "Live availability"],
  ["Routine", "Recurring capable"],
  ["Checkout", "FreshPick basket"],
];

export default function MealsContent({ products }: MealsContentProps) {
  return (
    <div className="min-h-screen bg-[#f4f6f2] text-zinc-900">
      <section className="relative isolate overflow-hidden bg-[#07100b] px-4 pb-20 pt-28 text-white md:px-8 md:pb-28 md:pt-36">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_10%_16%,rgba(52,211,153,0.17),transparent_29%),radial-gradient(circle_at_86%_55%,rgba(163,230,53,0.07),transparent_24%)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />

        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-200/[0.055] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.28em] text-emerald-200">
                <Utensils className="h-3.5 w-3.5" /> FreshPick ready mode
              </span>
              <h1 className="mt-7 max-w-5xl text-balance font-serif text-6xl font-normal leading-[0.88] tracking-[-0.048em] md:text-8xl lg:text-[7rem]">
                Good food for the days the kitchen can <span className="italic text-emerald-200">stay quiet.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-base font-light leading-8 text-white/60 md:text-lg">
                Prepared meals live inside the same FreshPick experience as recipes, groceries and recurring baskets — giving you a faster path when convenience is the decision.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="#ready-menu" className="inline-flex h-14 items-center gap-3 rounded-full bg-white px-7 text-[10px] font-bold uppercase tracking-[0.18em] text-[#07100b] transition-colors hover:bg-emerald-50">
                  Open ready menu <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/discover" className="inline-flex h-14 items-center gap-3 rounded-full border border-white/12 bg-white/[0.045] px-7 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white">
                  Back to Discover
                </Link>
              </div>
            </div>

            <aside className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.25)] backdrop-blur-2xl md:p-6">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.23em] text-emerald-200">Convenience context</p>
                  <p className="mt-2 text-sm font-light text-white/42">A faster path through the same platform.</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-300/10 ring-1 ring-emerald-300/10">
                  <ChefHat className="h-4 w-4 text-emerald-200" />
                </span>
              </div>
              <div className="mt-5 space-y-2">
                {modeRows.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-black/10 px-3.5 py-3 text-xs">
                    <span className="text-white/35">{label}</span>
                    <span className="text-white/68">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-300/[0.07] px-3.5 py-3 text-[9px] font-bold uppercase tracking-[0.17em] text-emerald-200 ring-1 ring-emerald-300/10">
                <Sparkles className="h-3.5 w-3.5" /> One account · multiple food modes
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="ready-menu" className="py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 grid gap-7 md:grid-cols-[1fr_0.6fr] md:items-end">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-emerald-700">Live ready menu</span>
              <h2 className="mt-5 text-balance font-serif text-5xl font-normal leading-[0.95] tracking-[-0.035em] text-zinc-950 md:text-7xl">What is ready now.</h2>
            </div>
            <p className="max-w-xl text-sm font-light leading-7 text-zinc-600 md:justify-self-end">
              {products.length > 0
                ? `${products.length} ${products.length === 1 ? "meal is" : "meals are"} currently available through the FreshPick catalogue.`
                : "The next set of prepared meals is being readied for the catalogue."}
            </p>
          </div>

          {products.length > 0 ? (
            <>
              <ProductGrid products={products} className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5" />
              <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[1.5rem] border border-emerald-900/10 bg-emerald-50/70 p-6 md:flex-row md:items-center">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-700">Recurring ready mode</p>
                  <h3 className="mt-2 font-serif text-2xl font-normal text-emerald-950">Want favourite meals on a regular rhythm?</h3>
                  <p className="mt-2 max-w-2xl text-sm font-light leading-7 text-emerald-900/65">Add meals to the bag, then enable recurring order at checkout and choose the available delivery frequency.</p>
                </div>
                <Button asChild className="shrink-0 rounded-full bg-emerald-950 px-6 hover:bg-zinc-950">
                  <Link href="/bags">Open basket</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-zinc-300 bg-white px-6 text-center shadow-[0_18px_60px_rgba(10,30,18,0.035)]">
              <ChefHat className="mb-4 h-8 w-8 text-emerald-800" />
              <p className="font-serif text-3xl font-normal text-zinc-950">The ready menu is being prepared.</p>
              <p className="mt-3 max-w-md text-sm font-light leading-7 text-zinc-500">Cooked-food favourites will appear here as soon as they are available.</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12">
            <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-emerald-700">How ready mode fits</span>
            <h2 className="mt-5 max-w-4xl text-balance font-serif text-5xl font-normal leading-[0.95] tracking-[-0.035em] text-zinc-950 md:text-7xl">Convenience without leaving the FreshPick system.</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, description }, index) => (
              <article key={title} className="flex min-h-[300px] flex-col rounded-[1.75rem] border border-zinc-200/80 bg-[#f7f8f6] p-7">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-900 ring-1 ring-zinc-200">
                    <Icon className="h-5 w-5 stroke-[1.5]" />
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">0{index + 1}</span>
                </div>
                <div className="mt-auto pt-10">
                  <h3 className="font-serif text-2xl font-normal tracking-[-0.02em] text-zinc-950">{title}</h3>
                  <p className="mt-4 text-sm font-light leading-7 text-zinc-500">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
