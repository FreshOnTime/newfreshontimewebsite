
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, ShoppingBasket } from "lucide-react";
import { listPublishedRecipes } from "@/lib/recipeService";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Dinner Ideas | FreshPick",
  description: "Choose a published FreshPick recipe and turn its ingredients into a stock-aware shopping basket.",
};

export default async function MealKitsPage() {
  const recipes = await listPublishedRecipes(8).catch(() => []);

  return (
    <main className="min-h-screen bg-background pb-10 text-zinc-950">
      <PremiumPageHeader title="Meal ideas" subtitle="Choose a recipe and find the ingredients you need." />

      <div className="mx-auto max-w-6xl px-5 pt-14 md:px-8 md:pt-8">
        <section>
          <div className="flex flex-wrap items-end justify-between gap-5 border-b border-zinc-300 pb-5">
            <div>
              <p className="text-xs font-bold normal-case text-emerald-700">Published now</p>
              <h2 className="mt-2 font-sans text-2xl font-semibold md:text-2xl">Dinner ideas you can actually shop.</h2>
            </div>
            <span className="inline-flex items-center gap-2 text-xs font-normal text-muted-foreground"><ShoppingBasket className="h-3.5 w-3.5" /> Stock-aware ingredient baskets</span>
          </div>

          {recipes.length === 0 ? (
            <div className="mt-7 rounded-xl border border-zinc-200 bg-background p-10 text-sm font-normal leading-7 text-zinc-500">No recipes are published right now. The live market remains available while Recipe Studio content is updated.</div>
          ) : (
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recipes.map((recipe) => (
                <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="group overflow-hidden rounded-xl border border-zinc-200 bg-background transition-all hover:border-emerald-300">
                  <div className="relative aspect-[4/3] overflow-hidden bg-background">
                    {recipe.featuredImage?.url ? <Image src={recipe.featuredImage.url} alt={recipe.featuredImage.alt || recipe.title} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover transition-transform duration-700" /> : null}

                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3 text-xs font-bold normal-case text-muted-foreground"><span>{recipe.cuisine || 'Recipe'}</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" /> {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</span></div>
                    <h3 className="mt-3 font-sans text-2xl font-semibold leading-tight text-zinc-950">{recipe.title}</h3>
                    <p className="mt-3 line-clamp-2 text-sm font-normal leading-6 text-zinc-500">{recipe.excerpt}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-emerald-800">Open recipe <ArrowRight className="h-3.5 w-3.5" /></span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
