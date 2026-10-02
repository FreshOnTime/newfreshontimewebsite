import type { Bag } from '@/models/Bag';

export interface ApiBagProduct {
  _id?: string;
  id?: string;
  sku?: string;
  name?: string;
  image?: { url: string; alt?: string } | string | null;
  images?: Array<string | { url: string; alt?: string }>;
  measurementType?: string;
  stockQuantity?: number;
  stockQty?: number;
}

export interface ApiBag {
  _id: string;
  name: string;
  description?: string | null;
  tags?: string[];
  items: Array<{ product: ApiBagProduct | null; quantity: number; price: number }>;
}

/** Keep the API's item price and zero stock; support current and legacy images. */
export function normalizeBag(bag: ApiBag): Bag {
  return {
    id: bag._id,
    name: bag.name,
    description: bag.description || undefined,
    tags: bag.tags ?? [],
    items: (bag.items || []).flatMap((item) => {
      const product = item?.product;
      if (!product || !(product._id || product.id)) return [];
      const source = [...(product.image ? [product.image] : []), ...(product.images || [])];
      const images = source.flatMap((image) => {
        const url = typeof image === 'string' ? image : image?.url;
        return url ? [{ url, alt: typeof image === 'string' ? product.name || '' : image.alt || product.name || '' }] : [];
      });
      const available = product.stockQty ?? product.stockQuantity ?? 0;
      return [{
        quantity: item.quantity,
        product: {
          _id: String(product._id || product.id),
          id: String(product._id || product.id),
          sku: product.sku || String(product._id || product.id),
          name: product.name || 'Product unavailable',
          price: Number(item.price),
          pricePerBaseQuantity: Number(item.price),
          baseMeasurementQuantity: 1,
          isSoldAsUnit: true,
          discountPercentage: 0,
          unit: product.measurementType || 'each',
          stock: Number.isFinite(available) ? Math.max(0, available) : 0,
          images,
        },
      } as Bag['items'][number]];
    }),
  };
}
