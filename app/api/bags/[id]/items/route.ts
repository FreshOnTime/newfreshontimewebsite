import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { productUnitPrice } from '@/lib/commercePricing';
import { requireAuth } from '@/lib/auth';
import { BAG_INCLUDE, serializeBag, bagTotal } from '@/lib/bagSerializer';

type Ctx = { params: Promise<{ id: string }> };
type AuthedReq = NextRequest & { user?: { userId: string; role: string; mongoId?: string } };

class BagMutationError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

function failure(error: unknown, action: string) {
  if (error instanceof BagMutationError) return NextResponse.json({ error: error.message }, { status: error.status });
  console.error(`Error ${action} bag item:`, error);
  return NextResponse.json({ error: 'Could not update this bag' }, { status: 500 });
}

function validQuantity(value: unknown, allowZero = false) {
  const quantity = Number(value);
  if (!Number.isSafeInteger(quantity) || quantity > 10000 || quantity < (allowZero ? 0 : 1)) {
    throw new BagMutationError('Choose a valid whole-number quantity');
  }
  return quantity;
}

// Serialize every mutation for a bag across serverless instances by locking
// the owning bag row. Reads, writes and total recalculation share one transaction.
async function withLockedBag(
  userId: string,
  bagId: string,
  operation: (tx: Prisma.TransactionClient) => Promise<void>,
) {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM bags WHERE id = ${bagId} AND "userId" = ${userId}
      AND "isActive" = true FOR UPDATE
    `;
    if (!rows.length) throw new BagMutationError('Bag not found', 404);

    await operation(tx);
    const items = await tx.bagItem.findMany({
      where: { bagId }, select: { price: true, quantity: true },
    });
    const bag = await tx.bag.update({
      where: { id: bagId },
      data: { totalAmount: bagTotal(items.map((item) => ({
        price: Number(item.price), quantity: item.quantity,
      }))) },
      include: BAG_INCLUDE,
    });
    return serializeBag(bag);
  });
}

async function findProduct(tx: Prisma.TransactionClient, productId: string, allowArchived = false) {
  return tx.product.findFirst({
    where: {
      ...(allowArchived ? {} : { archived: false }),
      OR: [{ id: productId }, { sku: productId }, { slug: productId }],
    },
  });
}

async function bodyValues(request: NextRequest, allowZero = false) {
  const body = await request.json().catch(() => null);
  if (typeof body?.productId !== 'string' || !body.productId.trim() || body.productId.length > 200) {
    throw new BagMutationError('Product ID is required');
  }
  return { productId: body.productId, quantity: validQuantity(body.quantity, allowZero) };
}

export const POST = requireAuth(async (request: AuthedReq, context: Ctx) => {
  try {
    const { productId, quantity } = await bodyValues(request);
    const userId = request.user?.mongoId || request.user?.userId;
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const { id: bagId } = await context.params;

    const data = await withLockedBag(userId, bagId, async (tx) => {
      const product = await findProduct(tx, productId);
      if (!product) throw new BagMutationError('Product not found', 404);
      const existing = await tx.bagItem.findUnique({
        where: { bagId_productId: { bagId, productId: product.id } },
        select: { quantity: true },
      });
      const nextQuantity = (existing?.quantity || 0) + quantity;
      if (nextQuantity > 10000 || nextQuantity > product.stockQty) {
        throw new BagMutationError('Insufficient stock for requested quantity', 409);
      }
      await tx.bagItem.upsert({
        where: { bagId_productId: { bagId, productId: product.id } },
        update: { quantity: { increment: quantity }, price: productUnitPrice(product) },
        create: { bagId, productId: product.id, quantity, price: productUnitPrice(product) },
      });
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return failure(error, 'adding');
  }
});

export const PATCH = requireAuth(async (request: AuthedReq, context: Ctx) => {
  try {
    const { productId, quantity } = await bodyValues(request, true);
    const userId = request.user?.mongoId || request.user?.userId;
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const { id: bagId } = await context.params;
    const data = await withLockedBag(userId, bagId, async (tx) => {
      const product = await findProduct(tx, productId, quantity === 0);
      if (!product) throw new BagMutationError('Product not found', 404);
      if (quantity === 0) {
        await tx.bagItem.deleteMany({ where: { bagId, productId: product.id } });
      } else {
        if (quantity > product.stockQty) throw new BagMutationError('Insufficient stock for requested quantity', 409);
        await tx.bagItem.upsert({
          where: { bagId_productId: { bagId, productId: product.id } },
          update: { quantity, price: productUnitPrice(product) },
          create: { bagId, productId: product.id, quantity, price: productUnitPrice(product) },
        });
      }
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return failure(error, 'updating');
  }
});

export const DELETE = requireAuth(async (request: AuthedReq, context: Ctx) => {
  try {
    const userId = request.user?.mongoId || request.user?.userId;
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const { id: bagId } = await context.params;
    const productId = new URL(request.url).searchParams.get('productId');
    if (!productId || productId.length > 200) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

    const data = await withLockedBag(userId, bagId, async (tx) => {
      const product = await findProduct(tx, productId, true);
      if (product) await tx.bagItem.deleteMany({ where: { bagId, productId: product.id } });
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return failure(error, 'removing');
  }
});
