import Link from "next/link";
import {
  ArrowUpRight,
  BrainCircuit,
  ChefHat,
  PackageCheck,
  Repeat2,
  Sparkles,
  Store,
  UsersRound,
} from "lucide-react";

const platformModules = [
  {
    icon: BrainCircuit,
    label: "Taste Graph",
    title: "FreshPick learns the food you actually come back to.",
    copy: "Recipes viewed, products saved, repeat orders, dietary preferences and substitutions become useful context for a more personal storefront.",
    meta: ["Preference signals", "Recipe affinity", "Household rhythm"],
  },
  {
    icon: Repeat2,
    label: "Smart Basket",
    title: "Turn repeat shopping into an intelligent routine.",
    copy: "Recurring baskets, quick reorder and meal-led additions sit in one flow so FreshPick can help households plan rather than restart every week.",
    meta: ["Recurring delivery", "Quick reorder", "Stock-aware choices"],
  },
  {
    icon: UsersRound,
    label: "Creator Commerce",
    title: "Discover food through people, then shop the idea.",
    copy: "FreshPick is being shaped around shoppable recipes, creator-led discovery and one-action ingredient baskets instead of a wall of supermarket categories.",
    meta: ["Shoppable recipes", "Creator storefronts", "Attribution ready"],
  },
  {
    icon: Store,
    label: "Supply Network",
    title: "A better operating layer behind every basket.",
    copy: "Supplier workflows, subscriptions and demand signals create the foundation for smarter sourcing, better availability and less waste over time.",
    meta: ["Supplier workflows", "Demand signals", "Availability intelligence"],
  },
];

const tasteRows = [
  { label: "Weeknight cooking", width: "w-[88%]" },
  { label: "Fresh produce", width: "w-[74%]" },
  { label: "Local makers", width: "w-[61%]" },
  { label: "Ready meals", width: "w-[45%]" },
];

export default function PlatformIntelligence() {
  return (
    <section className="relative overflow-hidden bg-[#07100b] py-24 text-white md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(52,211,153,0.15),transparent_30%),radial-gradient(circle_at_90%_25%,rgba(163,230,53,0.08),transparent_24%)]" />
      <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:52px_52px]" />

      <div className="container relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-12 xl:grid-cols-[0.82fr_1.18fr] xl:items-start">
          <div className="xl:sticky xl:top-32">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" /> FreshPick intelligence
            </span>
            <h2 className="mt-7 max-w-3xl text-balance font-serif text-5xl font-normal leading-[0.92] tracking-[-0.04em] md:text-7xl">
              More useful every time you <span className="italic text-emerald-200">use it.</span>
            </h2>
            <p className="mt-7 max-w-xl text-base font-light leading-8 text-white/60">
              The premium experience is not just visual. FreshPick is evolving into a food platform that connects taste, recurring household needs, creators and suppliers in one system.
            </p>

            <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-emerald-200">Your taste profile</p>
                  <p className="mt-2 text-sm text-white/55">Signals FreshPick can use to shape discovery.</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-300/10 ring-1 ring-emerald-300/15">
                  <BrainCircuit className="h-5 w-5 text-emerald-200" />
                </div>
              </div>

              <div className="space-y-5 py-6">
                {tasteRows.map((row) => (
                  <div key={row.label}>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-white/70">{row.label}</span>
                      <span className="text-[9px] uppercase tracking-[0.2em] text-white/35">signal</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.07]">
                      <div className={`h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300 ${row.width}`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-5">
                {[
                  ["Tonight", "Recipe-led"],
                  ["Weekly", "Repeat-aware"],
                  ["Discover", "Taste-led"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-black/15 px-3 py-3">
                    <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/35">{label}</p>
                    <p className="mt-1 text-xs text-white/75">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {platformModules.map(({ icon: Icon, label, title, copy, meta }, index) => (
              <article
                key={label}
                className={`group flex min-h-[390px] flex-col rounded-[2rem] border p-7 transition-all duration-300 hover:-translate-y-1 md:p-8 ${
                  index === 0
                    ? "border-emerald-300/20 bg-emerald-300/[0.08]"
                    : "border-white/10 bg-white/[0.045] hover:bg-white/[0.07]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-emerald-200">{label}</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
                    <Icon className="h-5 w-5 stroke-[1.5] text-white/75" />
                  </span>
                </div>

                <div className="mt-12">
                  <h3 className="font-serif text-3xl font-normal leading-[1.02] tracking-[-0.02em] text-white md:text-[2.1rem]">{title}</h3>
                  <p className="mt-5 text-sm font-light leading-7 text-white/55">{copy}</p>
                </div>

                <div className="mt-auto flex flex-wrap gap-2 pt-9">
                  {meta.map((item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-black/10 px-3 py-2 text-[9px] font-medium uppercase tracking-[0.14em] text-white/50">
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Link href="/recipes" className="group flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 transition-colors hover:bg-white/[0.07]">
            <span className="flex items-center gap-3 text-sm text-white/70"><ChefHat className="h-4 w-4 text-emerald-200" /> Explore shoppable recipes</span>
            <ArrowUpRight className="h-4 w-4 text-white/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <Link href="/subscriptions" className="group flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 transition-colors hover:bg-white/[0.07]">
            <span className="flex items-center gap-3 text-sm text-white/70"><PackageCheck className="h-4 w-4 text-emerald-200" /> Build a recurring basket</span>
            <ArrowUpRight className="h-4 w-4 text-white/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <Link href="/b2b" className="group flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 transition-colors hover:bg-white/[0.07]">
            <span className="flex items-center gap-3 text-sm text-white/70"><Store className="h-4 w-4 text-emerald-200" /> Join the partner network</span>
            <ArrowUpRight className="h-4 w-4 text-white/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
