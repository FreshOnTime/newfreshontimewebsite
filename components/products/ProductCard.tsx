import Link from "next/link";
import ProductImage from "./ProductImage";
import DeferredProductCardActions from "./DeferredProductCardActions";
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
  priority?: boolean;
  variant?: "default" | "market" | "editorial";
  isOutOfStock?: boolean;
  isBundle?: boolean;
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
  priority = false,
  variant = "default",
  isOutOfStock = false,
  isBundle = false,
}: ProductCardProps) {
  const isOpenCard = variant !== "default";
  const isEditorial = variant === "editorial";
  const pricePerBaseQuantityWithDiscount = calculateDiscountedPrice(
    pricePerBaseQuantity,
    discountPercentage
  );

  const showDiscountBadge = discountPercentage > DISCOUNT_THRESHOLD;
  const unitLabel = isDiscreteItem
    ? "Each"
    : `${baseMeasurementQuantity !== 1 ? baseMeasurementQuantity : ""}${(measurementType || "g").toLowerCase()}`;

  return (
    <article className={cn("group relative h-full", isOpenCard ? "flex flex-col" : "overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-brand-green")}>
      <div className={cn("relative aspect-square overflow-hidden bg-background", variant === "market" && "rounded-xl border border-border/70 [&_img]:mix-blend-multiply", isEditorial && "rounded-sm bg-secondary/50 [&_img]:mix-blend-multiply")}>
        <Link href={`/products/${sku}`} prefetch={false} className="block h-full" aria-label={`View ${name}`}>
          <div className="relative h-full w-full transition-transform duration-700 ease-out">
            <ProductImage src={imageUrl} alt={name} priority={priority} />
          </div>
        </Link>

        <div className="absolute right-3 top-3 pointer-events-none">
          {showDiscountBadge && (
            <span className="rounded-md bg-brand-amber px-2.5 py-1.5 text-xs font-semibold text-accent-foreground">
              {discountPercentage}% off
            </span>
          )}
        </div>
      </div>

      <div className={cn(isOpenCard ? "flex flex-1 flex-col pt-4" : "p-3 sm:p-4")}>
        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="sr-only">Unit</span>
          <span>{isBundle ? "Bundle" : unitLabel}</span>
          {isOutOfStock && <span>Unavailable</span>}
        </div>

        <Link href={`/products/${sku}`} prefetch={false} className="block">
          <h3 className={cn("line-clamp-2 min-h-[2.5rem] font-sans text-sm leading-snug text-foreground transition-colors group-hover:text-brand-green md:text-base", isOpenCard ? "font-medium" : "font-semibold")}>
            {name}
          </h3>
        </Link>

        <div className={cn("flex items-end justify-between gap-3", isOpenCard ? "mt-2" : "mt-4 border-t border-zinc-100 pt-3.5")}>
          <PriceDisplay
            price={pricePerBaseQuantityWithDiscount}
            originalPrice={showDiscountBadge ? pricePerBaseQuantity : undefined}
          />
        </div>

        <div className={cn("w-full", isOpenCard ? "mt-auto pt-4" : "mt-4")}>
          <DeferredProductCardActions
            id={id}
            sku={sku}
            name={name}
            image={imageUrl}
            price={pricePerBaseQuantityWithDiscount}
            isOutOfStock={isOutOfStock}
            subtle={isEditorial}
          />
        </div>
      </div>
    </article>
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
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="font-sans text-sm font-semibold text-foreground sm:text-base">
        Rs. {formatPrice(price)}
      </span>
      {originalPrice && (
        <span className="text-xs text-muted-foreground line-through decoration-zinc-300">
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
