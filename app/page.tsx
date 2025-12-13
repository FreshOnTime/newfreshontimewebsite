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
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

import BannerGrid from "@/components/home/BannerGrid";
import FeaturesStrip from "@/components/home/FeaturesStrip";
import InfiniteMarquee from "@/components/ui/infinite-marquee";
import CategoryBento from "@/components/home/CategoryBento";

import Testimonials from "@/components/home/Testimonials";
import GuaranteeCta from "@/components/home/GuaranteeCta";
import { useLocalStorageCache, CACHE_TTL } from "@/lib/hooks/useLocalStorageCache";

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
  // Cached products fetching
  const { data: productsData } = useLocalStorageCache<Product[]>(
    "home_products_v2",
    async () => {
      const response = await fetch("/api/products");
      if (!response.ok) return [];
      const data = await response.json();
      return data.data?.products || [];
    },
    { ttl: CACHE_TTL.MEDIUM } // 5 minutes
  );

  // Cached categories fetching
  const { data: categoriesData } = useLocalStorageCache<UiCategory[]>(
    "home_categories_v2",
    async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) return [];
      const json = await res.json();
      const items: unknown[] = Array.isArray(json?.data) ? json.data : [];
      return items
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
              description: cc.description ? String(cc.description) : undefined,
            };
          }
          return { name: "", slug: "" };
        })
        .filter((c) => c.name && c.slug);
    },
    { ttl: CACHE_TTL.LONG } // 15 minutes
  );

  // Derived data from cached products
  const featuredProducts = useMemo(
    () => (productsData || []).slice(0, 10),
    [productsData]
  );

  const dealProducts = useMemo(
    () =>
      (productsData || []).filter(
        (product: Product) =>
          product.discountPercentage && product.discountPercentage > 0
      ),
    [productsData]
  );

  const categories = categoriesData || [];

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

  // carousel removed; no slide state or controls needed

  return (
    <div className="bg-white">
      {/* Hero Section - Billion Dollar Aesthetic */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 z-0">
          <Image
            src="/bgs/landing-page-bg-1.jpg"
            alt="Fresh vegetables background"
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90"></div>
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
        </div>

        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-sm font-medium tracking-widest uppercase mb-6">
              The Future of Freshness
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif font-bold text-white mb-6 tracking-tight leading-[0.9]">
              Taste the <br />
              <span className="text-emerald-400 italic">Extraordinary</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Premium artisanal groceries, sourced from the world's finest growers, delivered to your doorstep within hours.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-10 py-7 text-lg font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]"
              >
                <Link href="/products">
                  Shop Experience
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10 px-10 py-7 text-lg font-medium rounded-full backdrop-blur-sm transition-all"
              >
                <Link href="/categories">View Collections</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
          <span className="text-xs tracking-widest uppercase">Scroll to Discover</span>
        </div>
      </section>

      {/* Infinite Marquee */}
      <InfiniteMarquee />

      {/* Trust Bar */}


      {/* Promotional carousel using bannermaterial images */}
      <section className="py-12 md:py-16 bg-gray-50/50">
        <div className="container mx-auto px-4 md:px-8">
          <div
            className="relative rounded-2xl overflow-hidden shadow-lg"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-full h-48 sm:h-64 md:h-[28rem] lg:h-[32rem] relative">
              {promoImages.map((src, i) => (
                <div
                  key={src}
                  className={`absolute inset-0 transition-opacity duration-700 ${i === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <Image src={src} alt={`Promo ${i + 1}`} fill className="object-cover" priority={i === 0} />
                </div>
              ))}
            </div>

            {/* Controls - Premium styled */}
            <div className="absolute inset-0 flex items-center justify-between px-4 md:px-6">
              <button onClick={prevPromo} aria-label="Previous" className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all">
                <ArrowRight className="w-5 h-5 rotate-180 text-gray-700" />
              </button>
              <button onClick={nextPromo} aria-label="Next" className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all">
                <ArrowRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Indicators - Premium styled */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {promoImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Show promo ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/70'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lifestyle Banners */}
      <BannerGrid />

      {/* Categories Section - Premium Bento Grid */}
      <CategoryBento categories={categories} />

      {/* Hot Deals Section - Premium redesign */}
      {dealProducts.length > 0 && (
        <section className="py-16 md:py-24 bg-gradient-to-b from-orange-50/50 to-white">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-12"
            >
              <div>
                <span className="text-orange-500 text-sm font-semibold tracking-wider uppercase mb-3 block">Limited Time</span>
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
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {dealProducts.slice(0, 6).map((product, index) => (
                <motion.div
                  key={product.sku}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <ProductCard
                    id={product._id || ''}
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
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section - Premium redesign */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-12"
          >
            <div>
              <span className="text-emerald-600 text-sm font-semibold tracking-wider uppercase mb-3 block">Trending Now</span>
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
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.sku}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <ProductCard
                  id={product._id || ''}
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props Strip */}
      <FeaturesStrip />



      {/* Testimonials */}
      <Testimonials />

      {/* Guarantee CTA */}
      <GuaranteeCta />

      {/* Newsletter Section - Premium redesign */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-4 md:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <span className="text-emerald-200 text-sm font-semibold tracking-wider uppercase mb-4 block">Stay Updated</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Get fresh deals in your inbox
            </h2>
            <p className="text-lg text-emerald-100 mb-8 max-w-lg mx-auto">
              Join over 10,000 happy customers who save with our weekly deals and recipes
            </p>

            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-5 py-4 rounded-full text-gray-900 text-base focus:outline-none focus:ring-4 focus:ring-white/30 bg-white shadow-lg"
                />
                <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all whitespace-nowrap">
                  Subscribe
                </Button>
              </div>

              <p className="text-sm text-emerald-200">
                No spam, unsubscribe at any time
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-emerald-500/30">
              <a
                href="mailto:hello@freshpick.lk"
                className="inline-flex items-center text-emerald-100 hover:text-white transition-colors group"
              >
                <div className="bg-white/10 rounded-full p-3 mr-3 group-hover:bg-white/20 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-base font-medium">hello@freshpick.lk</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}