import { publicPageMetadata } from '@/lib/publicPages';

import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import type { Metadata } from "next";
import FoodStoryCard from "@/components/ui/FoodStoryCard";
import { listCreators } from "@/lib/creatorService";

export const revalidate = 60;

export const metadata: Metadata = publicPageMetadata('/creators');

export default async function CreatorsPage() {
  const creators = await listCreators(48);
  return (
    <div className="min-h-screen bg-background">
      <PremiumPageHeader title="Meet the cooks" subtitle="Recipes and ideas from the people behind them." backgroundImage="/images/editorial/hands-at-work.webp" imageLayout="compact" />
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {creators.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {creators.map(creator => <FoodStoryCard key={creator.id} href={`/creators/${creator.id}`} title={creator.name} image={creator.latestRecipe?.image?.url} description={creator.latestRecipe ? `Latest recipe: ${creator.latestRecipe.title}` : undefined} meta={`${creator.recipeCount} recipe${creator.recipeCount === 1 ? "" : "s"}`} action="See recipes" />)}
          </div>
        ) : <p className="rounded-lg border border-border p-8 text-center text-muted-foreground">New cooks and their recipes will appear here soon.</p>}
      </section>
    </div>
  );
}
