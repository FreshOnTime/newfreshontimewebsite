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

  return (
    <article className="group relative w-full border-b border-[#d9d3c8] pb-7">
      <div className="relative">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f4f4f5]">
          <Link href={`/products/${sku}`} prefetch={false} className="block h-full" aria-label={`View ${name}`}>
            <div className="relative h-full w-full transition-transform duration-1000 ease-out group-hover:scale-[1.025]">
              <ProductImage src={imageUrl} alt={name} priority={priority} />
            </div>
          </Link>

          {showDiscountBadge && (
            <div className="absolute left-0 top-0 bg-[#09090b] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#ecfdf5]">
              {discountPercentage}% off
            </div>
          )}
        </div>

        <div className="pt-5">
          <div className="mb-3 flex items-center justify-between gap-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[#047857]">
            <span>{isDiscreteItem ? "By the piece" : "Fresh selection"}</span>
            <span className="text-zinc-500">
              {isDiscreteItem ? "Each" : `${baseMeasurementQuantity !== 1 ? baseMeasurementQuantity : ""}${(measurementType || "g").toLowerCase()}`}
            </span>
          </div>

          <Link href={`/products/${sku}`} prefetch={false} className="block">
            <h3 className="line-clamp-2 min-h-[3.25rem] font-serif text-xl font-normal leading-snug text-[#09090b] transition-colors group-hover:text-emerald-800">
              {name}
            </h3>
          </Link>

          <div className="mt-4 flex flex-col gap-5">
            <div className="flex items-end justify-between border-t border-[#e4dfd5] pt-4">
              <PriceDisplay
                price={pricePerBaseQuantityWithDiscount}
                originalPrice={showDiscountBadge ? pricePerBaseQuantity : undefined}
              />
            </div>

            <div className="w-full opacity-100 transition-opacity md:opacity-90 md:group-hover:opacity-100">
              <DeferredProductCardActions id={id} sku={sku} name={name} image={imageUrl} price={pricePerBaseQuantityWithDiscount} />
            </div>
          </div>
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
      <span className="font-serif text-xl font-normal text-[#09090b]">
        Rs. {formatPrice(price)}
      </span>
      {originalPrice && (
        <span className="text-xs text-zinc-400 line-through decoration-zinc-300">
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
