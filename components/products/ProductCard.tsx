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
    <article className="group flex h-full min-w-0 flex-col">
      <Link href={path} prefetch={false} aria-label={`View ${name}`} className="relative block aspect-[4/5] overflow-hidden bg-secondary/60"><ProductImage src={image} alt={name} priority={priority} /></Link>
      <div className="flex flex-1 flex-col pt-4">
        <div className="mb-2 flex flex-wrap justify-between gap-2 text-[11px] text-muted-foreground"><span>{isBundle ? 'Produce box' : unit}</span>{isOutOfStock ? <span>Unavailable</span> : discounted ? <span className="text-brand-green">{discountPercentage}% off</span> : null}</div>
        <Link href={path} prefetch={false}><h3 className="line-clamp-2 min-h-[2.75rem] font-sans text-sm font-medium leading-6 text-foreground group-hover:underline underline-offset-4 md:text-base">{name}</h3></Link>
        <div className="mt-3 flex flex-wrap items-baseline gap-2 text-sm tabular-nums"><span className="font-medium">Rs. {formatPrice(price)}</span>{discounted && <span className="text-xs text-muted-foreground line-through">Rs. {formatPrice(pricePerBaseQuantity)}</span>}</div>
        <div className="mt-auto pt-5"><DeferredProductCardActions id={id} sku={sku} name={name} image={image} price={price} isOutOfStock={isOutOfStock} /></div>
      </div>
    </article>
  );
}
function formatPrice(price: number) { return price.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
