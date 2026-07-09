import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { BAG_INCLUDE, serializeBag, bagTotal } from '@/lib/bagSerializer';

/**
 * POST /api/bags/reorder
 * Creates a new bag from a previous order's items (owner only).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user || !user.mongoId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.mongoId;

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId: userId },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const validItems: Array<{ productId: string; quantity: number; price: number }> = [];
    const unavailableItems: Array<{ name: string; reason: string }> = [];

    for (const item of order.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || product.archived) {
        unavailableItems.push({ name: item.name, reason: 'Product no longer available' });
        continue;
      }
      const requestedQty = item.qty;
      const availableQty = product.stockQty;
      if (availableQty < requestedQty) {
        if (availableQty === 0) {
          unavailableItems.push({ name: item.name, reason: 'Out of stock' });
          continue;
        }
        validItems.push({ productId: product.id, quantity: availableQty, price: Number(product.price) });
        unavailableItems.push({ name: item.name, reason: `Only ${availableQty} available (requested ${requestedQty})` });
      } else {
        validItems.push({ productId: product.id, quantity: requestedQty, price: Number(product.price) });
      }
    }

    if (validItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'None of the items from this order are currently available', unavailableItems },
        { status: 400 }
      );
    }

    const bag = await prisma.bag.create({
      data: {
        userId,
        name: `Reorder from #${order.orderNumber}`,
        description: `Quick reorder from order #${order.orderNumber}`,
        tags: ['reorder'],
        isActive: true,
        totalAmount: bagTotal(validItems),
        items: { create: validItems },
      },
      include: BAG_INCLUDE,
    });

    return NextResponse.json({
      success: true,
      message:
        unavailableItems.length > 0
          ? `Bag created with ${validItems.length} items. Some items were unavailable.`
          : 'All items added to bag successfully!',
      bag: serializeBag(bag),
      unavailableItems: unavailableItems.length > 0 ? unavailableItems : undefined,
    });
  } catch (error) {
    console.error('Error creating reorder bag:', error);
    return NextResponse.json({ success: false, message: 'Failed to create reorder bag' }, { status: 500 });
  }
}
