import ProductGrid from "@/components/products/ProductGrid";
// import SectionHeader from "@/components/home/SectionHeader"; 
// import { PageContainer } from "@/components/templates/PageContainer";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import ProductsFilterBar from "@/components/products/ProductsFilterBar";
import ProductsSidebar from "@/components/products/ProductsSidebar";
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
    const tagsParam = urlParams.get('tags'); // New: Tags support

    const filter: Record<string, unknown> = {};
    filter.archived = archivedParam ? archivedParam === 'true' : false;

    // Tag filtering (supports comma separated)
    if (tagsParam) {
      const tags = tagsParam.split(',').filter(Boolean);
      if (tags.length > 0) {
        // Using $all to ensure product has ALL selected tags (stricter)
        // Or use $in for ANY of the selected tags. Often for sidebar filters, OR is more common within a group, 
        // but if we treat diet + origin as one tag list, it depends.
        // Let's use $in for now as "Match any of these attributes" is friendlier for exploration.
        // Actually, if I select "Vegan" AND "Local", I probably want both.
        // But if I select "Local" OR "Imported", I want either.
        // Since we pass them all as one 'tags' param, simple approach is $in.
        // For precision, we might need separate params, but let's start with $in.
        // Wait, the UI passes 'tags' as a single comma list.
        filter.tags = { $in: tags.map(t => new RegExp(t, 'i')) };
      }
    }

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

// Helper to safely get string values from query params
function getString(val: string | string[] | undefined): string | undefined {
  if (Array.isArray(val)) return val[0];
  return val;
}

export default async function ProductsIndex({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const spObj = await searchParams;
  // Normalize to query string
  const sp = new URLSearchParams();
  const allowed = ['search', 'categoryId', 'supplierId', 'minPrice', 'maxPrice', 'inStock', 'sort', 'page', 'limit', 'tags'];

  for (const key of allowed) {
    const val = spObj[key];
    if (Array.isArray(val)) {
      // For tags or multi-value fields, join them if needed, or append multiple
      // tags usually come as comma-separated in my implementation plan, let's treat as such
      if (key === 'tags') {
        sp.set(key, val.join(','));
      } else {
        for (const v of val) if (v != null) sp.append(key, String(v));
      }
    } else if (val != null) {
      sp.set(key, String(val));
    }
  }

  const { products, pagination } = await getProducts(sp.toString());
  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = pagination.total === 0 ? 0 : start + products.length - 1;

  return (
    <div className="min-h-screen bg-white">
      {/* Premium Header */}
      <div className="bg-zinc-950 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 to-zinc-950"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl">
            <span className="text-emerald-500 font-bold tracking-[0.3em] text-xs uppercase mb-6 block">
              The Collection
            </span>
            <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6 tracking-tight">Curated Harvests</h1>
            <p className="text-xl text-zinc-400 font-light leading-relaxed">
              Explore our selection of premium groceries, sourced directly from the world's finest producers.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-16">

        {/* Products Filter Bar - Horizontal */}
        <div className="sticky top-0 z-20">
          <ProductsFilterBar />
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100">
            <span className="text-zinc-500 font-serif italic text-sm">
              {pagination.total === 0 ? 'No items found' : `Showing ${start}-${end} of ${pagination.total} results`}
            </span>
          </div>

          {products.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-zinc-200 rounded-lg">
              <p className="text-zinc-400 font-serif text-lg italic mb-2">No products match your criteria.</p>
              <a href="/products" className="text-xs font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700">Clear all filters</a>
            </div>
          ) : (
            <ProductGrid products={products} className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12" />
          )}

          {pagination.total > 0 && (
            <div className="pt-16 mt-8 border-t border-zinc-100 flex justify-center">
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
  );
}
