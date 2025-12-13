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
    <Card className="w-full max-w-[280px] overflow-hidden border border-gray-100 cursor-pointer bg-white rounded-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] group">
      <div className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="aspect-square relative p-4">
          <Link href={`/products/${sku}`} className="block h-full">
            <div className="relative h-full transform transition-transform duration-500 ease-out group-hover:scale-105">
              <ProductImage src={imageUrl} alt={name} />
            </div>
          </Link>
          <Button
            size="icon"
            variant="secondary"
            className={`absolute top-3 right-3 h-8 w-8 rounded-full shadow-sm transition-colors duration-200 z-10 ${isWishlisted
              ? "bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
              : "bg-white/80 hover:bg-white text-gray-400 hover:text-gray-600 backdrop-blur-sm"
              }`}
            onClick={handleWishlistClick}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
          </Button>
        </div>
        {showDiscountBadge && (
          <Badge className="absolute left-3 top-3 font-semibold text-xs bg-red-500 text-white hover:bg-red-600 z-10 px-2.5 py-1 rounded-full shadow-sm">
            {discountPercentage}% OFF
          </Badge>
        )}
      </div>
      <CardContent className="p-4 pt-3 border-t border-gray-50">
        <Link href={`/products/${sku}`} className="block">
          <h3 className="text-gray-800 line-clamp-2 font-medium text-sm leading-snug min-h-[2.5rem] group-hover:text-emerald-600 transition-colors duration-200">
            {name}
          </h3>
        </Link>
        <div className="mt-3 mb-3">
          <PriceDisplay
            price={pricePerBaseQuantityWithDiscount}
            originalPrice={showDiscountBadge ? pricePerBaseQuantity : undefined}
            isDiscreteItem={isDiscreteItem}
            baseMeasurementQuantity={baseMeasurementQuantity}
            measurementType={measurementType}
          />
          {!isDiscreteItem && (
            <p className="text-xs text-gray-400 mt-1 font-medium">
              Rs. {formatPrice(pricePerMeasurement)}/{measurementType}
            </p>
          )}
        </div>
        <div className="pt-2 border-t border-gray-50">
          <AddToBagButton product={buildProductForBag()} quantity={1} />
        </div>
      </CardContent>
    </Card>
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
