import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma, Product } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdminSimple, logAuditAction } from '@/lib/middleware/adminAuth';

const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().min(1).max(100),
  slug: z
    .string()
    .max(200)
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v : undefined)),
  description: z.string().max(2000).optional(),
  price: z.number().nonnegative(),
  costPrice: z.number().nonnegative(),
  categoryId: z.string().min(1, 'Invalid categoryId'),
  supplierId: z.string().optional(),
  stockQty: z.number().int().nonnegative().default(0),
  minStockLevel: z.number().int().nonnegative().default(5),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  attributes: z.record(z.any()).optional(),
  unitOptions: z
    .array(
      z.object({
        label: z.string().min(1),
        quantity: z.number().positive(),
        unit: z.enum(['g', 'kg', 'ml', 'l', 'ea', 'lb']),
        price: z.number().min(0),
      })
    )
    .optional(),
  isBundle: z.boolean().optional(),
  bundleItems: z.array(z.object({
    product: z.string(),
    quantity: z.number().positive()
  })).optional(),
}).superRefine((data, ctx) => {
  if (!data.isBundle && !data.supplierId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Supplier ID is required for non-bundle products",
      path: ["supplierId"],
    });
  }
});

const querySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(parseInt(v), 100) : 20)),
  search: z.string().optional(),
  archived: z.string().optional(),
  bundles: z.string().optional(),
});

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

export const GET = requireAdminSimple(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const where: Prisma.ProductWhereInput = {};
    if (query.bundles === 'true') {
      where.isBundle = true;
    } else if (query.bundles !== 'all') {
      where.isBundle = false;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.archived !== undefined) {
      where.archived = query.archived === 'true';
    } else {
      where.archived = false;
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map(serializeAdminProduct),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
});

export const POST = requireAdminSimple(async (request) => {
  try {
    const body = await request.json();
    const data = createProductSchema.parse(body);

    // Normalize SKU for uniqueness (schema uppercases on save)
    const normalizedSku = data.sku.toUpperCase().trim();

    // ensure SKU unique
    const existing = await prisma.product.findUnique({ where: { sku: normalizedSku } });
    if (existing) {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 400 });
    }

    // if slug not provided, generate from name
    const slug = slugify(data.slug || data.name);

    // Ensure slug unique
    const slugExists = await prisma.product.findUnique({ where: { slug } });
    if (slugExists) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    // Merge unitOptions into attributes for persistence if provided
    const attributes = {
      ...(data.attributes || {}),
      ...(data.unitOptions ? { unitOptions: data.unitOptions } : {}),
    } as Record<string, unknown>;

    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: normalizedSku,
        slug,
        description: data.description ?? null,
        price: data.price,
        costPrice: data.costPrice,
        categoryId: data.categoryId,
        supplierId: data.supplierId || null,
        stockQty: data.stockQty,
        minStockLevel: data.minStockLevel,
        image: data.image ?? null,
        images: data.images ?? [],
        tags: data.tags ?? [],
        attributes: attributes as Prisma.InputJsonValue,
        isBundle: data.isBundle ?? false,
        ...(data.isBundle && data.bundleItems?.length
          ? {
              bundleParts: {
                create: data.bundleItems.map((item) => ({
                  productId: item.product,
                  quantity: item.quantity,
                })),
              },
            }
          : {}),
      },
    });

    const serialized = serializeAdminProduct(product);
    await logAuditAction(request.user!.userId, 'create', 'product', product.id, undefined, serialized, request);

    return NextResponse.json({ success: true, product: serialized }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Duplicate product field' }, { status: 400 });
    }
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
});
