import { Prisma } from '@prisma/client';

export type UiUnit = 'g' | 'kg' | 'ml' | 'l' | 'ea' | 'lb';

// Keep catalogue list queries intentionally small. Rich descriptions,
// attributes, tags, relations and timestamps belong on the product detail
// route; sending them for every grid card delays DB transfer and RSC parsing.
export const productCardSelect = {
  id: true,
  name: true,
  sku: true,
  description: true,
  price: true,
  discountPercentage: true,
  stockQty: true,
  image: true,
  images: true,
  isBundle: true,
} satisfies Prisma.ProductSelect;

export type ProductCardRow = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

export function serializeProductCardForUi(p: ProductCardRow) {
  const img = p.image || p.images[0] || '/placeholder.svg';
  return {
    _id: p.id,
    sku: p.sku,
    name: p.name,
    image: { url: img, filename: '', contentType: '', path: img, alt: p.name },
    description: p.description || '',
    baseMeasurementQuantity: 1,
    pricePerBaseQuantity: Number(p.price),
    measurementUnit: 'ea' as const,
    isSoldAsUnit: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 9999,
    stepQuantity: 1,
    stockQuantity: p.stockQty,
    isOutOfStock: p.stockQty <= 0,
    totalSales: 0,
    discountPercentage: Number(p.discountPercentage),
    lowStockThreshold: 0,
    unitOptions: [],
    tags: [],
    isBundle: p.isBundle,
  };
}

export type ProductForUi = {
  id: string;
  name: string;
  sku: string;
  slug: string;
  description: string | null;
  price: Prisma.Decimal | number;
  discountPercentage: Prisma.Decimal | number;
  stockQty: number;
  minStockLevel: number;
  image: string | null;
  images: string[];
  isFeatured: boolean;
  attributes: Prisma.JsonValue;
  tags?: string[];
  categoryId: string | null;
  category?: { name: string; slug: string } | null;
  createdAt: Date;
  updatedAt: Date;
};

function parseUnitOptions(attributes: Prisma.JsonValue) {
  const attrs = (attributes as Record<string, unknown> | null) || {};
  const maybe = (attrs as { unitOptions?: unknown }).unitOptions;
  if (!Array.isArray(maybe)) return undefined;
  const opts = maybe
    .map((opt) => {
      const o = opt as Partial<{ label: unknown; quantity: unknown; unit: unknown; price: unknown }>;
      const unit =
        typeof o.unit === 'string' && ['g', 'kg', 'ml', 'l', 'ea', 'lb'].includes(o.unit)
          ? (o.unit as UiUnit)
          : undefined;
      const quantity = typeof o.quantity === 'number' && isFinite(o.quantity) && o.quantity > 0 ? o.quantity : undefined;
      const price = typeof o.price === 'number' && isFinite(o.price) && o.price >= 0 ? o.price : undefined;
      const label = typeof o.label === 'string' && o.label.trim().length > 0 ? o.label : undefined;
      if (!unit || !quantity || price === undefined) return null;
      return { label: label || `${quantity}${unit}`, quantity, unit, price };
    })
    .filter(Boolean) as Array<{ label: string; quantity: number; unit: UiUnit; price: number }>;
  return opts.length ? opts : undefined;
}

/**
 * Map a Postgres Product row to the UI product shape the storefront components
 * (ProductCard / ProductGrid) expect. Shared by /api/products, /api/products/[id]
 * and /api/wishlist so all product surfaces render identically.
 */
export function serializeProductForUi(p: ProductForUi) {
  const img = p.image || (Array.isArray(p.images) && p.images[0]) || '/placeholder.svg';
  return {
    _id: p.id,
    sku: p.sku,
    name: p.name,
    slug: p.slug,
    image: {
      url: String(img),
      filename: '',
      contentType: '',
      path: String(img),
      alt: p.name || undefined,
    },
    description: p.description || '',
    category: p.category ? { id: p.categoryId as string, name: p.category.name, slug: p.category.slug } : undefined,
    baseMeasurementQuantity: 1,
    pricePerBaseQuantity: Number(p.price),
    measurementUnit: 'ea',
    isSoldAsUnit: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 9999,
    stepQuantity: 1,
    stockQuantity: p.stockQty,
    isOutOfStock: p.stockQty <= 0,
    totalSales: 0,
    isFeatured: p.isFeatured,
    discountPercentage: Number(p.discountPercentage),
    lowStockThreshold: p.minStockLevel,
    createdAt: p.createdAt,
    createdBy: undefined,
    updatedAt: p.updatedAt,
    updatedBy: undefined,
    ingredients: undefined,
    nutritionFacts: undefined,
    unitOptions: parseUnitOptions(p.attributes),
    tags: p.tags || [],
  };
}
