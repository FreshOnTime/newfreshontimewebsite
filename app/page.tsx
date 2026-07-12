import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductErrorBoundary } from "@/components/products/ProductErrorBoundary";
import { Product } from "@/models/product";

// Client Islands
import HeroSection from "@/components/home/HeroSection";
import { AnimatedSection, AnimatedProductItem } from "@/components/home/AnimatedSection";
import BannerGrid from "@/components/home/BannerGrid";
import LuxuryManifesto from "@/components/home/LuxuryManifesto";
import CategoryBento from "@/components/home/CategoryBento";
import TrustBadges from "@/components/home/TrustBadges";
import FreshPickPathways from "@/components/home/FreshPickPathways";

import prisma from "@/lib/prisma";
import { productCardSelect, serializeProductCardForUi } from "@/lib/productSerializer";

// Keep the landing page at the CDN. Product changes do not need to force a
// database-backed render for every visitor, and Netlify can regenerate this
// page in the background when its cache expires.
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

// Single consolidated data fetch: one dbConnect, two parallel queries, no redundant round-trips
async function getHomeData(): Promise<HomeData> {
  try {
    const homeDataPromise = (async (): Promise<HomeData> => {
      // Fetch products and categories in parallel to minimise latency
      const [rawProducts, allCategories] = await Promise.all([
        prisma.product.findMany({
          where: { archived: false },
          orderBy: { createdAt: 'desc' },
          // Two rows on wide screens is enough for the home page and keeps the
          // server payload, hydration work, and below-the-fold image queue small.
          take: 12,
          select: productCardSelect,
        }),
        prisma.category.findMany({
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          select: { id: true, name: true, slug: true, description: true, imageUrl: true },
        }),
      ]);

      const products = rawProducts.map(serializeProductCardForUi);
      const categories = allCategories.map((c) => ({
        _id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description ?? undefined,
        imageUrl: c.imageUrl ?? undefined,
      }));

      return {
        products: JSON.parse(JSON.stringify(products)),
        categories: JSON.parse(JSON.stringify(categories)),
      };
    })();

    const safeHomeDataPromise = homeDataPromise.catch((error) => {
      console.error("[Homepage] Failed to fetch home data:", error);
      return { products: [], categories: [] };
    });

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const timeoutPromise = new Promise<HomeData>((resolve) => {
      timeoutId = setTimeout(() => {
        console.warn(`[Homepage] Data fetch exceeded ${HOME_DATA_TIMEOUT_MS}ms. Rendering fast fallback.`);
        resolve({ products: [], categories: [] });
      }, HOME_DATA_TIMEOUT_MS);
    });

    try {
      return await Promise.race([safeHomeDataPromise, timeoutPromise]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("[Homepage] Failed to fetch home data:", error);
    return { products: [], categories: [] };
  }
}

export default async function Home() {
  const { products, categories } = await getHomeData();

  return (
    <div className="bg-transparent">
      {/* Hero Section - Client Island */}
      <HeroSection />

      {/* Editorial brand statement */}
      <LuxuryManifesto />

      {/* Trust Badges */}
      <TrustBadges />

      {/* FreshPick's four core shopping paths */}
      <FreshPickPathways />



      {/* Lifestyle Banners */}
      <BannerGrid />

      {/* Categories Section */}
      <CategoryBento categories={categories} />

      {/* Featured Products Section */}
      <section className="bg-[#ffffff] py-24 md:py-36">
        <div className="container mx-auto px-4 md:px-8">
          <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20">
            <div>
              <span className="mb-6 block text-[10px] font-bold uppercase tracking-[0.34em] text-black">
                Fresh Today
              </span>
              <h2 className="mb-5 font-serif text-5xl font-normal leading-[0.98] tracking-tight text-black md:text-7xl">
                Today&apos;s <span className="italic text-black">fresh picks.</span>
              </h2>
              <p className="max-w-xl text-lg font-light leading-relaxed text-zinc-700 md:text-xl">
                The latest FreshPick arrivals, selected for your next kitchen, table, or delivery day.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="mt-6 md:mt-0 border-zinc-200 text-zinc-900 hover:bg-zinc-900 hover:text-white rounded-full px-8 py-6 text-sm font-medium tracking-wide transition-all"
            >
              <Link href="/products">
                View All Products
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </AnimatedSection>

          <ProductErrorBoundary>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
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
                  />
                </AnimatedProductItem>
              ))}
            </div>
          </ProductErrorBoundary>
        </div>
      </section>
    </div>
  );
}
