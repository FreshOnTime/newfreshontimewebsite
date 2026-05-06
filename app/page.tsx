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

// Static model imports — avoids per-revalidation dynamic import overhead
import dbConnect from "@/lib/database";
import EnhancedProductModel from "@/lib/models/EnhancedProduct";
import CategoryModel from "@/lib/models/Category";

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

type CategoryDisplay = { _id: unknown; name: string; slug: string; imageUrl?: string; description?: string };

interface HomeData {
  products: Product[];
  categories: CategoryDisplay[];
}

const HOME_DATA_TIMEOUT_MS = 1200;

// Single consolidated data fetch: one dbConnect, two parallel queries, no redundant round-trips
async function getHomeData(): Promise<HomeData> {
  try {
    const homeDataPromise = (async (): Promise<HomeData> => {
      await dbConnect();

      // Fetch products and categories in parallel to minimise latency
      const [rawProducts, allCategories] = await Promise.all([
        EnhancedProductModel
          .find({ archived: { $ne: true } })
          .sort({ createdAt: -1 })
          .limit(20)
          // Select only the fields needed for the homepage product cards
          .select('_id sku name image images description categoryId price stockQty minStockLevel attributes createdAt updatedAt')
          .lean(),
        CategoryModel
          .find({ isActive: true })
          .sort({ sortOrder: 1, name: 1 })
          // Select only the fields needed for display (isActive/sortOrder used only for filter/sort)
          .select('_id name slug description imageUrl')
          .lean(),
      ]);

      // Build a category lookup map (reused for both product mapping and CategoryBento)
      const categoryMap = new Map(allCategories.map(c => [String(c._id), c]));

      // Map EnhancedProduct documents to the shape expected by ProductCard
      const products = rawProducts.map((product) => {
        const single = product.image;
        const first = Array.isArray(product.images) ? product.images[0] : undefined;
        const img = single || first || '/placeholder.svg';
        const attrs = (product.attributes ?? {}) as Record<string, unknown>;
        const maybeUnitOptions = (attrs as { unitOptions?: unknown }).unitOptions;
        const unitOptions = Array.isArray(maybeUnitOptions)
          ? maybeUnitOptions
            .map((opt) => {
              const o = opt as Partial<{ label: unknown; quantity: unknown; unit: unknown; price: unknown }>;
              const unit = typeof o.unit === 'string' && ['g', 'kg', 'ml', 'l', 'ea', 'lb'].includes(o.unit)
                ? (o.unit as 'g' | 'kg' | 'ml' | 'l' | 'ea' | 'lb')
                : undefined;
              const quantity = typeof o.quantity === 'number' && isFinite(o.quantity) && o.quantity > 0 ? o.quantity : undefined;
              const price = typeof o.price === 'number' && isFinite(o.price) && o.price >= 0 ? o.price : undefined;
              const label = typeof o.label === 'string' && o.label.trim().length > 0 ? o.label : undefined;
              if (!unit || !quantity || price === undefined) return null;
              return { label: label || `${quantity}${unit}`, quantity, unit, price };
            })
            .filter(Boolean) as Array<{ label: string; quantity: number; unit: 'g' | 'kg' | 'ml' | 'l' | 'ea' | 'lb'; price: number }>
          : undefined;
        const categoryIdValue = product.categoryId ? String(product.categoryId) : undefined;

        return {
          _id: product._id,
          sku: product.sku || String(product._id),
          name: product.name || '',
          image: { url: String(img), filename: '', contentType: '', path: String(img), alt: product.name || undefined },
          description: product.description || '',
          category: categoryIdValue
            ? (() => {
              const meta = categoryMap.get(categoryIdValue);
              return { id: categoryIdValue, name: meta?.name || '', slug: meta?.slug || '' };
            })()
            : undefined,
          baseMeasurementQuantity: 1,
          pricePerBaseQuantity: Number(product.price ?? 0),
          measurementUnit: 'ea' as const,
          isSoldAsUnit: true,
          minOrderQuantity: 1,
          maxOrderQuantity: 9999,
          stepQuantity: 1,
          stockQuantity: Number(product.stockQty ?? 0),
          isOutOfStock: Number(product.stockQty ?? 0) <= 0,
          totalSales: 0,
          isFeatured: false,
          discountPercentage: 0,
          lowStockThreshold: Number(product.minStockLevel ?? 0),
          createdAt: product.createdAt as unknown as Date | undefined,
          updatedAt: product.updatedAt as unknown as Date | undefined,
          unitOptions,
        };
      });

      return {
        products: JSON.parse(JSON.stringify(products)),
        categories: JSON.parse(JSON.stringify(allCategories)),
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
      <section className="py-24 md:py-32 bg-zinc-950">
        <div className="container mx-auto px-4 md:px-8">
          <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20">
            <div>
              <span className="text-emerald-400 text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                Trending Now
              </span>
              <h2 className="text-4xl md:text-6xl font-heading font-medium mb-4 text-white tracking-tight leading-[1.1]">
                Featured <span className="italic font-serif text-emerald-400">Selections</span>
              </h2>
              <p className="text-lg md:text-xl text-zinc-400 max-w-xl font-light leading-relaxed">
                Curated favorites, loved by our most discerning customers.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="mt-6 md:mt-0 border-white/20 text-white hover:bg-emerald-500 hover:text-zinc-950 hover:border-emerald-400 rounded-full px-8 py-6 text-sm font-medium tracking-wide transition-all"
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
