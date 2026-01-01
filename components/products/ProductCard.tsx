"use client";

import React from "react";
import Link from "next/link";
import ProductImage from "./ProductImage";
import AddToBagButton from "@/app/products/[id]/AddToBagButton";
import type { Product } from "@/models/product";
import { Heart, Plus } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    baseMeasurementUnit: measurementType,
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
    <div className="w-full group">
      {/* Editorial aesthetic: Image takes focus, minimal container */}
      <div className="relative mb-4 overflow-hidden">
        {/* Wishlist Button - Minimal absolute positioning */}
        <button
          onClick={handleWishlistClick}
          className={cn(
            "absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
            isWishlisted ? "bg-red-50 text-red-500" : "bg-white/80 text-zinc-400 opacity-0 group-hover:opacity-100 backdrop-blur-sm hover:text-red-500"
          )}
        >
          <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
        </button>

        {/* Discount Badge - Top Left */}
        {showDiscountBadge && (
          <span className="absolute top-3 left-3 z-20 bg-zinc-900 text-white text-[10px] font-medium tracking-[0.2em] px-2 py-1 uppercase">
            Save {discountPercentage}%
          </span>
        )}


        <Link href={`/products/${sku}`} className="block relative aspect-square bg-[#fafaf9] overflow-hidden">
          <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
            <ProductImage src={imageUrl} alt={name} />
          </div>
          {/* Dark overlay on hover for premium feel */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Quick Add Button - Appears on hover, sliding up */}
          <div className="absolute bottom-4 left-4 right-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20 hidden md:block">
            <div className="bg-white/95 backdrop-blur-md shadow-premium rounded-none p-1 flex justify-center border border-zinc-100">
              {/* Reusing existing button but wrapping it to fit our new layout */}
              <div onClick={(e) => e.stopPropagation()}>
                <AddToBagButton product={buildProductForBag()} quantity={1} />
              </div>
            </div>
          </div>
        </Link>

        {/* Mobile Quick Add (Optional: could be always visible or different interaction) */}
        <div className="absolute bottom-2 right-2 md:hidden z-20">
          <div className="bg-white rounded-full shadow-lg p-2 border border-zinc-100" onClick={(e) => e.stopPropagation()}>
            <AddToBagButton product={buildProductForBag()} quantity={1} />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center text-center space-y-1">
        <Link href={`/products/${sku}`} className="group/title">
          <h3 className="font-heading font-medium text-lg leading-tight text-zinc-900 group-hover/title:text-emerald-800 transition-colors line-clamp-1">
            {name}
          </h3>
        </Link>

        <div className="text-sm font-light text-zinc-500">
          {!isDiscreteItem && (
            <span>
              {baseMeasurementQuantity !== 1 && `${baseMeasurementQuantity}`} {(measurementType || 'g').toLowerCase()}
            </span>
          )}
          {isDiscreteItem && <span>Each</span>}
        </div>

        <div className="mt-1">
          <PriceDisplay
            price={pricePerBaseQuantityWithDiscount}
            originalPrice={showDiscountBadge ? pricePerBaseQuantity : undefined}
          />
        </div>
      </div>
    </div>
  );
}

function PriceDisplay({
  price,
  originalPrice,
}: {
  price: number;
  originalPrice?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-zinc-900 font-medium tracking-wide">
        Rs. {formatPrice(price)}
      </span>
      {originalPrice && (
        <span className="text-zinc-400 text-xs line-through decoration-zinc-300">
          Rs. {formatPrice(originalPrice)}
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

function formatPrice(price: number): string {
  // Use locale string for cleaner formatting if possible, essentially "1,200.00"
  return price.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
