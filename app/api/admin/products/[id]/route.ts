import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma, type Product } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin, logAuditAction } from '@/lib/middleware/adminAuth';

const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  sku: z.string().min(1).max(100).optional(),
  slug: z.string().optional(),
  description: z.string().max(2000).optional(),
  price: z.number().nonnegative().optional(),
  costPrice: z.number().nonnegative().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  stockQty: z.number().int().nonnegative().optional(),
  minStockLevel: z.number().int().nonnegative().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  attributes: z.record(z.any()).optional(),
  archived: z.boolean().optional(),
});

type ProductRouteContext = { params: Promise<{ id: string }> };

function slugify(value: string) {
  return value.toString().trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

function serializeAdminProduct(p: Product) {
  return {
    ...p,
    _id: p.id,
    price: Number(p.price),
    costPrice: Number(p.costPrice),
    discountPercentage: Number(p.discountPercentage),
  };
}

export const GET = requireAdmin(async (_request, { params }: ProductRouteContext) => {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ product: serializeAdminProduct(product) });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
});

export const PUT = requireAdmin(async (request, { params }: ProductRouteContext) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateProductSchema.parse(body);

    const before = await prisma.product.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (data.sku && data.sku.toUpperCase().trim() !== before.sku) {
      const exists = await prisma.product.findUnique({ where: { sku: data.sku.toUpperCase().trim() } });
      if (exists && exists.id !== id) return NextResponse.json({ error: 'SKU already exists' }, { status: 400 });
    }

    const nextSlug = data.slug && data.slug.trim().length > 0 ? slugify(data.slug) : undefined;
    if (nextSlug && nextSlug !== before.slug) {
      const exists = await prisma.product.findUnique({ where: { slug: nextSlug } });
      if (exists && exists.id !== id) return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    const update: Prisma.ProductUpdateInput = {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.sku !== undefined ? { sku: data.sku.toUpperCase().trim() } : {}),
      ...(nextSlug !== undefined ? { slug: nextSlug } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.costPrice !== undefined ? { costPrice: data.costPrice } : {}),
      ...(data.categoryId !== undefined ? { category: { connect: { id: data.categoryId } } } : {}),
      ...(data.supplierId !== undefined ? { supplier: data.supplierId ? { connect: { id: data.supplierId } } : { disconnect: true } } : {}),
      ...(data.stockQty !== undefined ? { stockQty: data.stockQty } : {}),
      ...(data.minStockLevel !== undefined ? { minStockLevel: data.minStockLevel } : {}),
      ...(data.image !== undefined ? { image: data.image } : {}),
      ...(data.images !== undefined ? { images: data.images } : {}),
      ...(data.tags !== undefined ? { tags: data.tags } : {}),
      ...(data.attributes !== undefined ? { attributes: data.attributes as Prisma.InputJsonValue } : {}),
      ...(data.archived !== undefined ? { archived: data.archived } : {}),
    };

    const updated = await prisma.product.update({ where: { id }, data: update });
    const beforeSerialized = serializeAdminProduct(before);
    const updatedSerialized = serializeAdminProduct(updated);
    await logAuditAction(request.user!.userId, 'update', 'product', id, beforeSerialized, updatedSerialized, request);

    return NextResponse.json({ product: updatedSerialized });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (request, { params }: ProductRouteContext) => {
  try {
    const { id } = await params;
    const before = await prisma.product.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    await prisma.product.delete({ where: { id } });
    await logAuditAction(request.user!.userId, 'delete', 'product', id, serializeAdminProduct(before), undefined, request);
    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
});
