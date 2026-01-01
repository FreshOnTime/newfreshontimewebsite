"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import ProductImage from "./ProductImage";
import AddToBagButton from "@/app/products/[id]/AddToBagButton";
import type { Product } from "@/models/product";

interface ProductCardProps {
  id: string; // Added Mongo ID
  sku: string;
  name: string;
  image: string;
  discountPercentage: number;
  baseMeasurementQuantity: number;
  pricePerBaseQuantity: number;
  measurementType: "g" | "kg" | "ml" | "l" | "ea" | "lb";
  isDiscreteItem: boolean;
}

const DISCOUNT_THRESHOLD = 0.01;

import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";

export function ProductCard({
  id,
  sku,
  name,
  image: imageUrl,
  discountPercentage = 0,
  baseMeasurementQuantity,
  pricePerBaseQuantity,
  measurementType,
  isDiscreteItem,
}: ProductCardProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const pricePerBaseQuantityWithDiscount = calculateDiscountedPrice(
    pricePerBaseQuantity,
    discountPercentage
  );

  const pricePerMeasurement = calculatePricePerMeasurement(
    pricePerBaseQuantityWithDiscount,
    baseMeasurementQuantity
  );

  const showDiscountBadge = discountPercentage > DISCOUNT_THRESHOLD;

  const productForWishlist: Product = {
    _id: id,
    sku,
    name,
    image: imageUrl
      ? { url: imageUrl, filename: '', contentType: '', path: imageUrl, alt: name }
      : { url: "/placeholder.svg", filename: '', contentType: '', path: "/placeholder.svg", alt: name },
    description: "",
    baseMeasurementQuantity,
    pricePerBaseQuantity: pricePerBaseQuantityWithDiscount,
    measurementType: measurementType as any,
    isSoldAsUnit: isDiscreteItem,
    minOrderQuantity: 1,
    maxOrderQuantity: 9999,
    stepQuantity: 1,
    stockQuantity: 0,
    isOutOfStock: false,
    totalSales: 0,
    lowStockThreshold: 0,
    unitOptions: [],
  } as unknown as Product;

  const isWishlisted = isInWishlist(id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(id);
    } else {
      addToWishlist(productForWishlist);
    }
  };

  const buildProductForBag = (): Product => ({
    sku,
    name,
    image: imageUrl
      ? { url: imageUrl, filename: '', contentType: '', path: imageUrl, alt: name }
      : { url: "/placeholder.svg", filename: '', contentType: '', path: "/placeholder.svg", alt: name },
    description: "",
    baseMeasurementQuantity,
    baseMeasurementUnit: measurementType, // Correcting property name based on model possibly? Model says measurementType. BagContext uses unit.
    // Let's stick to matching existing buildProductForBag structure but ensure we use correct props.
    pricePerBaseQuantity: pricePerBaseQuantityWithDiscount,
    measurementUnit: measurementType,
    isSoldAsUnit: isDiscreteItem,
    minOrderQuantity: 1,
    maxOrderQuantity: 9999,
    stepQuantity: 1,
    stockQuantity: 0,
    isOutOfStock: false,
    totalSales: 0,
    lowStockThreshold: 0,
    unitOptions: [],
  } as unknown as Product);

  return (
    <div className="w-full max-w-[300px] group relative">
      <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-premium transition-all duration-500 hover:shadow-premium-hover hover:-translate-y-1">
        {/* Image Container */}
        <div className="aspect-[3/4] relative p-8 bg-gradient-to-br from-zinc-50 to-white/50">
          <Link href={`/products/${sku}`} className="block h-full">
            <div className="relative h-full w-full transform transition-transform duration-700 ease-out group-hover:scale-105">
              <ProductImage src={imageUrl} alt={name} />
            </div>
          </Link>

          {/* Wishlist Button - Always visible but subtle */}
          <Button
            size="icon"
            variant="ghost"
            className={`absolute top-4 right-4 h-10 w-10 rounded-full transition-all duration-300 z-10 ${isWishlisted
              ? "bg-red-50 text-red-500"
              : "bg-white/80 text-zinc-400 hover:text-red-500 hover:bg-white backdrop-blur-md opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
              }`}
            onClick={handleWishlistClick}
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
          </Button>

          {/* Discount Badge */}
          {showDiscountBadge && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-zinc-900 text-white text-[10px] font-bold tracking-widest uppercase rounded-full">
              Save {discountPercentage}%
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6">
          <Link href={`/products/${sku}`} className="block group/title">
            <h3 className="font-serif text-xl text-zinc-900 mb-2 leading-tight group-hover/title:text-emerald-800 transition-colors line-clamp-2 min-h-[3rem]">
              {name}
            </h3>
          </Link>

          <div className="flex flex-col gap-4 mt-2">
            <PriceDisplay
              price={pricePerBaseQuantityWithDiscount}
              originalPrice={showDiscountBadge ? pricePerBaseQuantity : undefined}
              isDiscreteItem={isDiscreteItem}
              baseMeasurementQuantity={baseMeasurementQuantity}
              measurementType={measurementType}
            />

            <div className="pt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <AddToBagButton product={buildProductForBag()} quantity={1} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceDisplay({
  price,
  originalPrice,
  isDiscreteItem,
  baseMeasurementQuantity,
  measurementType,
}: {
  price: number;
  originalPrice?: number;
  isDiscreteItem: boolean;
  baseMeasurementQuantity: number;
  measurementType: string;
}) {
  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <p className="text-lg font-bold text-gray-900">
        Rs. {formatPrice(price)}
      </p>
      {originalPrice && (
        <p className="text-sm text-gray-400 line-through">
          Rs. {formatPrice(originalPrice)}
        </p>
      )}
      {!isDiscreteItem && (
        <span className="text-xs font-medium text-gray-400">
          /{baseMeasurementQuantity !== 1 && `${baseMeasurementQuantity}`}
          {measurementType}
        </span>
      )}
    </div>
  );
}

function calculateDiscountedPrice(
  basePrice: number,
  discountPercentage: number
): number {
  return basePrice - (basePrice * discountPercentage) / 100;
}

function calculatePricePerMeasurement(price: number, quantity: number): number {
  return price / quantity;
}

function formatPrice(price: number): string {
  return price.toFixed(2);
}
