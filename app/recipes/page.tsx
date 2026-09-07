import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock3, Sparkles, UsersRound } from "lucide-react";
import { listPublishedRecipes } from "@/lib/recipeService";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shoppable Recipes | FreshPick Colombo",
  description: "Discover FreshPick recipes, then add the ingredients for the whole meal to your basket in one action.",
  alternates: { canonical: "https://freshpick.lk/recipes" },
  openGraph: {
    title: "FreshPick Recipes | Discover dinner, shop it in one basket",
    description: "Recipes designed around ingredients you can actually buy from FreshPick.",
    url: "https://freshpick.lk/recipes",
    type: "website",
  },
};

export default async function RecipesPage() {
  const recipes = await listPublishedRecipes(36);

  return (
    <main className="min-h-screen bg-[#f6f7f4]">
      <section className="relative overflow-hidden bg-[#07110c] px-4 pb-24 pt-32 text-white md:px-8 md:pb-32 md:pt-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(110,231,183,0.14),transparent_28%),radial-gradient(circle_at_86%_55%,rgba(255,255,255,0.08),transparent_24%)]" />
        <div className="container relative mx-auto max-w-7xl">
          <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-200">
            <Sparkles className="h-3.5 w-3.5" /> FreshPick Recipes
          </span>
          <h1 className="max-w-5xl text-balance font-serif text-6xl font-normal leading-[0.9] tracking-[-0.045em] sm:text-7xl md:text-8xl lg:text-[7rem]">
            See dinner.<br />
            <span className="italic text-emerald-200">Shop the whole idea.</span>
          </h1>
          <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,680px)_auto] lg:items-end">
            <p className="max-w-2xl text-base font-light leading-8 text-white/65 md:text-lg">
              Start with a dish instead of an aisle. Every FreshPick recipe connects editorial inspiration to the ingredients available in the market, with substitutions handled when stock changes.
            </p>
            <Link
              href="/discover"
              className="inline-flex h-14 w-fit items-center gap-3 rounded-full border border-white/15 bg-white/[0.07] px-7 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:bg-white/[0.12] lg:justify-self-end"
            >
              Back to Discover <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-700">The FreshPick kitchen</span>
              <h2 className="font-serif text-4xl font-normal tracking-tight text-zinc-950 md:text-6xl">Cook from the craving.</h2>
            </div>
            <p className="max-w-md text-sm font-light leading-7 text-zinc-600">
              Seasonal edits, weeknight shortcuts and full-table ideas that turn into a basket instead of another saved post.
            </p>
          </div>

          {recipes.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {recipes.map((recipe, index) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.slug}`}
                  className={`group overflow-hidden rounded-[2rem] border border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_24px_70px_rgba(10,30,18,0.10)] ${index === 0 ? "md:col-span-2 xl:col-span-2" : ""}`}
                >
                  <div
                    className={`relative overflow-hidden bg-[#102017] ${index === 0 ? "h-[380px] md:h-[500px]" : "h-[300px]"}`}
                    style={recipe.featuredImage?.url ? {
                      backgroundImage: `linear-gradient(to top, rgba(7,17,12,.75), rgba(7,17,12,.08)), url("${recipe.featuredImage.url.replace(/"/g, "%22")}")`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                    } : undefined}
                  >
                    <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-8">
                      <div className="mb-4 flex flex-wrap gap-2">
                        {recipe.cuisine && <span className="rounded-full bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] backdrop-blur-md">{recipe.cuisine}</span>}
                        {recipe.dietaryTags.slice(0, 2).map((tag) => (
                          <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] backdrop-blur-md">{tag}</span>
                        ))}
                      </div>
                      <h3 className={`max-w-2xl font-serif font-normal leading-[1.02] ${index === 0 ? "text-4xl md:text-6xl" : "text-3xl"}`}>{recipe.title}</h3>
                    </div>
                  </div>

                  <div className="p-7 md:p-8">
                    <p className="text-sm font-light leading-7 text-zinc-600">{recipe.excerpt}</p>
                    <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-zinc-100 pt-5 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" /> {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</span>
                      <span className="inline-flex items-center gap-2"><UsersRound className="h-4 w-4" /> Serves {recipe.servings}</span>
                      <span className="ml-auto inline-flex items-center gap-2 font-semibold text-emerald-800">Shop recipe <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-zinc-200 bg-white px-6 py-20 text-center">
              <p className="font-serif text-3xl text-zinc-950">The FreshPick kitchen is preparing its first edit.</p>
              <p className="mx-auto mt-4 max-w-xl text-sm font-light leading-7 text-zinc-600">Recipes appear here as soon as your team publishes them from the new recipe studio.</p>
              <Link href="/discover" className="mt-7 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-800">Explore FreshPick Discover <ArrowUpRight className="h-4 w-4" /></Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
