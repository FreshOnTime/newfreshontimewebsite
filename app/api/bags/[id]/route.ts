import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { BAG_INCLUDE, serializeBag, bagTotal } from '@/lib/bagSerializer';

type Ctx = { params: Promise<{ id: string }> };
type AuthedReq = NextRequest & { user?: { userId: string; role: string; mongoId?: string } };

// GET - Fetch a specific bag (owner only)
export const GET = requireAuth(async (request: AuthedReq, context: Ctx) => {
  try {
    const userId = request.user?.mongoId || request.user?.userId;
    const { id } = await context.params;

    const bag = await prisma.bag.findFirst({ where: { id, userId }, include: BAG_INCLUDE });
    if (!bag) return NextResponse.json({ error: 'Bag not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: serializeBag(bag) });
  } catch (error) {
    console.error('Error fetching bag:', error);
    return NextResponse.json({ error: 'Failed to fetch bag' }, { status: 500 });
  }
});

// PUT - Update a bag (owner only)
export const PUT = requireAuth(async (request: AuthedReq, context: Ctx) => {
  try {
    const userId = request.user?.mongoId || request.user?.userId;
    const { id } = await context.params;
    const body = await request.json();
    const { name, description, items, tags } = body;

    const existing = await prisma.bag.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: 'Bag not found' }, { status: 404 });

    let validatedItems: Array<{ productId: string; quantity: number; price: number }> | null = null;
    if (items) {
      validatedItems = [];
      for (const item of items) {
        const qty = Number(item.quantity);
        if (!Number.isFinite(qty) || qty <= 0) {
          return NextResponse.json({ error: 'Invalid item quantity' }, { status: 400 });
        }
        const ref = item.productId || item.product;
        const product = await prisma.product.findFirst({
          where: { OR: [{ id: ref }, { sku: ref }, { slug: ref }] },
        });
        if (!product) {
          return NextResponse.json({ error: `Product with ID ${ref} not found` }, { status: 400 });
        }
        if (product.stockQty < qty) {
          return NextResponse.json({ error: `Insufficient stock for product ${product.name}` }, { status: 400 });
        }
        validatedItems.push({ productId: product.id, quantity: qty, price: Number(product.price) });
      }
    }

    const bag = await prisma.$transaction(async (tx) => {
      if (validatedItems) {
        await tx.bagItem.deleteMany({ where: { bagId: id } });
        await tx.bagItem.createMany({ data: validatedItems.map((it) => ({ ...it, bagId: id })) });
      }
      return tx.bag.update({
        where: { id },
        data: {
          name: name ?? undefined,
          description: description !== undefined ? description : undefined,
          tags: Array.isArray(tags) ? tags : undefined,
          totalAmount: validatedItems ? bagTotal(validatedItems) : undefined,
        },
        include: BAG_INCLUDE,
      });
    });

    return NextResponse.json({ success: true, data: serializeBag(bag) });
  } catch (error) {
    console.error('Error updating bag:', error);
    return NextResponse.json({ error: 'Failed to update bag' }, { status: 500 });
  }
});

// DELETE - Soft-delete a bag (owner only)
export const DELETE = requireAuth(async (request: AuthedReq, context: Ctx) => {
  try {
    const userId = request.user?.mongoId || request.user?.userId;
    const { id } = await context.params;

    const existing = await prisma.bag.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: 'Bag not found' }, { status: 404 });

    await prisma.bag.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true, message: 'Bag deleted successfully' });
  } catch (error) {
    console.error('Error deleting bag:', error);
    return NextResponse.json({ error: 'Failed to delete bag' }, { status: 500 });
  }
});
