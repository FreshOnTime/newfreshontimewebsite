import HomeHelp from '@/components/home/HomeHelp';
import { publicPageMetadata } from '@/lib/publicPages';
import { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductErrorBoundary } from "@/components/products/ProductErrorBoundary";

import HeroSection from "@/components/home/HeroSection";
import CategoryBento from "@/components/home/CategoryBento";
import BrandStory from "@/components/home/BrandStory";
import { unstable_cache } from "next/cache";
import { loadStorefrontHome } from "@/lib/storefrontData";
import { listPublishedJournalEntries } from "@/lib/journalService";
import HomeJournal from "@/components/home/HomeJournal";

export const dynamic = "force-static";
export const revalidate = 300;

export const metadata: Metadata = publicPageMetadata('/');

const getHomeData = unstable_cache(loadStorefrontHome, ['storefront-home-db-v1'], {
  revalidate: 300,
  tags: ['products', 'categories'],
});

export default async function Home() {
  const [{ products, categories }, journal] = await Promise.all([
    getHomeData(),
    listPublishedJournalEntries().catch((error) => { console.error('[Homepage] Failed to load journal:', error); return []; }),
  ]);

  return (
    <div className="bg-background">
      <HeroSection />
      <CategoryBento categories={categories} />

      <section aria-labelledby="market-title" className="bg-background pb-14 md:pb-20">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="market-title" className="editorial-title">Fresh picks.</h2>
              <p className="mt-2 text-sm text-muted-foreground">Browse the current selection, then build a bag for your kitchen.</p>
            </div>
            <Link href="/products" className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-medium text-brand-green hover:underline">Shop all <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>

          <ProductErrorBoundary>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:gap-x-8 md:gap-y-14 lg:grid-cols-4">
                {products.slice(0, 8).map((product) => (
                  <div key={product.sku}>
                    <ProductCard
                      id={product._id?.toString() || ""}
                      sku={product.sku}
                      name={product.name}
                      image={product.image?.url || ""}
                      discountPercentage={product.discountPercentage || 0}
                      baseMeasurementQuantity={product.baseMeasurementQuantity}
                      pricePerBaseQuantity={product.pricePerBaseQuantity}
                      measurementType={product.measurementUnit as "g" | "kg" | "ml" | "l" | "ea" | "lb"}
                      isDiscreteItem={product.isSoldAsUnit}
                      variant="default"
                      isOutOfStock={product.isOutOfStock}
                      isBundle={product.isBundle}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card px-6 py-6 text-center">
                <p className="text-xl font-semibold text-brand-green">The market is being refreshed.</p>
                <Link href="/products" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-green">Browse all products <ArrowUpRight className="h-4 w-4" /></Link>
              </div>
            )}
          </ProductErrorBoundary>
        </div>
      </section>

      <BrandStory />
      <HomeJournal posts={journal} />
      <HomeHelp />
    </div>
  );
}
