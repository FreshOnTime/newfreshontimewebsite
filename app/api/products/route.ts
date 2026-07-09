import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { serializeProductForUi } from '@/lib/productSerializer';

// GET /api/products - list products with optional filtering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '12'));
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

    const [rawProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: { select: { name: true, slug: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    const products = rawProducts.map(serializeProductForUi);

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json({ error: 'Failed to retrieve products' }, { status: 500 });
  }
}
// Note: Product creation is handled via /api/admin/products
