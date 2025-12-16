import ProductGrid from "@/components/products/ProductGrid";
// import SectionHeader from "@/components/home/SectionHeader"; 
// import { PageContainer } from "@/components/templates/PageContainer";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import ProductsFilterBar from "@/components/products/ProductsFilterBar";
import ProductsPagination from "@/components/products/ProductsPagination";

import connectDB from '@/lib/database';
import EnhancedProduct, { type IProduct } from '@/lib/models/EnhancedProduct';
import Category from '@/lib/models/Category';

// Read directly from the database in server components to avoid relying on internal API fetch
async function getProducts(query: string) {
  try {
    await connectDB();

    const urlParams = new URLSearchParams(query);
    const pageParam = parseInt(urlParams.get('page') || '1', 10);
    const limitParam = parseInt(urlParams.get('limit') || '24', 10);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limitBase = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 24;
    const limit = Math.min(Math.max(limitBase, 1), 60);
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

    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortParam === 'price-asc') sort = { price: 1 };
    else if (sortParam === 'price-desc') sort = { price: -1 };
    else if (sortParam === 'newest') sort = { createdAt: -1 };
    else if (sortParam === 'oldest') sort = { createdAt: 1 };

    const totalCount = await EnhancedProduct.countDocuments(filter);
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / limit);
    const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);
    const skip = totalPages === 0 ? 0 : (currentPage - 1) * limit;

    const rawProducts = await EnhancedProduct.find<IProduct>(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    interface CategoryIdentifiable {
      categoryId?: unknown;
    }

    const categoryIds: string[] = Array.from<string>(
      new Set<string>(
        rawProducts
          .map((product) => {
            const id = (product as CategoryIdentifiable)?.categoryId;
            return id ? String(id) : null;
          })
          .filter((id): id is string => Boolean(id))
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

    const products = rawProducts.map((product) => {
      const single = product.image;
      const first = Array.isArray(product.images) ? product.images[0] : undefined;
      const img = single || first || '/placeholder.svg';
      const attrs = (product.attributes ?? {}) as Record<string, unknown>;
      const maybeUnitOptions = (attrs as { unitOptions?: unknown }).unitOptions;
      const unitOptions = Array.isArray(maybeUnitOptions)
        ? maybeUnitOptions
          .map((opt) => {
            const o = opt as Partial<{ label: unknown; quantity: unknown; unit: unknown; price: unknown }>;
            const unit = typeof o.unit === 'string' && ['g', 'kg', 'ml', 'l', 'ea', 'lb'].includes(o.unit)
              ? (o.unit as 'g' | 'kg' | 'ml' | 'l' | 'ea' | 'lb')
              : undefined;
            const quantity = typeof o.quantity === 'number' && isFinite(o.quantity) && o.quantity > 0 ? o.quantity : undefined;
            const price = typeof o.price === 'number' && isFinite(o.price) && o.price >= 0 ? o.price : undefined;
            const label = typeof o.label === 'string' && o.label.trim().length > 0 ? o.label : undefined;
            if (!unit || !quantity || price === undefined) return null;
            return { label: label || `${quantity}${unit}`, quantity, unit, price };
          })
          .filter(Boolean) as Array<{ label: string; quantity: number; unit: 'g' | 'kg' | 'ml' | 'l' | 'ea' | 'lb'; price: number }>
        : undefined;
      const categoryIdValue = product.categoryId ? String(product.categoryId) : undefined;

      return ({
        sku: product.sku || String(product._id),
        name: product.name || '',
        image: { url: String(img), filename: '', contentType: '', path: String(img), alt: product.name || undefined },
        description: product.description || '',
        category: categoryIdValue
          ? (() => {
            const meta = categoryMap.get(categoryIdValue);
            return { id: categoryIdValue, name: meta?.name || '', slug: meta?.slug || '' };
          })()
          : undefined,
        baseMeasurementQuantity: 1,
        pricePerBaseQuantity: Number(product.price ?? 0),
        measurementUnit: 'ea',
        isSoldAsUnit: true,
        minOrderQuantity: 1,
        maxOrderQuantity: 9999,
        stepQuantity: 1,
        stockQuantity: Number(product.stockQty ?? 0),
        isOutOfStock: Number(product.stockQty ?? 0) <= 0,
        totalSales: 0,
        isFeatured: false,
        discountPercentage: 0,
        lowStockThreshold: Number(product.minStockLevel ?? 0),
        createdAt: product.createdAt as Date | undefined,
        updatedAt: product.updatedAt as Date | undefined,
        unitOptions,
      });
    });

    return {
      products,
      pagination: {
        page: currentPage,
        limit,
        total: totalCount,
        totalPages,
        count: products.length,
        hasNext: totalPages > 0 && currentPage < totalPages,
        hasPrev: currentPage > 1,
      },
    };
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
        const fallbackProducts = data.data?.products || [];
        return {
          products: fallbackProducts,
          pagination: {
            page: 1,
            limit: Math.max(1, fallbackProducts.length || 1),
            total: fallbackProducts.length,
            totalPages: fallbackProducts.length > 0 ? 1 : 0,
            count: fallbackProducts.length,
            hasNext: false,
            hasPrev: false,
          },
        };
      }
      console.error('Fallback API fetch failed with status', resp.status);
    } catch (err) {
      console.error('Fallback API fetch error:', err);
    }
    return {
      products: [],
      pagination: {
        page: 1,
        limit: 1,
        total: 0,
        totalPages: 0,
        count: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}

export default async function ProductsIndex({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const spObj = await searchParams;
  // Normalize to query string
  const sp = new URLSearchParams();
  const allowed = ['search', 'categoryId', 'supplierId', 'minPrice', 'maxPrice', 'inStock', 'sort', 'page', 'limit'];
  for (const key of allowed) {
    const val = spObj[key];
    if (Array.isArray(val)) {
      for (const v of val) if (v != null) sp.append(key, String(v));
    } else if (val != null) {
      sp.set(key, String(val));
    }
  }
  const { products, pagination } = await getProducts(sp.toString());
  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = pagination.total === 0 ? 0 : start + products.length - 1;

  return (
    <>
      <PremiumPageHeader
        title="All Products"
        subtitle="Explore our curated selection of premium groceries, fresh from the source to your table."
        count={pagination.total}
      />
      <div className="container mx-auto px-4 md:px-8 pb-24">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sticky Filter Sidebar (Desktop) would go here if we separate it, 
                 for now assuming ProductsFilterBar handles it or is a top bar. 
                 Based on file name it seems like a bar. Let's keep it simple first. */}

          <div className="w-full space-y-8">
            <ProductsFilterBar />

            {pagination.total > 0 && (
              <div className="flex items-center justify-between text-sm text-zinc-500 border-b border-zinc-100 pb-4">
                <span>Showing {start}-{end} of {pagination.total} products</span>
                {/* Add sort dropdown here if distinct from filter bar later */}
              </div>
            )}

            <ProductGrid products={products} />

            {products.length > 0 && (
              <div className="pt-12 border-t border-zinc-100">
                <ProductsPagination
                  page={pagination.page}
                  limit={pagination.limit}
                  total={pagination.total}
                  currentCount={products.length}
                  hasPrev={pagination.hasPrev}
                  hasNext={pagination.hasNext}
                  totalPages={pagination.totalPages}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
