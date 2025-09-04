import ProductGrid from "@/components/products/ProductGrid";
import SectionHeader from "@/components/home/SectionHeader";
import { PageContainer } from "@/components/templates/PageContainer";
import ProductsFilterBar from "../../components/products/ProductsFilterBar";

import connectDB from '@/lib/database';
import EnhancedProduct from '@/lib/models/EnhancedProduct';
import Category from '@/lib/models/Category';

// Read directly from the database in server components to avoid relying on internal API fetch
async function getProducts(query: string) {
  try {
    await connectDB();

    const urlParams = new URLSearchParams(query);
    const page = parseInt(urlParams.get('page') || '1');
    const limit = parseInt(urlParams.get('limit') || '12');
    const search = urlParams.get('search');
    const categoryId = urlParams.get('categoryId');
    const supplierId = urlParams.get('supplierId');
    const archivedParam = urlParams.get('archived');
    const minPriceParam = urlParams.get('minPrice');
    const maxPriceParam = urlParams.get('maxPrice');
    const inStockParam = urlParams.get('inStock');
    const sortParam = urlParams.get('sort');

    const filter: Record<string, unknown> = {};
    filter.archived = archivedParam ? archivedParam === 'true' : false;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (categoryId) filter.categoryId = categoryId;
    if (supplierId) filter.supplierId = supplierId;

    const priceFilter: Record<string, unknown> = {};
    const minPrice = minPriceParam ? parseFloat(minPriceParam) : undefined;
    const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : undefined;
    if (typeof minPrice === 'number' && isFinite(minPrice)) priceFilter.$gte = minPrice;
    if (typeof maxPrice === 'number' && isFinite(maxPrice)) priceFilter.$lte = maxPrice;
    if (Object.keys(priceFilter).length) filter.price = priceFilter;
    if (inStockParam === 'true') filter.stockQty = { $gt: 0 };

    const skip = (page - 1) * limit;
    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortParam === 'price-asc') sort = { price: 1 };
    else if (sortParam === 'price-desc') sort = { price: -1 };
    else if (sortParam === 'newest') sort = { createdAt: -1 };
    else if (sortParam === 'oldest') sort = { createdAt: 1 };

    const [rawProducts] = await Promise.all([
      EnhancedProduct.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    ]);

    const categoryIds = Array.from(
      new Set(
        rawProducts
          .map((p) => (p as unknown as { categoryId?: unknown }).categoryId)
          .filter((id): id is string => typeof id === 'string')
      )
    );
    const categories = categoryIds.length
      ? await Category.find({ _id: { $in: categoryIds } }).select('name slug').lean()
      : [];
    const categoryMap = new Map<string, { name: string; slug: string }>();
    for (const c of categories as Array<{ _id: unknown; name?: string; slug?: string }>) {
      const id = String(c._id);
      categoryMap.set(id, { name: c.name || '', slug: c.slug || '' });
    }

    const products = rawProducts.map((p) => {
      const single = (p as unknown as { image?: string }).image;
      const first = Array.isArray((p as unknown as { images?: string[] }).images)
        ? ((p as unknown as { images?: string[] }).images![0])
        : undefined;
      const img = single || first || '/placeholder.svg';
      const attrs = (p as unknown as { attributes?: Record<string, unknown> }).attributes || {};
      const maybeUnitOptions = (attrs as { unitOptions?: unknown }).unitOptions;
      const unitOptions = Array.isArray(maybeUnitOptions)
        ? maybeUnitOptions
            .map((opt) => {
              const o = opt as Partial<{ label: unknown; quantity: unknown; unit: unknown; price: unknown }>;
              const unit = typeof o.unit === 'string' && ['g','kg','ml','l','ea','lb'].includes(o.unit)
                ? (o.unit as 'g'|'kg'|'ml'|'l'|'ea'|'lb')
                : undefined;
              const quantity = typeof o.quantity === 'number' && isFinite(o.quantity) && o.quantity > 0 ? o.quantity : undefined;
              const price = typeof o.price === 'number' && isFinite(o.price) && o.price >= 0 ? o.price : undefined;
              const label = typeof o.label === 'string' && o.label.trim().length > 0 ? o.label : undefined;
              if (!unit || !quantity || price === undefined) return null;
              return { label: label || `${quantity}${unit}`, quantity, unit, price };
            })
            .filter(Boolean) as Array<{ label: string; quantity: number; unit: 'g'|'kg'|'ml'|'l'|'ea'|'lb'; price: number }>
        : undefined;
      return ({
        sku: String((p as any).sku || (p as any)._id),
        name: (p as any).name || '',
        image: { url: String(img), filename: '', contentType: '', path: String(img), alt: (p as any).name || undefined },
        description: (p as any).description || '',
        category: (p as any).categoryId
          ? (() => {
              const id = String((p as any).categoryId);
              const meta = categoryMap.get(id);
              return { id, name: meta?.name || '', slug: meta?.slug || '' };
            })()
          : undefined,
        baseMeasurementQuantity: 1,
        pricePerBaseQuantity: Number((p as any).price ?? 0),
        measurementUnit: 'ea',
        isSoldAsUnit: true,
        minOrderQuantity: 1,
        maxOrderQuantity: 9999,
        stepQuantity: 1,
        stockQuantity: Number((p as any).stockQty ?? 0),
        isOutOfStock: Number((p as any).stockQty ?? 0) <= 0,
        totalSales: 0,
        isFeatured: false,
        discountPercentage: 0,
        lowStockThreshold: Number((p as any).minStockLevel ?? 0),
        createdAt: (p as any).createdAt as unknown as Date | undefined,
        updatedAt: (p as any).updatedAt as unknown as Date | undefined,
        unitOptions,
      });
    });

    return products;
  } catch (error) {
    console.error('Failed to get products from DB:', error);
    // Fallback: attempt internal API fetch (absolute with withBase then relative)
    try {
      const { withBase } = await import('@/lib/serverUrl');
      const absolute = withBase(`/api/products${query ? `?${query}` : ''}`);
      let resp = await fetch(absolute, { cache: 'no-store' });
      if (!resp.ok) {
        resp = await fetch(`/api/products${query ? `?${query}` : ''}`, { cache: 'no-store' });
      }
      if (resp.ok) {
        const data = await resp.json();
        return data.data?.products || [];
      }
      console.error('Fallback API fetch failed with status', resp.status);
    } catch (err) {
      console.error('Fallback API fetch error:', err);
    }
    return [];
  }
}

export default async function ProductsIndex({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const spObj = await searchParams;
  // Normalize to query string
  const sp = new URLSearchParams();
  const allowed = ['search','categoryId','supplierId','minPrice','maxPrice','inStock','sort','page','limit'];
  for (const key of allowed) {
    const val = spObj[key];
    if (Array.isArray(val)) {
      for (const v of val) if (v != null) sp.append(key, String(v));
    } else if (val != null) {
      sp.set(key, String(val));
    }
  }
  const products = await getProducts(sp.toString());
  console.log('ProductsIndex - normalized query:', sp.toString());

  return (
    <PageContainer>
      <SectionHeader
        title="All Products"
        subtitle="Explore our complete range of fresh groceries"
      />
  <ProductsFilterBar />
  <ProductGrid products={products} />
    </PageContainer>
  );
}
