import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductErrorBoundary } from "@/components/products/ProductErrorBoundary";
import { Product } from "@/models/product";

// Client Islands
import HeroSection from "@/components/home/HeroSection";
import HomeCarousel from "@/components/home/HomeCarousel";
import { AnimatedSection, AnimatedProductItem } from "@/components/home/AnimatedSection";
import BannerGrid from "@/components/home/BannerGrid";
import InfiniteMarquee from "@/components/ui/infinite-marquee";
import CategoryBento from "@/components/home/CategoryBento";
import GuaranteeCta from "@/components/home/GuaranteeCta";
import PrivateClientCTA from "@/components/home/PrivateClientCTA";
import TrustBadges from "@/components/home/TrustBadges";

import prisma from "@/lib/prisma";
import { serializeProductForUi } from "@/lib/productSerializer";

// Use ISR (Incremental Static Regeneration) for fast loading
// Revalidate every 60 seconds to keep data fresh
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Fresh Pick | Fresh Products & Recurring Orders - #1 in Sri Lanka",
  description: "The best place for fresh products and recurring orders in Sri Lanka. Get premium fresh produce delivered to your door with flexible weekly schedules. Same-day delivery available.",
  openGraph: {
    title: "Fresh Pick | Fresh Products & Recurring Orders Sri Lanka",
    description: "Your premium online grocery store in Colombo. Best fresh products and recurring grocery orders.",
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
          take: 20,
          include: { category: { select: { name: true, slug: true } } },
        }),
        prisma.category.findMany({
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          select: { id: true, name: true, slug: true, description: true, imageUrl: true },
        }),
      ]);

      const products = rawProducts.map(serializeProductForUi);
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

const promoImages = [
  "/bannermaterial/1.png",
  "/bannermaterial/2.png",
  "/bannermaterial/3.png",
  "/bannermaterial/4.png",
];

export default async function Home() {
  const { products, categories } = await getHomeData();

  return (
    <div className="bg-transparent">
      {/* Hero Section - Client Island */}
      <HeroSection />

      {/* Infinite Marquee */}
      <InfiniteMarquee />

      {/* Promotional Carousel - Client Island */}
      <HomeCarousel images={promoImages} />

      {/* Trust Badges */}
      <TrustBadges />



      {/* Lifestyle Banners */}
      <BannerGrid />

      {/* Categories Section */}
      <CategoryBento categories={categories} />

      {/* Featured Products Section */}
      <section className="py-24 md:py-32 bg-transparent">
        <div className="container mx-auto px-4 md:px-8">
          <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20">
            <div>
              <span className="text-amber-500 text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                Trending Now
              </span>
              <h2 className="text-4xl md:text-6xl font-heading font-medium mb-4 text-zinc-900 tracking-tight leading-[1.1]">
                Featured <span className="italic font-serif text-emerald-700">Selections</span>
              </h2>
              <p className="text-lg md:text-xl text-zinc-500 max-w-xl font-light leading-relaxed">
                Curated favorites, loved by our most discerning customers.
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



      {/* Guarantee CTA */}
      <GuaranteeCta />

      {/* Private Client Services CTA */}
      <PrivateClientCTA />
    </div>
  );
}
