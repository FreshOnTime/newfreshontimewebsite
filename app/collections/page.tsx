
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import type { Metadata } from "next";
import Link from "next/link";
import FoodStoryCard from "@/components/ui/FoodStoryCard";
import { listPublishedCollections } from "@/lib/collectionService";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Food Collections | FreshPick Colombo",
  description: "Curated FreshPick food edits for occasions, cravings and routines — combining shoppable recipes and live products.",
  alternates: { canonical: "https://freshpick.lk/collections" },
};

export default async function CollectionsPage() {
  const collections = await listPublishedCollections(36);
  return (
    <main className="min-h-screen bg-background">
      <PremiumPageHeader title="Collections" subtitle="Food and ingredients selected for different occasions." />
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {collections.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {collections.map(collection => <FoodStoryCard key={collection.id} href={`/collections/${collection.slug}`} title={collection.title} image={collection.featuredImage?.url} description={collection.excerpt} label={collection.eyebrow} meta={`${collection.recipeCount} recipes · ${collection.productCount} products`} action="Browse collection" />)}
          </div>
        ) : (
          <div className="rounded-xl border border-border p-8 text-center">
            <h2 className="text-xl font-semibold">No collections yet</h2>
            <Link href="/recipes" className="mt-5 inline-block text-sm font-medium text-brand-green hover:underline">Browse recipes</Link>
          </div>
        )}
      </section>
    </main>
  );
}
