
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FoodStoryCard from "@/components/ui/FoodStoryCard";
import { getCreatorById } from "@/lib/creatorService";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const creator = await getCreatorById(id);
  if (!creator) return { title: "Creator not found | FreshPick" };
  return {
    title: `${creator.name} | FreshPick Creator`,
    description: `Discover shoppable recipes published by ${creator.name} on FreshPick.`,
  };
}

export default async function CreatorPage({ params }: Props) {
  const { id } = await params;
  const creator = await getCreatorById(id);
  if (!creator) notFound();

  return (
    <main className="min-h-screen bg-background">
      <PremiumPageHeader title={creator.name} subtitle={`${creator.recipeCount} published recipe${creator.recipeCount === 1 ? "" : "s"}`} />
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {creator.recipes.map(recipe => <FoodStoryCard key={recipe.id} href={`/recipes/${recipe.slug}`} title={recipe.title} image={recipe.image?.url} description={recipe.excerpt} label={recipe.cuisine} meta={`${recipe.prepMinutes + recipe.cookMinutes} min`} action="View recipe" />)}
        </div>
      </section>
    </main>
  );
}
