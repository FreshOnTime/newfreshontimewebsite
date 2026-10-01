import type { Product } from "@/models/product";
import { ProductCard } from "./ProductCard";

export default function ProductGrid({
  products,
  className,
  priorityCount = 0,
}: {
  products: Product[];
  className?: string;
  priorityCount?: number;
}) {
  if (!products?.length) {
    return (
      <div className="text-center text-gray-600 py-8">No products found.</div>
    );
  }
  return (
    <div
      className={
        className ??
        "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:gap-x-6 md:gap-y-10 lg:grid-cols-4"
      }
    >
      {products.map((p, index) => (
        <ProductCard
          key={p.sku || p._id}
          id={p._id || ''}
          sku={p.sku}
          name={p.name}
          image={p.image?.url || ""}
          discountPercentage={p.discountPercentage || 0}
          baseMeasurementQuantity={p.baseMeasurementQuantity}
          pricePerBaseQuantity={p.pricePerBaseQuantity}
          measurementType={p.measurementUnit}
          isDiscreteItem={p.isSoldAsUnit}
          priority={index < priorityCount}
          variant="market"
          isOutOfStock={p.isOutOfStock}
          isBundle={p.isBundle}
        />
      ))}
    </div>
  );
}
