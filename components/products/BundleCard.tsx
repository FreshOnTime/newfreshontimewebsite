import type { Product } from "@/models/product";
import { ProductCard } from "./ProductCard";

/** Bundles share the market's pricing, stock and accessible shopping controls. */
export function BundleCard({ product }: { product: Product }) {
  return <ProductCard id={product._id || ""} sku={product.sku} name={product.name} image={product.image?.url || ""} discountPercentage={product.discountPercentage || 0} baseMeasurementQuantity={product.baseMeasurementQuantity} pricePerBaseQuantity={product.pricePerBaseQuantity} measurementType={product.measurementUnit} isDiscreteItem={product.isSoldAsUnit} isOutOfStock={product.isOutOfStock} isBundle variant="market" />;
}
