import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ChefHat,
  Compass,
  Repeat2,
  Sparkles,
  Store,
  TrendingUp,
  Utensils,
} from "lucide-react";
import { listPublishedRecipes } from "@/lib/recipeService";
import { getTrendingProducts } from "@/lib/intelligence/tasteGraph";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Discover Food | FreshPick Sri Lanka",
  description: "Discover shoppable recipes, ready meals, local makers and personalized food picks with FreshPick.",
  alternates: { canonical: "https://freshpick.lk/discover" },
};

const startingPoints = [
  {
    icon: ChefHat,
    signal: "Cook",
    label: "I need dinner",
    copy: "Start with a dish, then shop the ingredients in one connected flow.",
    href: "/recipes",
    meta: "Recipes",
  },
  {
    icon: Utensils,
    signal: "Ready",
    label: "I want something ready",
    copy: "Prepared food for the days when convenience matters more than cooking.",
    href: "/meals",
    meta: "Ready to eat",
  },
  {
    icon: Store,
    signal: "Local",
    label: "Show me something new",
    copy: "Find independent Sri Lankan makers and small-batch food beyond the supermarket shelf.",
    href: "/homemade",
    meta: "Local makers",
  },
  {
    icon: Repeat2,
    signal: "Routine",
    label: "Make the weekly shop easier",
    copy: "See personalized picks and repeat essentials FreshPick thinks may be worth bringing back.",
    href: "/for-you",
    meta: "For you",
  },
];

export default async function DiscoverPage() {
  const [recipes, trending] = await Promise.all([
    listPublishedRecipes(4),
    getTrendingProducts(5).catch(() => []),
  ]);

  return (
    <main className="overflow-hidden bg-white">
      <section className="relative isolate overflow-hidden bg-[#07100b] px-4 pb-20 pt-28 text-white md:px-8 md:pb-28 md:pt-36">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_10%_15%,rgba(52,211,153,0.15),transparent_30%),radial-gradient(circle_at_86%_40%,rgba(163,230,53,0.06),transparent_25%)]" />
        <div className="container relative mx-auto max-w-7xl">
          <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-end">
            <div className="max-w-5xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-white/[0.05] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.28em] text-emerald-200">
                <Compass className="h-3.5 w-3.5" /> FreshPick Discover
              </span>
              <h1 className="mt-7 text-balance font-serif text-6xl font-normal leading-[0.88] tracking-[-0.048em] sm:text-7xl md:text-8xl lg:text-[7rem]">
                Start with what sounds <span className="italic text-emerald-200">good.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-base font-light leading-8 text-white/60 md:text-lg">
                Dinner ideas, ready meals, local finds and your weekly favourites — without making you browse an endless wall of grocery aisles first.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/recipes" className="group inline-flex h-14 items-center gap-3 rounded-full bg-white px-7 text-[10px] font-bold uppercase tracking-[0.18em] text-[#07100b] transition-all hover:-translate-y-0.5 hover:bg-emerald-50">
                  Find dinner <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/for-you" className="inline-flex h-14 items-center gap-3 rounded-full border border-white/12 bg-white/[0.045] px-7 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 backdrop-blur-xl transition-colors hover:bg-white/[0.08] hover:text-white">
                  See your picks
                </Link>
              </div>
            </div>

            <aside className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-[0_30px_100px_rgba(0,0,0,0.2)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-emerald-200">Popular right now</p>
                  <p className="mt-2 text-sm font-light text-white/45">Based on recent FreshPick orders.</p>
                </div>
                <TrendingUp className="h-4 w-4 text-white/35" />
              </div>
              {trending.length === 0 ? (
                <div className="px-5 py-9 text-sm font-light leading-6 text-white/45">Popular picks will appear when there is enough recent order activity.</div>
              ) : (
                <div className="divide-y divide-white/10">
                  {trending.map((item, index) => (
                    <Link key={item.product._id} href={`/products/${item.product.sku}`} className="group grid grid-cols-[1.75rem_1fr_auto] items-center gap-3 px-5 py-4 transition-colors hover:bg-white/[0.04]">
                      <span className="font-serif text-sm text-white/25">0{index + 1}</span>
                      <span className="text-sm font-light text-white/70 group-hover:text-white">{item.product.name}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-white/25" />
                    </Link>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-[#f3f5f1] py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 grid gap-7 md:grid-cols-[1fr_0.65fr] md:items-end">
            <div>
              <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" /> Choose your mood
              </span>
              <h2 className="mt-5 text-balance font-serif text-5xl font-normal leading-[0.94] tracking-tight text-zinc-950 md:text-7xl">What kind of food day is this?</h2>
            </div>
            <p className="max-w-xl text-base font-light leading-7 text-zinc-600 md:justify-self-end">
              Pick the direction first. FreshPick takes you straight into the most useful experience from there.
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

      <section className="py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-emerald-700">Fresh from the kitchen</span>
              <h2 className="mt-4 font-serif text-5xl font-normal tracking-[-0.03em] text-zinc-950 md:text-6xl">Shoppable recipes.</h2>
            </div>
            <Link href="/recipes" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700">View all recipes <ArrowUpRight className="h-4 w-4" /></Link>
          </div>

          {recipes.length === 0 ? (
            <div className="rounded-[2rem] border border-zinc-200 bg-[#f7f8f5] px-6 py-14 text-sm text-zinc-500">Recipes will appear here as soon as they are published.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {recipes.map((recipe, index) => (
                <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className={`group overflow-hidden rounded-[1.75rem] bg-[#102017] ${index === 0 ? "md:col-span-2 xl:col-span-2" : ""}`}>
                  <div
                    className={`relative bg-cover bg-center ${index === 0 ? "h-[420px]" : "h-[300px]"}`}
                    style={recipe.featuredImage?.url ? { backgroundImage: `linear-gradient(to top, rgba(7,17,12,.84), rgba(7,17,12,.06)), url(\"${recipe.featuredImage.url.replace(/\"/g, "%22")}\")` } : undefined}
                  >
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-7">
                      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-200">{recipe.cuisine || "FreshPick recipe"}</p>
                      <h3 className={`mt-3 font-serif font-normal leading-[1.02] ${index === 0 ? "text-4xl md:text-5xl" : "text-3xl"}`}>{recipe.title}</h3>
                      <div className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">Shop the recipe <ArrowUpRight className="h-3.5 w-3.5" /></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
