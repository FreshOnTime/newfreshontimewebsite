import Link from "next/link";
import ProductImage from "./ProductImage";
import DeferredProductCardActions from "./DeferredProductCardActions";

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
}: ProductCardProps) {
  const pricePerBaseQuantityWithDiscount = calculateDiscountedPrice(
    pricePerBaseQuantity,
    discountPercentage
  );

  const showDiscountBadge = discountPercentage > DISCOUNT_THRESHOLD;
  const unitLabel = isDiscreteItem
    ? "Each"
    : `${baseMeasurementQuantity !== 1 ? baseMeasurementQuantity : ""}${(measurementType || "g").toLowerCase()}`;

  return (
    <article className="group relative h-full overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-brand-green">
      <div className="relative aspect-square overflow-hidden bg-background">
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

      <div className="p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="sr-only">Unit</span>
          <span>{unitLabel}</span>
        </div>

        <Link href={`/products/${sku}`} prefetch={false} className="block">
          <h3 className="line-clamp-2 min-h-[2.5rem] font-sans text-sm font-semibold leading-snug text-zinc-900 transition-colors group-hover:text-emerald-900 md:text-base">
            {name}
          </h3>
        </Link>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-zinc-100 pt-3.5">
          <PriceDisplay
            price={pricePerBaseQuantityWithDiscount}
            originalPrice={showDiscountBadge ? pricePerBaseQuantity : undefined}
          />
        </div>

        <div className="mt-4 w-full">
          <DeferredProductCardActions
            id={id}
            sku={sku}
            name={name}
            image={imageUrl}
            price={pricePerBaseQuantityWithDiscount}
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
