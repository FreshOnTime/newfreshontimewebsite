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
    <article className="group relative h-full rounded-[1.5rem] bg-white p-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_55px_rgba(15,23,42,0.08)] md:p-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.15rem] bg-[#f3f4f2]">
        <Link href={`/products/${sku}`} prefetch={false} className="block h-full" aria-label={`View ${name}`}>
          <div className="relative h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.035]">
            <ProductImage src={imageUrl} alt={name} priority={priority} />
          </div>
        </Link>

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-3 pointer-events-none">
          <span className="rounded-full bg-white/88 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-emerald-800 shadow-sm backdrop-blur-md">
            {isDiscreteItem ? "By the piece" : "Fresh selection"}
          </span>
          {showDiscountBadge && (
            <span className="rounded-full bg-zinc-950 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em] text-white shadow-sm">
              {discountPercentage}% off
            </span>
          )}
        </div>
      </div>

      <div className="px-1 pb-1 pt-4 md:px-2">
        <div className="mb-2 flex items-center justify-between gap-3 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">
          <span>FreshPick</span>
          <span>{unitLabel}</span>
        </div>

        <Link href={`/products/${sku}`} prefetch={false} className="block">
          <h3 className="line-clamp-2 min-h-[3rem] font-serif text-lg font-normal leading-snug text-zinc-950 transition-colors group-hover:text-emerald-800 md:text-xl">
            {name}
          </h3>
        </Link>

        <div className="mt-3 flex items-end justify-between gap-3 border-t border-zinc-100 pt-3">
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
      <span className="font-serif text-lg font-normal text-zinc-950 md:text-xl">
        Rs. {formatPrice(price)}
      </span>
      {originalPrice && (
        <span className="text-[11px] text-zinc-400 line-through decoration-zinc-300">
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
