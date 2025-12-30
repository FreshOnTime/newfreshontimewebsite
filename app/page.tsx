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
import FeaturesStrip from "@/components/home/FeaturesStrip";
import InfiniteMarquee from "@/components/ui/infinite-marquee";
import CategoryBento from "@/components/home/CategoryBento";
import Testimonials from "@/components/home/Testimonials";
import GuaranteeCta from "@/components/home/GuaranteeCta";
import NewsletterForm from "@/components/home/NewsletterForm";
import TrustBadges from "@/components/home/TrustBadges";
import WhyChooseUs from "@/components/home/WhyChooseUs";

import dbConnect from "@/lib/database";

// Force runtime rendering - fetch data on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Fresh Pick | Premium Online Grocery Delivery in Colombo",
  description: "Experience the freshest groceries delivered to your door in Colombo. Shop premium produce, dairy, meats, and pantry staples with same-day delivery.",
  openGraph: {
    title: "Fresh Pick | Pick Fresh, Live Easy",
    description: "Your premium online grocery store in Colombo. Freshness guaranteed.",
    type: "website",
  },
};

// Server-side data fetching
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
    <div className="bg-white">
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
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-12">
            <div>
              <span className="text-emerald-600 text-sm font-semibold tracking-wider uppercase mb-3 block">
                Trending Now
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 tracking-tight">
                Featured Products
              </h2>
              <p className="text-base md:text-lg text-gray-500 max-w-md">
                Our most popular items this week, loved by customers
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="mt-4 md:mt-0 border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 rounded-full px-6 transition-all"
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

      {/* Value Props Strip */}
      <FeaturesStrip />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Testimonials */}
      <Testimonials />

      {/* Guarantee CTA */}
      <GuaranteeCta />

      {/* Newsletter Section - Client Island */}
      <NewsletterForm />
    </div>
  );
}