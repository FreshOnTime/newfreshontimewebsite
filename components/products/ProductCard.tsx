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
    <article className="group relative h-full overflow-hidden rounded-[1.3rem] border border-zinc-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_22px_65px_rgba(10,50,30,0.08)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f2f4f1]">
        <Link href={`/products/${sku}`} prefetch={false} className="block h-full" aria-label={`View ${name}`}>
          <div className="relative h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.025]">
            <ProductImage src={imageUrl} alt={name} priority={priority} />
          </div>
        </Link>

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-3 pointer-events-none">
          <span className="inline-flex items-center gap-2 rounded-lg border border-white/70 bg-white/85 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em] text-zinc-600 shadow-sm backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live catalogue
          </span>
          {showDiscountBadge && (
            <span className="rounded-lg bg-[#07100b] px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.15em] text-white shadow-sm">
              {discountPercentage}% off
            </span>
          )}
        </div>
      </div>

      <div className="p-4 md:p-5">
        <div className="mb-2.5 flex items-center justify-between gap-3 text-[8px] font-bold uppercase tracking-[0.17em] text-zinc-400">
          <span>FreshPick</span>
          <span>{unitLabel}</span>
        </div>

        <Link href={`/products/${sku}`} prefetch={false} className="block">
          <h3 className="line-clamp-2 min-h-[2.8rem] font-sans text-[15px] font-semibold leading-snug tracking-[-0.01em] text-zinc-900 transition-colors group-hover:text-emerald-900 md:text-base">
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
      <span className="font-sans text-base font-semibold tracking-[-0.01em] text-zinc-950 md:text-lg">
        Rs. {formatPrice(price)}
      </span>
      {originalPrice && (
        <span className="text-[10px] text-zinc-400 line-through decoration-zinc-300">
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
