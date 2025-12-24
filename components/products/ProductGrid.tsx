"use client";

import { Product } from "@/models/product";
import { ProductCard } from "./ProductCard";

import { BundleCard } from "./BundleCard";

export default function ProductGrid({
  products,
  className,
}: {
  products: Product[];
  className?: string;
}) {
  if (!products?.length) {
    return (
      <div className="text-center text-gray-600 py-16">No products found.</div>
    );
  }
  return (
    <div
      className={
        className ??
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
      }
    >
      {products.map((p) => (
        <div key={p.sku || p._id} className="group">
          <div className="transform group-hover:scale-105 transition-transform duration-300 h-full">
            {p.isBundle ? (
              <BundleCard product={p} />
            ) : (
              <ProductCard
                id={p._id || ''}
                sku={p.sku}
                name={p.name}
                image={p.image.url}
                discountPercentage={p.discountPercentage || 0}
                baseMeasurementQuantity={p.baseMeasurementQuantity}
                pricePerBaseQuantity={p.pricePerBaseQuantity}
                measurementType={p.measurementUnit}
                isDiscreteItem={p.isSoldAsUnit}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
