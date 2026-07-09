import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { BAG_INCLUDE, serializeBag, bagTotal } from '@/lib/bagSerializer';

// GET - Fetch the authenticated user's active bags
export const GET = requireAuth(async (request: NextRequest & { user?: { userId: string; role: string; mongoId?: string } }) => {
  try {
    const userId = request.user?.mongoId || request.user?.userId;
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const bags = await prisma.bag.findMany({
      where: { userId, isActive: true },
      include: BAG_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: bags.map(serializeBag) });
  } catch (error) {
    console.error('Error fetching bags:', error);
    return NextResponse.json({ error: 'Failed to fetch bags' }, { status: 500 });
  }
});

// POST - Create a new bag for the authenticated user
export const POST = requireAuth(async (request: NextRequest & { user?: { userId: string; role: string; mongoId?: string } }) => {
  try {
    const userId = request.user?.mongoId || request.user?.userId;
    const body = await request.json();
    const { name, description, items, tags } = body;

    if (!userId || !name || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Authentication, name, and items are required' }, { status: 400 });
    }

    const validatedItems: Array<{ productId: string; quantity: number; price: number }> = [];
    for (const item of items) {
      const qty = Number(item.quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        return NextResponse.json({ error: 'Invalid item quantity' }, { status: 400 });
      }
      const product = await prisma.product.findFirst({
        where: { OR: [{ id: item.productId }, { sku: item.productId }, { slug: item.productId }] },
      });
      if (!product) {
        return NextResponse.json({ error: `Product with ID ${item.productId} not found` }, { status: 400 });
      }
      if (product.stockQty < qty) {
        return NextResponse.json({ error: `Insufficient stock for product ${product.name}` }, { status: 400 });
      }
      validatedItems.push({ productId: product.id, quantity: qty, price: Number(product.price) });
    }

    const bag = await prisma.bag.create({
      data: {
        userId,
        name,
        description: description || null,
        tags: Array.isArray(tags) ? tags : [],
        totalAmount: bagTotal(validatedItems),
        items: { create: validatedItems },
      },
      include: BAG_INCLUDE,
    });

    return NextResponse.json({ success: true, data: serializeBag(bag) }, { status: 201 });
  } catch (error) {
    console.error('Error creating bag:', error);
    return NextResponse.json({ error: 'Failed to create bag' }, { status: 500 });
  }
});
