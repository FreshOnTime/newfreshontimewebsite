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
  TrendingUp,
  Utensils,
} from "lucide-react";
import { listPublishedRecipes } from "@/lib/recipeService";
import { getTrendingProducts } from "@/lib/intelligence/tasteGraph";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Discover | FreshPick Food Intelligence",
  description: "FreshPick Discover connects real product demand, shoppable recipes, recurring routines and local food discovery in one interface.",
  alternates: { canonical: "https://freshpick.lk/discover" },
};

const startingPoints = [
  {
    icon: ChefHat,
    signal: "Cook",
    label: "I need dinner",
    copy: "Start with a published recipe, then resolve the ingredients against current stock and approved substitutions.",
    href: "/recipes",
    meta: "Recipe → basket",
  },
  {
    icon: Utensils,
    signal: "Ready",
    label: "I want something ready",
    copy: "Move directly into prepared food when cooking is not the job today.",
    href: "/meals",
    meta: "Ready-to-eat",
  },
  {
    icon: Store,
    signal: "Discover",
    label: "Show me local makers",
    copy: "Browse the curated maker network rather than another generic marketplace feed.",
    href: "/homemade",
    meta: "Maker network",
  },
  {
    icon: Repeat2,
    signal: "Routine",
    label: "Handle the weekly repeat",
    copy: "Use recurring plans or open your Smart Basket to see what your own order rhythm says may be due next.",
    href: "/for-you",
    meta: "Prediction → basket",
  },
];

export default async function DiscoverPage() {
  const [recipes, trending] = await Promise.all([
    listPublishedRecipes(4),
    getTrendingProducts(6).catch(() => []),
  ]);

  return (
    <main className="overflow-hidden bg-white">
      <section className="border-b border-zinc-800 bg-[#0b1510] px-4 pb-16 pt-28 text-white md:px-8 md:pb-20 md:pt-36">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
            <div className="max-w-5xl">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-200">
                <Compass className="h-3.5 w-3.5" /> Discover
              </span>
              <h1 className="mt-6 max-w-5xl font-serif text-6xl font-normal leading-[0.9] tracking-[-0.045em] sm:text-7xl md:text-8xl lg:text-[7rem]">
                Start with the decision.<br />
                <span className="text-emerald-200">FreshPick resolves the rest.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/60 md:text-lg">
                Recipes, product demand, recurring behaviour and live stock feed into one connected commerce system.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/for-you" className="inline-flex h-12 items-center gap-2 bg-white px-5 text-sm font-semibold text-[#07100b]">
                  Open For You <BrainCircuit className="h-4 w-4" />
                </Link>
                <Link href="/recipes" className="inline-flex h-12 items-center gap-2 border border-white/15 px-5 text-sm font-semibold text-white/80">
                  Browse recipes <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <aside className="border border-white/10 bg-white/[0.04]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-200">30-day demand</p>
                  <p className="mt-1 text-xs text-white/35">Calculated from recent order quantities</p>
                </div>
                <TrendingUp className="h-4 w-4 text-white/40" />
              </div>
              {trending.length === 0 ? (
                <div className="px-5 py-8 text-sm leading-6 text-white/45">Demand ranking will appear once recent order activity is available.</div>
              ) : (
                <div className="divide-y divide-white/10">
                  {trending.slice(0, 5).map((item, index) => (
                    <Link key={item.product._id} href={`/products/${item.product.sku}`} className="grid grid-cols-[1.5rem_1fr_auto] gap-3 px-5 py-4 text-sm hover:bg-white/[0.04]">
                      <span className="text-white/25">{index + 1}</span>
                      <span className="text-white/75">{item.product.name}</span>
                      <span className="text-xs tabular-nums text-white/35">{item.units}</span>
                    </Link>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f5f2] py-20 md:py-24">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-zinc-300 pb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">Choose a flow</p>
              <h2 className="mt-3 font-serif text-4xl font-normal text-zinc-950 md:text-6xl">What are you trying to do?</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-zinc-500">Four entry points, one connected catalogue.</p>
          </div>

          <div className="grid gap-px border border-zinc-300 bg-zinc-300 md:grid-cols-2">
            {startingPoints.map(({ icon: Icon, signal, label, copy, href, meta }, index) => (
              <Link key={label} href={href} className="group min-h-[250px] bg-white p-6 transition-colors hover:bg-emerald-50/50 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <Icon className="h-5 w-5 text-emerald-800" />
                  <span className="text-xs tabular-nums text-zinc-300">0{index + 1}</span>
                </div>
                <div className="mt-14">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-700">{signal} · {meta}</p>
                  <h3 className="mt-3 font-serif text-3xl font-normal text-zinc-950">{label}</h3>
                  <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-500">{copy}</p>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-zinc-700">Open <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-zinc-200 pb-6">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700"><Sparkles className="h-3.5 w-3.5" /> Published now</div>
              <h2 className="mt-3 font-serif text-4xl font-normal text-zinc-950 md:text-5xl">Shoppable recipes</h2>
            </div>
            <Link href="/recipes" className="text-sm font-semibold text-zinc-700">View all recipes →</Link>
          </div>

          {recipes.length === 0 ? (
            <div className="border border-zinc-200 bg-zinc-50 px-6 py-12 text-sm text-zinc-500">No published recipes yet. Content appears here after it is published from Recipe Studio.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {recipes.map((recipe) => (
                <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="group border border-zinc-200 bg-white transition-colors hover:border-emerald-300">
                  <div
                    className="h-56 bg-[#102017] bg-cover bg-center"
                    style={recipe.featuredImage?.url ? { backgroundImage: `linear-gradient(to top, rgba(7,17,12,.58), rgba(7,17,12,.05)), url(\"${recipe.featuredImage.url.replace(/\"/g, "%22")}\")` } : undefined}
                  />
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3 text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                      <span>{recipe.cuisine || "Recipe"}</span>
                      <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</span>
                    </div>
                    <h3 className="mt-4 font-serif text-2xl font-normal leading-tight text-zinc-950">{recipe.title}</h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">{recipe.excerpt}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-emerald-800">Resolve ingredients <ArrowUpRight className="h-3.5 w-3.5" /></span>
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
