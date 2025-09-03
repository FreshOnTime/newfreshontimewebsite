"use client";

import { Anton } from "next/font/google";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/products/ProductCard";
import { Product } from "@/models/product";
import Link from "next/link";
import { useState, useEffect } from "react";
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

type UiCategory = { name: string; slug: string; imageUrl?: string; description?: string };

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<UiCategory[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          const allProducts: Product[] = data.data?.products || [];
          
          setFeaturedProducts(allProducts.slice(0, 10));
          setDealProducts(allProducts.filter((product: Product) => product.discountPercentage && product.discountPercentage > 0));
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    let ignore = false;
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) return;
        const json = await res.json();
        const items: unknown[] = Array.isArray(json?.data) ? json.data : [];
        const mapped: UiCategory[] = items
          .map((c) => {
            if (typeof c === 'object' && c && 'name' in c && 'slug' in c) {
              const cc = c as { name?: unknown; slug?: unknown; imageUrl?: unknown; description?: unknown };
              return {
                name: String(cc.name ?? ''),
                slug: String(cc.slug ?? ''),
                imageUrl: cc.imageUrl ? String(cc.imageUrl) : undefined,
                description: cc.description ? String(cc.description) : undefined,
              };
            }
            return { name: '', slug: '' };
          })
          .filter((c) => c.name && c.slug);
        if (!ignore) setCategories(mapped);
      } catch {
        // non-fatal for homepage
      }
    }
    fetchCategories();
    return () => { ignore = true; };
  }, []);

  // Carousel data
  const carouselSlides = [
    {
      id: 1,
      title: "Sign up for FreshPass perks:",
      features: [
        "Unlimited free delivery",
        "Timeslot reservations",
        "Exclusive offers"
      ],
      buttonText: "Learn more",
      buttonColor: "bg-orange-500 hover:bg-orange-600",
      gradient: "from-blue-100 to-green-50",
      textColor: "text-green-600",
      badge: "freshpick"
    },
    {
      id: 2,
      title: "100% Organic & Fresh",
      features: [
        "Farm to table",
        "Pesticide-free",
        "Quality guaranteed"
      ],
      buttonText: "Shop Organic",
      buttonColor: "bg-green-600 hover:bg-green-700",
      gradient: "from-green-100 to-teal-50",
      textColor: "text-green-700",
      badge: "🌱 Organic"
    },
    {
      id: 3,
      title: "Weekly Super Deals",
      features: [
        "Up to 50% off",
        "New deals weekly",
        "Limited time only"
      ],
      buttonText: "View Deals",
      buttonColor: "bg-purple-500 hover:bg-purple-600",
      gradient: "from-purple-100 to-pink-50",
      textColor: "text-purple-600",
      badge: "🏷️ 50% OFF"
    },
    {
      id: 4,
      title: "Local Sri Lankan Specialties",
      features: [
        "Traditional foods",
        "Local spices",
        "Authentic flavors"
      ],
      buttonText: "Explore Local",
      buttonColor: "bg-yellow-500 hover:bg-yellow-600",
      gradient: "from-yellow-100 to-orange-50",
      textColor: "text-yellow-600",
      badge: "🇱🇰 Local"
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
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
        
        <div className="container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className={`${antonFont.className} text-6xl md:text-8xl font-bold mb-6`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Fresh Pick
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              The freshest groceries delivered to your door.<br />
              <span className="text-green-300">Quality you can trust, convenience you&apos;ll love.</span>
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg backdrop-blur-sm border-0">
                <Link href="/categories">View Categories</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <TrustBar />

      {/* Promotional Carousel Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-2xl shadow-lg"
          >
            {/* Carousel Slides Container */}
            <div className="relative">
              {carouselSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`${
                    index === currentSlide ? 'block' : 'hidden'
                  } flex items-center justify-between p-8 md:p-12 min-h-[300px] bg-gradient-to-r ${slide.gradient} transition-all duration-500`}
                >
                  <div className="flex-1 max-w-2xl">
                    <motion.h2
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={`text-3xl md:text-5xl font-bold ${slide.textColor} mb-6`}
                    >
                      {slide.title}
                    </motion.h2>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 text-lg md:text-xl text-gray-700 mb-8"
                    >
                      {slide.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center">
                          <span className={`${slide.textColor} mr-2`}>
                            {featureIndex === 0 ? '〈' : '〉'}
                          </span>
                          <span className="font-semibold">{feature}</span>
                        </div>
                      ))}
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    >
                      <Button className={`${slide.buttonColor} text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all`}>
                        {slide.buttonText}
                      </Button>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="hidden md:block flex-shrink-0 ml-8"
                  >
                    <div className="relative w-80 h-60">
                      <Image
                        src="/bgs/landing-page-bg-1.jpg"
                        alt={`${slide.title} illustration`}
                        fill
                        className="object-contain"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md">
                        <span className={`${slide.textColor} font-bold text-xl`}>{slide.badge}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Carousel Navigation Dots */}
            <div className="flex justify-center space-x-2 pb-6">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
              <div className="w-8 h-3 rounded-full bg-gray-300 flex items-center justify-center">
                <div className="w-1 h-1 bg-gray-500 rounded-full mx-0.5"></div>
                <div className="w-1 h-1 bg-gray-500 rounded-full mx-0.5"></div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-md transition-all"
            >
              <ArrowRight className="w-5 h-5 text-gray-600 rotate-180" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-md transition-all"
            >
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </button>
          </motion.div>
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
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Shop by Category</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover fresh products in every category, carefully selected for quality and freshness
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link href={`/categories/${category.slug}`}>
                  <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 shadow-md overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={category.imageUrl || "/bgs/landing-page-bg-1.jpg"}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/70 transition-colors duration-300"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mb-3 group-hover:bg-white/30 transition-colors duration-300" />
                          <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm opacity-90 text-center px-2">{category.description}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
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
                  Limited time offers you don&apos;t want to miss. Save big on your favorite products!
                </p>
              </div>
              <Button variant="outline" className="hidden md:flex border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white">
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
                      measurementType={product.measurementUnit as "g" | "kg" | "ml" | "l" | "ea" | "lb"}
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
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Featured Products</h2>
              <p className="text-xl text-gray-600 max-w-lg">
                Our most popular items this week, loved by customers just like you
              </p>
            </div>
            <Button variant="outline" className="hidden md:flex border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white">
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
                    measurementType={product.measurementUnit as "g" | "kg" | "ml" | "l" | "ea" | "lb"}
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
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Stay Fresh with Our Updates</h2>
            <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto">
              Get the latest deals, seasonal recipes, and fresh produce updates delivered to your inbox
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
