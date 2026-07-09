import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

type Ctx = { params: Promise<{ productId: string }> };
type AuthedReq = NextRequest & { user?: { userId: string; role: string; mongoId?: string } };

// DELETE - remove a product from the authenticated user's wishlist (owner only)
export const DELETE = requireAuth(async (req: AuthedReq, context: Ctx) => {
  try {
    const userId = req.user?.mongoId || req.user?.userId;
    const { productId } = await context.params;
    if (!productId) return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });

    const product = await prisma.product.findFirst({
      where: { OR: [{ id: productId }, { sku: productId }, { slug: productId }] },
      select: { id: true },
    });
    if (product && userId) {
      await prisma.wishlistItem.deleteMany({ where: { userId, productId: product.id } });
    }

    return NextResponse.json({ success: true, message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove from wishlist' }, { status: 500 });
  }
});
