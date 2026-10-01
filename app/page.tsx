import { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductErrorBoundary } from "@/components/products/ProductErrorBoundary";
import { Product } from "@/models/product";

import HeroSection from "@/components/home/HeroSection";
import { AnimatedSection, AnimatedProductItem } from "@/components/home/AnimatedSection";
import CategoryBento from "@/components/home/CategoryBento";
import FoodDiscovery from "@/components/home/FoodDiscovery";
import CreatorNetwork from "@/components/home/CreatorNetwork";
import LuxuryManifesto from "@/components/home/LuxuryManifesto";
import { serverApiFetch } from "@/lib/api/server";

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
  const { products, categories } = await getHomeData();

  return (
    <main className="overflow-hidden bg-background">
      <HeroSection />
      <CategoryBento categories={categories} />

      <section className="bg-background py-10 md:py-14">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <AnimatedSection className="mb-7 flex flex-wrap items-end justify-between gap-5">
            <div>
              <span className="mb-2 block text-sm font-medium text-brand-green">The market</span>
              <h2 className="font-heading text-3xl font-semibold leading-tight text-brand-green md:text-4xl">
                Fresh from the market
              </h2>
            </div>
            <div className="md:justify-self-end">
              <p className="max-w-lg text-base leading-7 text-muted-foreground">
                Fresh produce and everyday essentials for your kitchen.
              </p>
              <Link href="/products" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:underline">
                Shop the market <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </AnimatedSection>

          <ProductErrorBoundary>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
                {products.map((product, index) => (
                  <AnimatedProductItem key={product.sku} index={index}>
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
                      priority={index < 2}
                    />
                  </AnimatedProductItem>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
                <p className="font-serif text-2xl text-zinc-900">The market is being refreshed.</p>
                <Link href="/products" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-800">Browse all products <ArrowUpRight className="h-4 w-4" /></Link>
              </div>
            )}
          </ProductErrorBoundary>
        </div>
      </section>

      <FoodDiscovery />
      <CreatorNetwork />
      <LuxuryManifesto />
    </main>
  );
}
