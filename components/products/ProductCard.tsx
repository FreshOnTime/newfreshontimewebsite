"use client";

import React from "react";
import Link from "next/link";
import ProductImage from "./ProductImage";
import AddToBagButton from "@/app/products/[id]/AddToBagButton";
import type { Product } from "@/models/product";
import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
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
    <div className="w-full group relative">
      <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-sm border border-zinc-100/50 hover:shadow-premium transition-all duration-300">

        {/* Image Container - Square Aspect Ratio */}
        <div className="aspect-square relative p-6 bg-zinc-50/30">
          <Link href={`/products/${sku}`} className="block h-full">
            <div className="relative h-full w-full transform transition-transform duration-500 hover:scale-105">
              <ProductImage src={imageUrl} alt={name} />
            </div>
          </Link>

          {/* Wishlist Button - Top Right, Minimal circle */}
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "absolute top-4 right-4 h-10 w-10 rounded-full bg-white shadow-sm transition-all duration-300 z-10",
              isWishlisted ? "text-red-500" : "text-zinc-400 hover:text-red-500"
            )}
            onClick={handleWishlistClick}
          >
            <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
          </Button>

          {/* Discount Badge */}
          {showDiscountBadge && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-zinc-900 text-white text-[10px] font-bold tracking-widest uppercase rounded-full">
              Save {discountPercentage}%
            </div>
          )}
        </div>

        {/* Product Info - Left Aligned */}
        <div className="p-5">
          {/* Title - Bold Sans-Serif */}
          <Link href={`/products/${sku}`} className="block group/title">
            <h3 className="font-bold text-lg text-zinc-900 mb-2 leading-tight group-hover:text-emerald-700 transition-colors line-clamp-2">
              {name}
            </h3>
          </Link>

          <div className="flex flex-col gap-4">
            {/* Box for Price and Unit to keep them minimal */}
            <div className="flex items-end justify-between">
              <PriceDisplay
                price={pricePerBaseQuantityWithDiscount}
                originalPrice={showDiscountBadge ? pricePerBaseQuantity : undefined}
              />

              {/* Unit Display - Right aligned or inline? Screenshot implies stacked but let's keep it near price or title */}
              <div className="text-sm font-medium text-zinc-500 mb-1">
                {!isDiscreteItem && (
                  <span>
                    {baseMeasurementQuantity !== 1 && `${baseMeasurementQuantity}`} {(measurementType || 'g').toLowerCase()}
                  </span>
                )}
                {isDiscreteItem && <span>Each</span>}
              </div>
            </div>

            {/* Button - Full Width */}
            <div className="w-full">
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
}: {
  price: number;
  originalPrice?: number;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xl font-bold text-zinc-900">
        Rs. {formatPrice(price)}
      </span>
      {originalPrice && (
        <span className="text-sm text-zinc-400 line-through decoration-zinc-300">
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
  return price.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
