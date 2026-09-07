import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  ShoppingBasket,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { listPublishedRecipes } from "@/lib/recipeService";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shoppable Recipes | FreshPick Food Discovery",
  description: "Discover FreshPick recipes, then add the available ingredients for the whole meal to your basket in one action.",
  alternates: { canonical: "https://freshpick.lk/recipes" },
  openGraph: {
    title: "FreshPick Recipes | See dinner, shop the whole idea",
    description: "Recipe discovery connected directly to FreshPick's live catalogue and stock-aware ingredient flow.",
    url: "https://freshpick.lk/recipes",
    type: "website",
  },
};

const workflow = [
  ["01", "Discover", "Start with a meal instead of browsing product aisles."],
  ["02", "Resolve", "FreshPick connects the recipe to catalogue products and approved substitutions."],
  ["03", "Shop", "Add the available ingredients for the whole idea to one basket."],
];

export default async function RecipesPage() {
  const recipes = await listPublishedRecipes(36);

  return (
    <main className="min-h-screen bg-[#f4f6f2]">
      <section className="relative isolate overflow-hidden bg-[#07100b] px-4 pb-20 pt-28 text-white md:px-8 md:pb-28 md:pt-36">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_18%,rgba(52,211,153,0.18),transparent_29%),radial-gradient(circle_at_88%_52%,rgba(163,230,53,0.07),transparent_24%)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.15] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />

        <div className="container relative mx-auto max-w-7xl">
          <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-200/[0.055] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.28em] text-emerald-200">
                <Sparkles className="h-3.5 w-3.5" /> FreshPick recipe engine
              </span>
              <h1 className="mt-7 max-w-5xl text-balance font-serif text-6xl font-normal leading-[0.88] tracking-[-0.048em] sm:text-7xl md:text-8xl lg:text-[7rem]">
                See dinner.<br />
                <span className="italic text-emerald-200">Shop the whole idea.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-base font-light leading-8 text-white/60 md:text-lg">
                FreshPick recipes are not just content. They are a commerce interface connecting a food idea to live products, availability-aware substitutions and the basket.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/discover" className="inline-flex h-14 items-center gap-3 rounded-full bg-white px-7 text-[10px] font-bold uppercase tracking-[0.18em] text-[#07100b] transition-colors hover:bg-emerald-50">
                  Open Discover <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/products" className="inline-flex h-14 items-center gap-3 rounded-full border border-white/12 bg-white/[0.045] px-7 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white">
                  Live catalogue
                </Link>
              </div>
            </div>

            <aside className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.25)] backdrop-blur-2xl md:p-6">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.23em] text-emerald-200">Recipe workflow</p>
                  <p className="mt-2 text-sm font-light text-white/42">Content that resolves into commerce.</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-300/10 ring-1 ring-emerald-300/10">
                  <BrainCircuit className="h-4 w-4 text-emerald-200" />
                </span>
              </div>
              <div className="mt-5 space-y-2">
                {workflow.map(([number, label, copy]) => (
                  <div key={number} className="rounded-xl border border-white/[0.07] bg-black/10 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/28">{number}</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200/65" />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-white/72">{label}</p>
                    <p className="mt-1 text-[10px] font-light leading-5 text-white/35">{copy}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 grid gap-7 md:grid-cols-[1fr_0.62fr] md:items-end">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-emerald-700">The FreshPick kitchen</span>
              <h2 className="mt-5 text-balance font-serif text-5xl font-normal leading-[0.95] tracking-[-0.035em] text-zinc-950 md:text-7xl">Cook from the craving.</h2>
            </div>
            <p className="max-w-md text-sm font-light leading-7 text-zinc-600 md:justify-self-end">
              Seasonal edits, weeknight shortcuts and full-table ideas designed to turn into a basket instead of another saved post.
            </p>
          </div>

          {recipes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recipes.map((recipe, index) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.slug}`}
                  className={`group overflow-hidden rounded-[1.5rem] border border-zinc-200/80 bg-white shadow-[0_16px_60px_rgba(10,30,18,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_24px_70px_rgba(10,50,30,0.08)] ${index === 0 ? "md:col-span-2 xl:col-span-2" : ""}`}
                >
                  <div
                    className={`relative overflow-hidden bg-[#102017] ${index === 0 ? "h-[380px] md:h-[500px]" : "h-[300px]"}`}
                    style={recipe.featuredImage?.url ? {
                      backgroundImage: `linear-gradient(to top, rgba(7,17,12,.82), rgba(7,17,12,.08)), url("${recipe.featuredImage.url.replace(/"/g, "%22")}")`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                    } : undefined}
                  >
                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-[8px] font-bold uppercase tracking-[0.17em] text-white/75 backdrop-blur-xl">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Shoppable
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
                      <div className="mb-4 flex flex-wrap gap-2">
                        {recipe.cuisine && <span className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em] backdrop-blur-md">{recipe.cuisine}</span>}
                        {recipe.dietaryTags.slice(0, 2).map((tag) => (
                          <span key={tag} className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em] backdrop-blur-md">{tag}</span>
                        ))}
                      </div>
                      <h3 className={`max-w-2xl font-serif font-normal leading-[1.02] tracking-[-0.025em] ${index === 0 ? "text-4xl md:text-6xl" : "text-3xl"}`}>{recipe.title}</h3>
                    </div>
                  </div>

                  <div className="p-6 md:p-7">
                    <p className="text-sm font-light leading-7 text-zinc-600">{recipe.excerpt}</p>
                    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-zinc-100 pt-5 text-[11px] text-zinc-500">
                      <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</span>
                      <span className="inline-flex items-center gap-1.5"><UsersRound className="h-3.5 w-3.5" /> Serves {recipe.servings}</span>
                      <span className="ml-auto inline-flex items-center gap-2 font-semibold text-emerald-800"><ShoppingBasket className="h-3.5 w-3.5" /> Shop recipe <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-zinc-200 bg-white px-6 py-20 text-center shadow-[0_18px_60px_rgba(10,30,18,0.04)]">
              <p className="font-serif text-3xl font-normal text-zinc-950">The FreshPick kitchen is preparing its first edit.</p>
              <p className="mx-auto mt-4 max-w-xl text-sm font-light leading-7 text-zinc-600">Recipes appear here as soon as your team publishes them from Recipe Studio.</p>
              <Link href="/discover" className="mt-7 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-800">Explore FreshPick Discover <ArrowUpRight className="h-4 w-4" /></Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
