import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { BAG_INCLUDE, serializeBag, bagTotal } from '@/lib/bagSerializer';

type Ctx = { params: Promise<{ id: string }> };
type AuthedReq = NextRequest & { user?: { userId: string; role: string; mongoId?: string } };

async function recomputeAndReturn(bagId: string) {
  const items = await prisma.bagItem.findMany({ where: { bagId }, select: { price: true, quantity: true } });
  await prisma.bag.update({
    where: { id: bagId },
    data: { totalAmount: bagTotal(items.map((i) => ({ price: Number(i.price), quantity: i.quantity }))) },
  });
  const bag = await prisma.bag.findUnique({ where: { id: bagId }, include: BAG_INCLUDE });
  return bag ? serializeBag(bag) : null;
}

// POST - Add an item to a bag (owner only)
export const POST = requireAuth(async (request: AuthedReq, context: Ctx) => {
  try {
    const userId = request.user?.mongoId || request.user?.userId;
    const { id: bagId } = await context.params;
    const { productId, quantity } = await request.json();
    const qty = Number(quantity);

    if (!productId || !Number.isFinite(qty) || qty <= 0) {
      return NextResponse.json({ error: 'Product ID and valid quantity are required' }, { status: 400 });
    }

    const bag = await prisma.bag.findFirst({ where: { id: bagId, userId }, select: { id: true } });
    if (!bag) return NextResponse.json({ error: 'Bag not found' }, { status: 404 });

    const product = await prisma.product.findFirst({
      where: { OR: [{ id: productId }, { sku: productId }, { slug: productId }] },
    });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const existingItem = await prisma.bagItem.findUnique({
      where: { bagId_productId: { bagId, productId: product.id } },
    });
    const newQuantity = (existingItem?.quantity || 0) + qty;
    if (product.stockQty < newQuantity) {
      return NextResponse.json({ error: 'Insufficient stock for requested quantity' }, { status: 400 });
    }

    await prisma.bagItem.upsert({
      where: { bagId_productId: { bagId, productId: product.id } },
      update: { quantity: newQuantity, price: Number(product.price) },
      create: { bagId, productId: product.id, quantity: qty, price: Number(product.price) },
    });

    return NextResponse.json({ success: true, data: await recomputeAndReturn(bagId) });
  } catch (error) {
    console.error('Error adding item to bag:', error);
    return NextResponse.json({ error: 'Failed to add item to bag' }, { status: 500 });
  }
});

// DELETE - Remove an item from a bag (owner only)
export const DELETE = requireAuth(async (request: AuthedReq, context: Ctx) => {
  try {
    const userId = request.user?.mongoId || request.user?.userId;
    const { id: bagId } = await context.params;
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

    const bag = await prisma.bag.findFirst({ where: { id: bagId, userId }, select: { id: true } });
    if (!bag) return NextResponse.json({ error: 'Bag not found' }, { status: 404 });

    // productId may be a Product id, sku, or slug.
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: productId }, { sku: productId }, { slug: productId }] },
      select: { id: true },
    });
    if (product) {
      await prisma.bagItem.deleteMany({ where: { bagId, productId: product.id } });
    }

    return NextResponse.json({ success: true, data: await recomputeAndReturn(bagId) });
  } catch (error) {
    console.error('Error removing item from bag:', error);
    return NextResponse.json({ error: 'Failed to remove item from bag' }, { status: 500 });
  }
});
