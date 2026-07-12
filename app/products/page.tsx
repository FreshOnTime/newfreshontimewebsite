import ProductGrid from "@/components/products/ProductGrid";
// import SectionHeader from "@/components/home/SectionHeader"; 
// import { PageContainer } from "@/components/templates/PageContainer";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import ProductsFilterBar from "@/components/products/ProductsFilterBar";
import ProductsPagination from "@/components/products/ProductsPagination";

import { Prisma } from '@prisma/client';
import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';
import { productCardSelect, serializeProductCardForUi } from '@/lib/productSerializer';
import { Product } from '@/models/product';

// Read directly from the database in server components to avoid relying on internal API fetch
const getProducts = unstable_cache(async (query: string) => {
  try {
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

    const where: Prisma.ProductWhereInput = {
      archived: archivedParam ? archivedParam === 'true' : false,
    };

    // Tag filtering (supports comma separated)
    if (tagsParam) {
      const tags = tagsParam.split(',').filter(Boolean);
      if (tags.length > 0) {
        where.tags = { hasSome: tags };
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;

    const minPrice = minPriceParam ? parseFloat(minPriceParam) : undefined;
    const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : undefined;
    if ((typeof minPrice === 'number' && isFinite(minPrice)) || (typeof maxPrice === 'number' && isFinite(maxPrice))) {
      where.price = {};
      if (typeof minPrice === 'number' && isFinite(minPrice)) where.price.gte = minPrice;
      if (typeof maxPrice === 'number' && isFinite(maxPrice)) where.price.lte = maxPrice;
    }
    if (inStockParam === 'true') where.stockQty = { gt: 0 };

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortParam === 'price-asc') orderBy = { price: 'asc' };
    else if (sortParam === 'price-desc') orderBy = { price: 'desc' };
    else if (sortParam === 'oldest') orderBy = { createdAt: 'asc' };

    // Fetch one extra row to determine whether a next page exists. Supabase's
    // transaction pool is intentionally configured with one Prisma connection
    // per serverless worker, so a separate count() doubles uncached latency.
    const rawProducts = await prisma.product.findMany({
      where,
      orderBy,
      skip: Math.max(0, (page - 1) * limit),
      take: limit + 1,
      select: productCardSelect,
    });
    const hasNext = rawProducts.length > limit;
    const products = rawProducts
      .slice(0, limit)
      .map((product) => serializeProductCardForUi(product) as Product);

    return {
      products,
      pagination: {
        page,
        limit,
        count: products.length,
        hasNext,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error('Failed to get products from DB:', error);
    // Do not call our own HTTP API here. It reaches the same database and used
    // to turn one failure into two additional slow serverless requests.
    return {
      products: [],
      pagination: {
        page: 1,
        limit: 1,
        count: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}, ['storefront-products-v3'], { revalidate: 300, tags: ['products'] });

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
  const start = products.length === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = products.length === 0 ? 0 : start + products.length - 1;

  return (
    <div className="min-h-screen bg-white">
      <PremiumPageHeader title="Curated Harvests" subtitle="Exceptional groceries, pantry essentials, and local discoveries selected for freshness, provenance, and flavour." eyebrow="The collection" />

      <div className="container mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">

        {/* Products Filter Bar - Horizontal */}
        <div className="sticky top-0 z-20">
          <ProductsFilterBar />
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100">
            <span className="text-zinc-500 font-serif italic text-sm">
              {products.length === 0 ? 'No items found' : `Showing items ${start}-${end}`}
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

          {(products.length > 0 || pagination.hasPrev) && (
            <div className="pt-16 mt-8 border-t border-zinc-100 flex justify-center">
              <ProductsPagination
                page={pagination.page}
                limit={pagination.limit}
                currentCount={products.length}
                hasPrev={pagination.hasPrev}
                hasNext={pagination.hasNext}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
