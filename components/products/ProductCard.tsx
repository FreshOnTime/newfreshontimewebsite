import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import ProductImage from "./ProductImage";

interface ProductCardProps {
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
  sku,
  name,
  image: imageUrl,
  discountPercentage = 0,
  baseMeasurementQuantity,
  pricePerBaseQuantity,
  measurementType,
  isDiscreteItem,
}: ProductCardProps) {
  const pricePerBaseQuantityWithDiscount = calculateDiscountedPrice(
    pricePerBaseQuantity,
    discountPercentage
  );

  const pricePerMeasurement = calculatePricePerMeasurement(
    pricePerBaseQuantityWithDiscount,
    baseMeasurementQuantity
  );

  const showDiscountBadge = discountPercentage > DISCOUNT_THRESHOLD;

  return (
    <Card className="w-full max-w-[260px] overflow-hidden border-none cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 group bg-white rounded-xl">
      <Link href={`/products/${sku}`}>
        <div className="relative overflow-hidden rounded-t-xl">
          <div className="aspect-square relative">
            <ProductImage src={imageUrl} alt={name} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          {showDiscountBadge && (
            <Badge className="absolute right-3 top-3 font-bold text-xs bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 z-10 shadow-lg px-2 py-1 rounded-full">
              -{discountPercentage}%
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="mb-2 text-gray-800 line-clamp-2 font-semibold text-sm group-hover:text-green-600 transition-colors duration-200 leading-tight min-h-[2.5rem]">
            {name}
          </h3>
          <PriceDisplay
            price={pricePerBaseQuantityWithDiscount}
            isDiscreteItem={isDiscreteItem}
            baseMeasurementQuantity={baseMeasurementQuantity}
            measurementType={measurementType}
          />
          {!isDiscreteItem && (
            <p className="text-xs text-gray-500 mt-1">
              Rs. {formatPrice(pricePerMeasurement)}/{measurementType}
            </p>
          )}
          <div className="mt-3">
            <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Add to Cart
            </button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

function PriceDisplay({
  price,
  isDiscreteItem,
  baseMeasurementQuantity,
  measurementType,
}: {
  price: number;
  isDiscreteItem: boolean;
  baseMeasurementQuantity: number;
  measurementType: string;
}) {
  return (
    <div className="flex items-baseline space-x-1">
      <p className="text-lg font-bold text-green-600">
        Rs. {formatPrice(price)}
      </p>
      {!isDiscreteItem && (
        <span className="text-xs font-medium text-gray-500">
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
