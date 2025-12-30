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

import dbConnect from "@/lib/database";

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
async function getProducts() {
  try {
    await dbConnect();
    const EnhancedProduct = (await import("@/lib/models/EnhancedProduct")).default;
    const Category = (await import("@/lib/models/Category")).default;

    // Fetch products
    const rawProducts = await EnhancedProduct.find({ archived: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get unique category IDs to fetch category details
    const categoryIds = [...new Set(rawProducts.map(p => p.categoryId))].filter(Boolean);
    const categories = await Category.find({ _id: { $in: categoryIds } }).lean();
    const categoryMap = new Map(categories.map(c => [String(c._id), c]));

    // Map EnhancedProduct to the structure expected by ProductCard
    const products = rawProducts.map(product => {
      const img = product.image || (product.images && product.images[0]) || "/placeholder.svg";
      const cat = product.categoryId ? categoryMap.get(String(product.categoryId)) : null;

      return {
        _id: product._id,
        sku: product.sku,
        name: product.name,
        // Map image string to IImage structure if needed, or handle in component. 
        // ProductCard expects { url: string } for image.
        image: { url: img },
        discountPercentage: 0, // EnhancedProduct doesn't typically have this, default to 0
        baseMeasurementQuantity: 1, // Default
        pricePerBaseQuantity: product.price,
        measurementUnit: "ea", // Default or map if available
        isSoldAsUnit: true,
        description: product.description,
        isOutOfStock: (product.stockQty || 0) <= 0,
        stockQuantity: product.stockQty || 0,
        category: cat ? { name: cat.name, slug: cat.slug } : undefined,
      };
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

  const featuredProducts = products.slice(0, 10);
  const dealProducts = products.filter(
    (product) => product.discountPercentage && product.discountPercentage > 0
  );

  return (
    <div className="bg-white">
      {/* Hero Section - Client Island */}
      <HeroSection />

      {/* Infinite Marquee */}
      <InfiniteMarquee />

      {/* Promotional Carousel - Client Island */}
      <HomeCarousel images={promoImages} />

      {/* Lifestyle Banners */}
      <BannerGrid />

      {/* Categories Section */}
      <CategoryBento categories={categories} />

      {/* Hot Deals Section */}
      {dealProducts.length > 0 && (
        <section className="py-16 md:py-24 bg-gradient-to-b from-orange-50/50 to-white">
          <div className="container mx-auto px-4 md:px-8">
            <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-12">
              <div>
                <span className="text-orange-500 text-sm font-semibold tracking-wider uppercase mb-3 block">
                  Limited Time
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 tracking-tight">
                  Hot Deals
                </h2>
                <p className="text-base md:text-lg text-gray-500 max-w-md">
                  Don&apos;t miss these special offers on your favorite products
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="mt-4 md:mt-0 border-2 border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 rounded-full px-6 transition-all"
              >
                <Link href="/deals">
                  View All Deals
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </AnimatedSection>

            <ProductErrorBoundary>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {dealProducts.slice(0, 6).map((product, index) => (
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
      )}

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

      {/* Testimonials */}
      <Testimonials />

      {/* Guarantee CTA */}
      <GuaranteeCta />

      {/* Newsletter Section - Client Island */}
      <NewsletterForm />
    </div>
  );
}