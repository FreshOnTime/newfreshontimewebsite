import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  ChefHat,
  Compass,
  Repeat2,
  Sparkles,
  Store,
  Utensils,
} from "lucide-react";
import FoodDiscovery from "@/components/home/FoodDiscovery";

export const metadata: Metadata = {
  title: "Discover | FreshPick Food Intelligence",
  description: "FreshPick Discover turns cravings, routines and preferences into shoppable recipes, groceries, ready meals and local food discoveries in Colombo.",
  alternates: { canonical: "https://freshpick.lk/discover" },
};

const startingPoints = [
  {
    icon: ChefHat,
    signal: "Cook",
    label: "I need dinner",
    copy: "Pick the dish first. FreshPick connects the idea to live ingredients and approved substitutions.",
    href: "/recipes",
    meta: "Recipe → basket",
  },
  {
    icon: Utensils,
    signal: "Ready",
    label: "I want something ready",
    copy: "Prepared food for the days when convenience matters more than another cooking decision.",
    href: "/meals",
    meta: "Ready-to-eat",
  },
  {
    icon: Store,
    signal: "Discover",
    label: "Show me something new",
    copy: "Explore independent Sri Lankan makers and small-batch products outside the usual supermarket shelf.",
    href: "/homemade",
    meta: "Local network",
  },
  {
    icon: Repeat2,
    signal: "Routine",
    label: "Handle the weekly repeat",
    copy: "Move repeat household shopping into a recurring rhythm instead of rebuilding the same basket every week.",
    href: "/subscriptions",
    meta: "Recurring basket",
  },
];

const preferenceSignals = [
  ["Meal intent", "Tonight"],
  ["Discovery mode", "Taste-first"],
  ["Routine", "Repeat-aware"],
  ["Source", "Local-friendly"],
];

export default function DiscoverPage() {
  return (
    <main className="overflow-hidden bg-white">
      <section className="relative isolate overflow-hidden bg-[#07100b] px-4 pb-20 pt-28 text-white md:px-8 md:pb-28 md:pt-36">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_10%_15%,rgba(52,211,153,0.17),transparent_30%),radial-gradient(circle_at_86%_40%,rgba(163,230,53,0.08),transparent_25%)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.15] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />

        <div className="container relative mx-auto max-w-7xl">
          <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-end">
            <div className="max-w-5xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-200/[0.055] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.28em] text-emerald-200">
                <Compass className="h-3.5 w-3.5" /> FreshPick Discover
              </span>
              <h1 className="mt-7 text-balance font-serif text-6xl font-normal leading-[0.88] tracking-[-0.048em] sm:text-7xl md:text-8xl lg:text-[7rem]">
                Start with intent.<br />
                <span className="italic text-emerald-200">Not an aisle.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-base font-light leading-8 text-white/60 md:text-lg">
                Tell FreshPick what kind of food decision you are making — cooking, buying ready, discovering local or handling the weekly routine — and move directly into the right commerce flow.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/recipes" className="group inline-flex h-14 items-center gap-3 rounded-full bg-white px-7 text-[10px] font-bold uppercase tracking-[0.18em] text-[#07100b] transition-all hover:-translate-y-0.5 hover:bg-emerald-50">
                  Find dinner <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/products" className="inline-flex h-14 items-center gap-3 rounded-full border border-white/12 bg-white/[0.045] px-7 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 backdrop-blur-xl transition-colors hover:bg-white/[0.08] hover:text-white">
                  Open live catalogue
                </Link>
              </div>
            </div>

            <aside className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.25)] backdrop-blur-2xl md:p-6">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-emerald-200">Discovery context</p>
                  <p className="mt-2 text-sm font-light text-white/48">The signals behind a better starting point.</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-300/10 ring-1 ring-emerald-300/10">
                  <BrainCircuit className="h-4 w-4 text-emerald-200" />
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {preferenceSignals.map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/[0.07] bg-black/10 p-3.5">
                    <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-white/28">{label}</p>
                    <p className="mt-1.5 text-xs text-white/68">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-2xl bg-emerald-300/[0.07] px-4 py-4 ring-1 ring-emerald-300/10">
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                  <Sparkles className="h-3.5 w-3.5" /> Taste Graph direction
                </div>
                <p className="mt-2 text-xs font-light leading-5 text-white/45">Discovery can become increasingly personal as recipe, basket and repeat-purchase signals accumulate.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-[#f3f5f1] py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 grid gap-7 md:grid-cols-[1fr_0.65fr] md:items-end">
            <div>
              <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" /> Choose a mode
              </span>
              <h2 className="mt-5 text-balance font-serif text-5xl font-normal leading-[0.94] tracking-tight text-zinc-950 md:text-7xl">What kind of food decision are you making?</h2>
            </div>
            <p className="max-w-xl text-base font-light leading-7 text-zinc-600 md:justify-self-end">
              FreshPick should feel more like an intelligent food interface than a supermarket category tree. Each mode is a different route through the same connected catalogue.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {startingPoints.map(({ icon: Icon, signal, label, copy, href, meta }, index) => (
              <Link key={label} href={href} className="group flex min-h-[300px] flex-col rounded-[2rem] border border-zinc-200/80 bg-white p-7 shadow-[0_16px_60px_rgba(10,30,18,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_24px_80px_rgba(10,70,40,0.08)] md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-900 ring-1 ring-emerald-900/5">
                      <Icon className="h-5 w-5 stroke-[1.5]" />
                    </span>
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-emerald-700">{signal}</p>
                      <p className="mt-1 text-[10px] text-zinc-400">0{index + 1} · {meta}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-zinc-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-700" />
                </div>
                <div className="mt-auto pt-14">
                  <h3 className="font-serif text-3xl font-normal leading-tight tracking-[-0.02em] text-zinc-950 md:text-4xl">{label}</h3>
                  <p className="mt-4 max-w-lg text-sm font-light leading-7 text-zinc-600">{copy}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FoodDiscovery />
    </main>
  );
}
