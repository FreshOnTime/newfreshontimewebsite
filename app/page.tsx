import HomeHelp from '@/components/home/HomeHelp';
import HomeBasketFeature from '@/components/home/HomeBasketFeature';
import HomeMarketManifesto from '@/components/home/HomeMarketManifesto';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import { absoluteUrl } from '@/lib/config/site';
import { publicPageMetadata } from '@/lib/publicPages';
import { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductErrorBoundary } from "@/components/products/ProductErrorBoundary";

import HeroSection from "@/components/home/HeroSection";
import CategoryBento from "@/components/home/CategoryBento";
import BrandStory, { BusinessStory } from "@/components/home/BrandStory";
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
      <BreadcrumbJsonLd items={[{ name: "FreshPick", url: absoluteUrl("/") }]} />
      <HeroSection />
      <HomeMarketManifesto />
      <CategoryBento categories={categories} />

      <section aria-labelledby="market-title" className="bg-background pb-12 md:pb-20">
        <div className="editorial-wrap">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-brand-green-deep/20 pb-6">
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[.22em] text-brand-green">From the shelves</p>
              <h2 id="market-title" className="font-heading text-[clamp(2.15rem,4vw,4.2rem)] font-semibold uppercase leading-none tracking-[-.06em] text-brand-green-deep">Shop the market.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">Discover products from the currently available FreshPick catalogue.</p>
            </div>
            <Link href="/products" className="inline-flex min-h-11 shrink-0 items-center gap-2 border-b border-brand-green-deep text-xs font-bold uppercase tracking-[.1em] text-brand-green-deep">See all products <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>

          <ProductErrorBoundary>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
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
              <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center">
                <p className="text-xl font-semibold text-brand-green">The market is being refreshed.</p>
                <Link href="/products" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-green">Browse all products <ArrowUpRight className="h-4 w-4" /></Link>
              </div>
            )}
          </ProductErrorBoundary>
        </div>
      </section>

      <HomeBasketFeature />
      <BrandStory />
      <BusinessStory />
      <HomeJournal posts={journal} />
      <HomeHelp />
    </div>
  );
}
