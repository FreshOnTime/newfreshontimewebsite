import { publicPageMetadata } from '@/lib/publicPages';

import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import type { Metadata } from "next";
import Link from "next/link";
import FoodStoryCard from "@/components/ui/FoodStoryCard";
import { listPublishedRecipes } from "@/lib/recipeService";

export const revalidate = 60;

export const metadata: Metadata = publicPageMetadata('/recipes');

export default async function RecipesPage() {
  const recipes = await listPublishedRecipes(36);
  return (
    <div className="min-h-screen bg-background">
      <PremiumPageHeader title="Recipes" subtitle="Find something to cook, then shop the ingredients." backgroundImage="/images/editorial/recipe-ingredients.webp" imageLayout="compact" />
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {recipes.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recipes.map(recipe => <FoodStoryCard key={recipe.id} href={`/recipes/${recipe.slug}`} title={recipe.title} image={recipe.featuredImage?.url} description={recipe.excerpt} label={recipe.cuisine} meta={`${recipe.prepTimeMinutes + recipe.cookTimeMinutes} min · Serves ${recipe.servings}`} action="View recipe" />)}
          </div>
        ) : (
          <div className="rounded-lg border border-border p-8 text-center">
            <h2 className="text-xl font-normal">No recipes yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Check back for new recipes, or browse the market.</p>
            <Link href="/products" className="mt-5 inline-block text-sm font-medium text-brand-green hover:underline">Shop all products</Link>
          </div>
        )}
      </section>
    </div>
  );
}
