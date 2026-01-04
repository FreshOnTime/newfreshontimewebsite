import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductGridSkeleton } from "@/components/products/ProductCardSkeleton";
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
import NewsletterForm from "@/components/home/NewsletterForm";
import TrustBadges from "@/components/home/TrustBadges";

import dbConnect from "@/lib/database";

// Use ISR (Incremental Static Regeneration) for fast loading
// Revalidate every 60 seconds to keep data fresh
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Fresh Pick | #1 Premium Online Grocery Delivery Sri Lanka",
  description: "Shop the finest fresh produce, meats, and pantry essentials in Sri Lanka. Same-day grocery delivery within Colombo & suburbs. Experience the 'Fresh Pick' difference today.",
  openGraph: {
    title: "Fresh Pick | #1 Premium Online Grocery Store Sri Lanka",
    description: "Your premium online grocery store in Colombo. Freshness guaranteed. Same-day delivery available.",
    type: "website",
    locale: "en_LK",
    url: "https://freshpick.lk",
    siteName: "Fresh Pick Sri Lanka",
  },
  alternates: {
    canonical: "https://freshpick.lk",
  },
};

// Server-side data fetching
async function getProducts(): Promise<Product[]> {
  try {
    await dbConnect();
    const EnhancedProduct = (await import("@/lib/models/EnhancedProduct")).default;
    const Category = (await import("@/lib/models/Category")).default;

    // Fetch products - removing archived filter to test
    console.log("[Homepage] Starting product fetch...");
    const rawProducts = await EnhancedProduct.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    console.log(`[Homepage] Fetched ${rawProducts.length} raw products`);
    if (rawProducts.length > 0) {
      console.log("[Homepage] First product:", JSON.stringify(rawProducts[0], null, 2));
    }

    // Get unique category IDs to fetch category details
    const categoryIds = [...new Set(rawProducts.map(p => p.categoryId))].filter(Boolean);
    const categories = await Category.find({ _id: { $in: categoryIds } }).lean();
    const categoryMap = new Map(categories.map(c => [String(c._id), c]));

    // Map EnhancedProduct to the structure expected by ProductCard
    // Using the same logic as app/products/page.tsx
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

      return ({
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
        measurementUnit: 'ea' as const, // Force text to literal type
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
      });
    });

    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

async function getCategories(): Promise<{ name: string; slug: string; imageUrl?: string; description?: string }[]> {
  try {
    await dbConnect();
    const CategoryModel = (await import("@/lib/models/Category")).default;
    const categories = await CategoryModel.find({}).lean();
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

const promoImages = [
  "/bannermaterial/1.png",
  "/bannermaterial/2.png",
  "/bannermaterial/3.png",
  "/bannermaterial/4.png",
];

export default async function Home() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const featuredProducts = products.slice(0, 20);

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
              {featuredProducts.map((product, index) => (
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