
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import type { Metadata } from "next";
import FoodStoryCard from "@/components/ui/FoodStoryCard";
import { listCreators } from "@/lib/creatorService";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "FreshPick Creators | Recipes & Food Ideas",
  description: "Meet the people publishing shoppable recipes and food ideas on FreshPick.",
};

export default async function CreatorsPage() {
  const creators = await listCreators(48);
  return (
    <main className="min-h-screen bg-background">
      <PremiumPageHeader title="Meet the cooks" subtitle="Recipes and ideas from the people behind them." />
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {creators.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {creators.map(creator => <FoodStoryCard key={creator.id} href={`/creators/${creator.id}`} title={creator.name} image={creator.latestRecipe?.image?.url} description={creator.latestRecipe ? `Latest recipe: ${creator.latestRecipe.title}` : undefined} meta={`${creator.recipeCount} recipe${creator.recipeCount === 1 ? "" : "s"}`} action="See recipes" />)}
          </div>
        ) : <p className="rounded-xl border border-border p-8 text-center text-muted-foreground">New cooks and their recipes will appear here soon.</p>}
      </section>
    </main>
  );
}
