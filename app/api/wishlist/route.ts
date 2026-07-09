import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { serializeProductForUi } from '@/lib/productSerializer';

type AuthedReq = NextRequest & { user?: { userId: string; role: string; mongoId?: string } };

// GET - the authenticated user's wishlist products
export const GET = requireAuth(async (req: AuthedReq) => {
  try {
    const userId = req.user?.mongoId || req.user?.userId;
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { product: { include: { category: { select: { name: true, slug: true } } } } },
    });

    const products = items.map((it) => serializeProductForUi(it.product));
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch wishlist' }, { status: 500 });
  }
});

// POST - add a product to the authenticated user's wishlist
export const POST = requireAuth(async (req: AuthedReq) => {
  try {
    const userId = req.user?.mongoId || req.user?.userId;
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });

    const product = await prisma.product.findFirst({
      where: { OR: [{ id: productId }, { sku: productId }, { slug: productId }] },
      select: { id: true },
    });
    if (!product) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });

    // Composite unique (userId, productId) makes this idempotent — no duplicates.
    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId: product.id } },
      update: {},
      create: { userId, productId: product.id },
    });

    return NextResponse.json({ success: true, message: 'Product added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ success: false, error: 'Failed to add to wishlist' }, { status: 500 });
  }
});
