import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { productCardSelect, serializeProductCardForUi } from '@/lib/productSerializer';

export const revalidate = 300;

export async function GET() {
  try {
    const [rawProducts, allCategories] = await Promise.all([
      prisma.product.findMany({
        where: { archived: false },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: productCardSelect,
      }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, slug: true, description: true, imageUrl: true },
      }),
    ]);

    return NextResponse.json(
      {
        products: rawProducts.map(serializeProductCardForUi),
        categories: allCategories.map((category) => ({
          _id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description ?? undefined,
          imageUrl: category.imageUrl ?? undefined,
        })),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      },
    );
  } catch (error) {
    console.error('[Storefront Home API] Failed to fetch homepage data:', error);
    return NextResponse.json({ products: [], categories: [] }, { status: 500 });
  }
}
