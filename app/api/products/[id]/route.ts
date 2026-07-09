import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireRoles, AuthenticatedRequest } from '@/lib/middleware/auth';
import { serializeProductForUi } from '@/lib/productSerializer';
import { sendSuccess, sendNotFound, sendInternalError, sendBadRequest } from '@/lib/utils/apiResponses';

function resolveWhere(id: string): Prisma.ProductWhereInput {
  return { OR: [{ id }, { sku: id }, { slug: id }] };
}

// GET /api/products/[id] - single product by id, sku, or slug
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    if (!id) return sendBadRequest('Product ID is required');

    const p = await prisma.product.findFirst({
      where: resolveWhere(id),
      include: { category: { select: { name: true, slug: true } } },
    });

    if (!p) return sendNotFound('Product not found');

    return sendSuccess('Product retrieved successfully', serializeProductForUi(p));
  } catch (error) {
    console.error('Get product error:', error);
    return sendInternalError('Failed to retrieve product');
  }
}

// PUT /api/products/[id] - update (admin / inventory_manager)
async function handleUpdateProduct(req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const id = (await context.params).id;
    if (!id) return sendBadRequest('Product ID is required');

    const target = await prisma.product.findFirst({ where: resolveWhere(id), select: { id: true } });
    if (!target) return sendNotFound('Product not found');

    const body = (await req.json()) as Record<string, unknown>;
    const allowed = [
      'name', 'sku', 'slug', 'description', 'price', 'costPrice', 'categoryId', 'supplierId',
      'stockQty', 'minStockLevel', 'image', 'images', 'tags', 'attributes', 'archived',
      'weight', 'isBundle', 'isFeatured', 'discountPercentage',
    ] as const;
    const data: Prisma.ProductUpdateInput = {};
    for (const key of allowed) {
      if (body[key] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data as any)[key] = body[key];
      }
    }

    const updated = await prisma.product.update({ where: { id: target.id }, data });
    return sendSuccess('Product updated successfully', updated);
  } catch (error) {
    console.error('Update product error:', error);
    return sendInternalError('Failed to update product');
  }
}

export const PUT = requireRoles(['admin', 'inventory_manager'])(handleUpdateProduct);

// DELETE /api/products/[id] - soft delete (archive) so orders keep referring to it
async function handleDeleteProduct(req: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const id = (await context.params).id;
    if (!id) return sendBadRequest('Product ID is required');

    const target = await prisma.product.findFirst({ where: resolveWhere(id), select: { id: true } });
    if (!target) return sendNotFound('Product not found');

    await prisma.product.update({ where: { id: target.id }, data: { archived: true } });
    return sendSuccess('Product archived successfully');
  } catch (error) {
    console.error('Delete product error:', error);
    return sendInternalError('Failed to delete product');
  }
}

export const DELETE = requireRoles(['admin', 'inventory_manager'])(handleDeleteProduct);
