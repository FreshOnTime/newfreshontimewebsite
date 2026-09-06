import { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductErrorBoundary } from "@/components/products/ProductErrorBoundary";
import { Product } from "@/models/product";

import HeroSection from "@/components/home/HeroSection";
import { AnimatedSection, AnimatedProductItem } from "@/components/home/AnimatedSection";
import BannerGrid from "@/components/home/BannerGrid";
import LuxuryManifesto from "@/components/home/LuxuryManifesto";
import CategoryBento from "@/components/home/CategoryBento";
import TrustBadges from "@/components/home/TrustBadges";
import FreshPickPathways from "@/components/home/FreshPickPathways";
import { serverApiFetch } from "@/lib/api/server";

export const dynamic = "force-static";
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Fresh Groceries, Ready Meals & Recurring Delivery in Colombo",
  description: "FreshPick brings fresh groceries, homemade favourites, cooked meals, and flexible recurring deliveries to homes and businesses across Colombo, Sri Lanka.",
  keywords: [
    "fresh grocery delivery Colombo",
    "cooked food delivery Colombo",
    "recurring grocery delivery Sri Lanka",
    "homemade food Colombo",
    "online groceries Sri Lanka",
  ],
  openGraph: {
    title: "FreshPick | Groceries, Ready Meals & Recurring Delivery in Colombo",
    description: "Fresh groceries, homemade favourites, cooked meals, and flexible recurring delivery from one FreshPick basket.",
    type: "website",
    locale: "en_LK",
    url: "https://freshpick.lk",
    siteName: "Fresh Pick Sri Lanka",
  },
  alternates: {
    canonical: "https://freshpick.lk",
  },
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
      if (!response.ok) {
        throw new Error(`Homepage API returned HTTP ${response.status}`);
      }
      return response.json() as Promise<HomeData>;
    })
    .catch((error) => {
      console.error("[Homepage] Failed to fetch home data:", error);
      return { products: [], categories: [] };
    });

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeout = new Promise<HomeData>((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(`[Homepage] Data fetch exceeded ${HOME_DATA_TIMEOUT_MS}ms. Rendering fast fallback.`);
      resolve({ products: [], categories: [] });
    }, HOME_DATA_TIMEOUT_MS);
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
    <main className="overflow-hidden bg-white">
      <HeroSection />
      <TrustBadges />

      <section className="bg-[#f6f7f4] py-24 md:py-32">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <AnimatedSection className="mb-12 grid gap-7 md:mb-16 md:grid-cols-[1fr_0.72fr] md:items-end">
            <div>
              <span className="mb-5 block text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-700">
                Fresh today
              </span>
              <h2 className="text-balance font-serif text-5xl font-normal leading-[0.94] tracking-tight text-zinc-950 md:text-7xl">
                Start with what looks <span className="italic text-emerald-900">good.</span>
              </h2>
            </div>
            <div className="md:justify-self-end">
              <p className="max-w-lg text-base font-light leading-7 text-zinc-600">
                New arrivals and everyday favourites chosen for your next kitchen, table, or delivery day.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-950 transition-colors hover:text-emerald-700"
              >
                Shop the full collection <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </AnimatedSection>

          <ProductErrorBoundary>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-6">
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
                      measurementType={
                        product.measurementUnit as
                        | "g"
                        | "kg"
                        | "ml"
                        | "l"
                        | "ea"
                        | "lb"
                      }
                      isDiscreteItem={product.isSoldAsUnit}
                      priority={index < 2}
                    />
                  </AnimatedProductItem>
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-zinc-200 bg-white px-6 py-16 text-center">
                <p className="font-serif text-2xl text-zinc-900">The fresh shelf is being updated.</p>
                <Link href="/products" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-800">
                  Browse all products <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </ProductErrorBoundary>
        </div>
      </section>

      <FreshPickPathways />
      <CategoryBento categories={categories} />
      <BannerGrid />
      <LuxuryManifesto />
    </main>
  );
}
