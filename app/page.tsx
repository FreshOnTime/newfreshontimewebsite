"use client";

import { Anton } from "next/font/google";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Mail,
  Cake,
  CupSoda,
  Milk,
  Apple,
  Snowflake,
  Beef,
  Archive,
  Candy,
  ShoppingBasket,
  Drumstick,
  Carrot,
  IceCream2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/products/ProductCard";
import { Product } from "@/models/product";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import TrustBar from "@/components/home/TrustBar";
import BannerGrid from "@/components/home/BannerGrid";
import FeaturesStrip from "@/components/home/FeaturesStrip";
import BrandsStrip from "@/components/home/BrandsStrip";
import Testimonials from "@/components/home/Testimonials";
import GuaranteeCta from "@/components/home/GuaranteeCta";

const antonFont = Anton({
  weight: "400",
  subsets: ["latin"],
});

const categoryIcons: Record<string, React.ElementType> = {
  bakery: Cake,
  beverages: CupSoda,
  dairy: Milk,
  "dairy-eggs": Milk,
  produce: Apple,
  "fresh-produce": Carrot,
  frozen: Snowflake,
  "frozen-foods": IceCream2,
  meat: Beef,
  "meat-poultry": Drumstick,
  "meat-seafood": Drumstick,
  pantry: Archive,
  "pantry-staples": Package,
  snacks: Candy,
};

type UiCategory = { name: string; slug: string; imageUrl?: string; description?: string };

export default function Home() {
  // carousel removed; showing static promotional images instead
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<UiCategory[]>([]);

  const promoImages = [
    "/bannermaterial/1.png",
    "/bannermaterial/2.png",
    "/bannermaterial/3.png",
    "/bannermaterial/4.png",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % promoImages.length);
    }, 4000);
    return () => clearInterval(t);
  }, [isPaused, promoImages.length]);

  const prevPromo = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + promoImages.length) % promoImages.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 2000);
  }, [promoImages.length]);

  const nextPromo = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % promoImages.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 2000);
  }, [promoImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevPromo();
      if (e.key === 'ArrowRight') nextPromo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prevPromo, nextPromo]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current == null || touchCurrentX.current == null) return;
    const dx = touchCurrentX.current - touchStartX.current;
    const threshold = 50; // px to qualify as swipe
    if (dx > threshold) {
      // swiped right -> previous
      prevPromo();
    } else if (dx < -threshold) {
      // swiped left -> next
      nextPromo();
    }
    touchStartX.current = null;
    touchCurrentX.current = null;
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          const allProducts: Product[] = data.data?.products || [];

          setFeaturedProducts(allProducts.slice(0, 10));
          setDealProducts(
            allProducts.filter(
              (product: Product) =>
                product.discountPercentage && product.discountPercentage > 0
            )
          );
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    let ignore = false;
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) return;
        const json = await res.json();
        const items: unknown[] = Array.isArray(json?.data) ? json.data : [];
        const mapped: UiCategory[] = items
          .map((c) => {
            if (typeof c === "object" && c && "name" in c && "slug" in c) {
              const cc = c as {
                name?: unknown;
                slug?: unknown;
                imageUrl?: unknown;
                description?: unknown;
              };
              return {
                name: String(cc.name ?? ""),
                slug: String(cc.slug ?? ""),
                imageUrl: cc.imageUrl ? String(cc.imageUrl) : undefined,
                description: cc.description
                  ? String(cc.description)
                  : undefined,
              };
            }
            return { name: "", slug: "" };
          })
          .filter((c) => c.name && c.slug);
        if (!ignore) setCategories(mapped);
      } catch {
        // non-fatal for homepage
      }
    }
    fetchCategories();
    return () => {
      ignore = true;
    };
  }, []);

  // carousel removed; no slide state or controls needed

  return (
    <div>
      {/* Hero Section */}
  <section className="relative min-h-[60vh] md:min-h-[90vh] lg:min-h-[120vh] flex items-center justify-center overflow-hidden py-8 md:py-12">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/bgs/landing-page-bg-1.jpg"
            alt="Fresh vegetables background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20"></div>
        </div>

        {/* decorative soft color blobs for depth */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-orange-500/10 blur-3xl pointer-events-none -z-0" />
        <div className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-yellow-400/6 blur-3xl pointer-events-none -z-0" />

        <div className="container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center">
              <span className="inline-block bg-white/10 text-white/90 px-3 py-1 rounded-full mb-4 text-sm uppercase tracking-wider">Fresh & Local</span>
            </div>

            <motion.h1
              className={`${antonFont.className} text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-300 bg-clip-text text-transparent drop-shadow-lg`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Fresh Pick
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              The freshest groceries delivered to your door.
              <br />
              <span className="text-orange-200">
                Quality you can trust, convenience you&apos;ll love.
              </span>
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg backdrop-blur-sm border-0 w-full sm:w-auto"
              >
                <Link href="/categories">View Categories</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <TrustBar />

          {/* Promotional carousel using bannermaterial images */}
          <section className="py-10 bg-gray-50">
            <div className="container mx-auto px-4">
              <div
                className="relative rounded-2xl overflow-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="w-full h-56 sm:h-72 md:h-[32rem] lg:h-[40rem] relative">
                  {promoImages.map((src, i) => (
                    <div
                      key={src}
                      className={`absolute inset-0 transition-opacity duration-700 ${i === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                      <Image src={src} alt={`Promo ${i+1}`} fill className="object-cover" priority={i===0} />
                    </div>
                  ))}
                </div>

                {/* Controls */}
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <button onClick={prevPromo} aria-label="Previous" className="bg-white/80 p-2 rounded-full shadow hover:bg-white">
                    <ArrowRight className="w-5 h-5 rotate-180 text-gray-800" />
                  </button>
                  <button onClick={nextPromo} aria-label="Next" className="bg-white/80 p-2 rounded-full shadow hover:bg-white">
                    <ArrowRight className="w-5 h-5 text-gray-800" />
                  </button>
                </div>

                {/* Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {promoImages.map((_, i) => (
                    <button key={i} onClick={() => setCurrentIndex(i)} aria-label={`Show promo ${i+1}`} className={`w-3 h-3 rounded-full ${i===currentIndex ? 'bg-white' : 'bg-white/60'}`} />
                  ))}
                </div>
              </div>
            </div>
          </section>

      {/* Lifestyle Banners */}
      <BannerGrid />

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-gray-900">
              Shop by Category
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Discover fresh products in every category, carefully selected for
              quality and freshness
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => {
              const Icon =
                categoryIcons[category.slug?.toLowerCase()] || ShoppingBasket;
              return (
                <motion.div
                  key={category.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Link href={`/categories/${category.slug}`}>
                    <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 shadow-md overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative h-48 overflow-hidden flex items-center justify-center bg-gradient-to-t from-white to-gray-50">
                          {/* icon (if available) or fallback to image */}
                          <div className="absolute inset-0 group-hover:opacity-80 transition-opacity duration-300">
                            {category.imageUrl ? (
                              <Image
                                src={category.imageUrl}
                                alt={category.name}
                                fill
                                className="object-cover"
                              />
                            ) : null}
                            <div className="absolute inset-0 bg-black/8" />
                          </div>

                          <div className="relative z-10 flex flex-col items-center text-center px-4">
                            {/* try to show a small circular icon from /category-icons */}
                            <div className="w-20 h-20 rounded-full bg-white p-3 flex items-center justify-center mb-3 shadow">
                              <Icon className="w-10 h-10 text-gray-700" />
                            </div>

                            <h3 className="font-bold text-lg mb-1 text-gray-900">
                              {category.name}
                            </h3>
                            {category.description && (
                              <p className="text-sm opacity-90 text-center px-2 text-gray-600">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
            {categories.length === 0 && (
              <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-6 text-center text-gray-500">
                No categories yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Hot Deals Section */}
      {dealProducts.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between mb-16"
            >
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                  🔥 Hot Deals
                </h2>
                <p className="text-xl text-gray-600 max-w-lg">
                  Limited time offers you don&apos;t want to miss. Save big on
                  your favorite products!
                </p>
              </div>
              <Button
                variant="outline"
                className="hidden md:flex border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
              >
                View All Deals
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {dealProducts.map((product, index) => (
                <motion.div
                  key={product.sku}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="transform group-hover:scale-105 transition-transform duration-300">
                    <ProductCard
                      sku={product.sku}
                      name={product.name}
                      image={product.image.url}
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
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-16"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Featured Products
              </h2>
              <p className="text-xl text-gray-600 max-w-lg">
                Our most popular items this week, loved by customers just like
                you
              </p>
            </div>
            <Button
              variant="outline"
              className="hidden md:flex border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
            >
              View All Products
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.sku}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="transform group-hover:scale-105 transition-transform duration-300">
                  <ProductCard
                    sku={product.sku}
                    name={product.name}
                    image={product.image.url}
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
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props Strip */}
      <FeaturesStrip />

      {/* Brands */}
      <BrandsStrip />

      {/* Testimonials */}
      <Testimonials />

      {/* Guarantee CTA */}
      <GuaranteeCta />

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-green-800/90"></div>
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Stay Fresh with Our Updates
            </h2>
            <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto">
              Get the latest deals, seasonal recipes, and fresh produce updates
              delivered to your inbox
            </p>

            <div className="max-w-md mx-auto">
              <div className="flex gap-4 mb-8">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30"
                />
                <Button className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 font-semibold text-lg shadow-lg hover:shadow-xl transition-all">
                  Subscribe
                </Button>
              </div>

              <p className="text-sm opacity-75 mb-8">
                Join over 10,000 happy customers who save with our weekly deals
              </p>
            </div>

            <div className="flex justify-center">
              <a
                href="mailto:hello@freshpick.lk"
                className="flex items-center text-white/90 hover:text-white transition-colors group"
              >
                <div className="bg-white/20 rounded-full p-3 mr-3 group-hover:bg-white/30 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-lg">hello@freshpick.lk</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}