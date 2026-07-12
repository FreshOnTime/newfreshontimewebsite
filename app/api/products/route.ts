import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { productCardSelect, serializeProductCardForUi } from '@/lib/productSerializer';

// This endpoint backs type-ahead search and any client-side catalogue loading.
// Its responses are public and are safe to cache at the CDN; product writes
// already invalidate the server-side catalogue caches, while this bounds the
// CDN's stale window for visitors that do not hit a warm serverless worker.
const PUBLIC_CATALOG_CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=86400';

// GET /api/products - list products with optional filtering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const requestedPage = parseInt(searchParams.get('page') || '1', 10);
    const requestedLimit = parseInt(searchParams.get('limit') || '12', 10);
    const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
    // A bounded page protects the public route from an expensive unbounded
    // fetch (and limits JSON parsing/rendering work in the browser).
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(1, requestedLimit), 60) : 12;
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const supplierId = searchParams.get('supplierId');
    const archivedParam = searchParams.get('archived');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const inStockParam = searchParams.get('inStock');
    const sortParam = searchParams.get('sort');

    const where: Prisma.ProductWhereInput = {
      archived: archivedParam ? archivedParam === 'true' : false,
    };

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

    // Fetching one extra row is much cheaper than count() over every matching
    // product, especially through the remote Supabase connection. Product
    // cards deliberately exclude wide JSON fields and relations.
    const rawProducts = await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit + 1,
      select: productCardSelect,
    });
    const hasNext = rawProducts.length > limit;
    const products = rawProducts
      .slice(0, limit)
      .map((product) => serializeProductCardForUi(product));

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          count: products.length,
          hasNext,
          hasPrev: page > 1,
        },
      },
    }, {
      headers: { 'Cache-Control': PUBLIC_CATALOG_CACHE_CONTROL },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json({ error: 'Failed to retrieve products' }, { status: 500 });
  }
}
// Note: Product creation is handled via /api/admin/products
