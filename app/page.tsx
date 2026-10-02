import { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductErrorBoundary } from "@/components/products/ProductErrorBoundary";
import { Product } from "@/models/product";

import HeroSection from "@/components/home/HeroSection";
import CategoryBento from "@/components/home/CategoryBento";
import MarketDiscovery from "@/components/home/MarketDiscovery";
import CreatorNetwork from "@/components/home/CreatorNetwork";
import ShopFeatures from "@/components/home/ShopFeatures";
import BrandStory, { BusinessStory } from "@/components/home/BrandStory";
import { serverApiFetch } from "@/lib/api/server";
import { listPublishedRecipes } from "@/lib/recipeService";
import { listCreators } from "@/lib/creatorService";
import { listPublishedJournalEntries } from "@/lib/journalService";
import HomeJournal from "@/components/home/HomeJournal";

export const dynamic = "force-static";
export const revalidate = 300;

export const metadata: Metadata = {
  title: "FreshPick | Fresh Groceries & Local Food in Sri Lanka",
  description: "Discover recipes, fresh groceries, ready meals and independent Sri Lankan makers for everyday cooking in Colombo.",
  keywords: [
    "food discovery Colombo",
    "smart grocery Sri Lanka",
    "fresh grocery delivery Colombo",
    "shoppable recipes Sri Lanka",
    "recurring grocery delivery Sri Lanka",
    "homemade food Colombo",
    "online groceries Sri Lanka",
  ],
  openGraph: {
    title: "FreshPick | Discover what to eat. Get everything to make it.",
    description: "Fresh groceries, recipes, ready meals and local makers in Sri Lanka.",
    type: "website",
    locale: "en_LK",
    url: "https://freshpick.lk",
    siteName: "Fresh Pick Sri Lanka",
  },
  alternates: { canonical: "https://freshpick.lk" },
};

type CategoryDisplay = { _id: string; name: string; slug: string; imageUrl?: string; description?: string };

interface HomeData {
  products: Product[];
  categories: CategoryDisplay[];
}

const HOME_DATA_TIMEOUT_MS = 1200;

async function getHomeData(): Promise<HomeData> {
  const request = serverApiFetch('/api/storefront/home', {
    next: { revalidate: 300, tags: ['products', 'categories'] },
  } as RequestInit & { next: { revalidate: number; tags: string[] } })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Homepage API returned HTTP ${response.status}`);
      return response.json() as Promise<HomeData>;
    })
    .catch((error) => {
      console.error("[Homepage] Failed to fetch home data:", error);
      return { products: [], categories: [] };
    });

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeout = new Promise<HomeData>((resolve) => {
    timeoutId = setTimeout(() => resolve({ products: [], categories: [] }), HOME_DATA_TIMEOUT_MS);
  });

  try {
    return await Promise.race([request, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export default async function Home() {
  const [{ products, categories }, recipes, creators, journal] = await Promise.all([
    getHomeData(),
    listPublishedRecipes(3).catch(() => []),
    listCreators(4).catch(() => []),
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
              <p className="mt-2 text-sm text-muted-foreground">Our current selection. Choose something good to cook with.</p>
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
      <ShopFeatures />
      <MarketDiscovery recipes={recipes} />
      <CreatorNetwork creators={creators} />
      <HomeJournal posts={journal} />
      <BusinessStory />
    </div>
  );
}
