import { publicPageMetadata } from '@/lib/publicPages';

import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import type { Metadata } from "next";
import Link from "next/link";
import FoodStoryCard from "@/components/ui/FoodStoryCard";
import { listPublishedCollections } from "@/lib/collectionService";

export const revalidate = 60;

export const metadata: Metadata = publicPageMetadata('/collections');

export default async function CollectionsPage() {
  const collections = await listPublishedCollections(36);
  return (
    <div className="min-h-screen bg-background">
      <PremiumPageHeader title="Collections" subtitle="Food and ingredients selected for different occasions." />
      <section className="editorial-wrap editorial-section">
        {collections.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {collections.map(collection => <FoodStoryCard key={collection.id} href={`/collections/${collection.slug}`} title={collection.title} image={collection.featuredImage?.url} description={collection.excerpt} label={collection.eyebrow} meta={`${collection.productCount} products`} action="Browse collection" />)}
          </div>
        ) : (
          <div className="editorial-card p-10 text-center">
            <h2 className="text-xl font-normal">No collections yet</h2>
            <Link href="/products" className="mt-5 inline-block text-sm font-medium text-brand-green hover:underline">Browse the market</Link>
          </div>
        )}
      </section>
    </div>
  );
}
