import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const filters = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().trim().max(100).optional(),
});

export const GET = requireAuth(async (request: NextRequest & { user?: { userId: string; mongoId?: string; role?: string } }) => {
  try {
    const auth = request.user;
    if (!auth) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const userId = auth.mongoId || auth.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        supplier: { select: { id: true, applicationStatus: true, status: true } },
      },
    });
    const supplier = user?.supplier;
    if (!supplier) return NextResponse.json({ error: 'Supplier account is not linked' }, { status: 403 });
    if (supplier.applicationStatus !== 'approved' || supplier.status !== 'active') {
      return NextResponse.json({ error: 'Supplier approval is required before catalogue access' }, { status: 403 });
    }

    const { page, limit, search } = filters.parse(Object.fromEntries(new URL(request.url).searchParams));
    const where = {
      supplierId: supplier.id,
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { sku: { contains: search, mode: 'insensitive' as const } },
        ],
      } : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map(product => ({
        id: product.id,
        sku: product.sku,
        name: product.name,
        price: Number(product.price),
        costPrice: Number(product.costPrice),
        stockQty: product.stockQty,
        minStockLevel: product.minStockLevel,
        archived: product.archived,
        category: product.category,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })),
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid product filters' }, { status: 400 });
    console.error('Supplier product list failed', error);
    return NextResponse.json({ error: 'Unable to load supplier products' }, { status: 500 });
  }
});
