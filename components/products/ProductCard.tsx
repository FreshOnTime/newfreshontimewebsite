import { discountedUnitPrice } from '@/lib/commercePricing';
import Link from 'next/link';
import ProductImage from './ProductImage';
import DeferredProductCardActions from './DeferredProductCardActions';

interface ProductCardProps {
  id: string; sku: string; name: string; image: string; discountPercentage: number;
  baseMeasurementQuantity: number; pricePerBaseQuantity: number;
  measurementType: 'g' | 'kg' | 'ml' | 'l' | 'ea' | 'lb'; isDiscreteItem: boolean;
  priority?: boolean; variant?: 'default' | 'market'; isOutOfStock?: boolean; isBundle?: boolean;
}
export function ProductCard({ id, sku, name, image, discountPercentage = 0, baseMeasurementQuantity, pricePerBaseQuantity, measurementType, isDiscreteItem, priority = false, isOutOfStock = false, isBundle = false }: ProductCardProps) {
  const price = discountedUnitPrice(pricePerBaseQuantity, discountPercentage);
  const discounted = discountPercentage > 0.01;
  const unit = isDiscreteItem ? 'Each' : `${baseMeasurementQuantity !== 1 ? baseMeasurementQuantity : ''}${(measurementType || 'g').toLowerCase()}`;
  const path = `/products/${encodeURIComponent(sku)}`;
  return (
    <article className="group flex h-full min-w-0 flex-col rounded-2xl border border-brand-green/10 bg-white/75 p-2.5 shadow-[0_12px_35px_-30px_rgba(16,46,30,.25)] transition-[transform,box-shadow,border-color] duration-300 hover:border-brand-green/25 hover:shadow-lg motion-safe:hover:-translate-y-1 sm:p-3">
      <Link href={path} prefetch={false} aria-label={`View ${name}`} className="relative block aspect-square overflow-hidden rounded-xl bg-secondary/40 [&_img]:transition-transform [&_img]:duration-500 motion-safe:hover:[&_img]:scale-[1.045]"><ProductImage src={image} alt={name} priority={priority} /></Link>
      <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
        <div className="mb-2 flex flex-wrap justify-between gap-2 text-[11px] text-muted-foreground"><span>{isBundle ? 'Produce box' : unit}</span>{isOutOfStock ? <span>Unavailable</span> : discounted ? <span className="bg-brand-amber px-2 py-0.5 font-semibold text-foreground">{discountPercentage}% off</span> : null}</div>
        <Link href={path} prefetch={false}><h3 className="line-clamp-2 min-h-[2.75rem] font-sans text-base font-semibold leading-6 tracking-[-0.02em] text-foreground group-hover:underline underline-offset-4 md:text-base">{name}</h3></Link>
        <div className="mt-3 flex flex-wrap items-baseline gap-2 text-base tabular-nums text-brand-green-deep"><span className="font-semibold">Rs. {formatPrice(price)}</span>{discounted && <span className="text-xs text-muted-foreground line-through">Rs. {formatPrice(pricePerBaseQuantity)}</span>}</div>
        <div className="mt-auto pt-5"><DeferredProductCardActions id={id} sku={sku} name={name} image={image} price={price} isOutOfStock={isOutOfStock} /></div>
      </div>
    </article>
  );
}
function formatPrice(price: number) { return price.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
