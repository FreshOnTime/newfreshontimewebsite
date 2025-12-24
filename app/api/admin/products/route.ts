import { NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import connectDB from '@/lib/database';
import EnhancedProduct from '@/lib/models/EnhancedProduct';
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
  categoryId: z.string().refine((v) => mongoose.Types.ObjectId.isValid(v), 'Invalid categoryId'),
  supplierId: z.string().refine((v) => mongoose.Types.ObjectId.isValid(v), 'Invalid supplierId'),
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
});

const querySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(parseInt(v), 100) : 20)),
  search: z.string().optional(),
  archived: z.string().optional(),
});

export const GET = requireAdminSimple(async (request) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const filter: Record<string, unknown> = {};
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { sku: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.archived !== undefined) {
      filter.archived = query.archived === 'true';
    } else {
      filter.archived = false;
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      EnhancedProduct.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      EnhancedProduct.countDocuments(filter),
    ]);

    return NextResponse.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
});

export const POST = requireAdminSimple(async (request) => {
  try {
    await connectDB();
    const body = await request.json();
    const data = createProductSchema.parse(body);

    // Normalize SKU for uniqueness (schema uppercases on save)
    const normalizedSku = data.sku.toUpperCase().trim();

    // ensure SKU unique
    const existing = await EnhancedProduct.findOne({ sku: normalizedSku });
    if (existing) {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 400 });
    }

    // if slug not provided, generate from name
    const slug = (data.slug || data.name)
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Ensure slug unique
    const slugExists = await EnhancedProduct.findOne({ slug });
    if (slugExists) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    // Merge unitOptions into attributes for persistence if provided
    const attributes = {
      ...(data.attributes || {}),
      ...(data.unitOptions ? { unitOptions: data.unitOptions } : {}),
    } as Record<string, unknown>;

    const rest: Record<string, unknown> = { ...(data as Record<string, unknown>) };
    delete (rest as Record<string, unknown>)["unitOptions"];
    delete (rest as Record<string, unknown>)["attributes"];

    const product = await EnhancedProduct.create({ ...rest, attributes, sku: normalizedSku, slug });

    await logAuditAction(request.user!.userId, 'create', 'product', product._id.toString(), undefined, product.toObject(), request);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    // Handle duplicate key errors gracefully
    const err = error as { code?: number; keyPattern?: Record<string, unknown>; keyValue?: Record<string, unknown> };
    if (err && err.code === 11000) {
      const field = err.keyPattern && Object.keys(err.keyPattern)[0];
      const message = field ? `${field} already exists` : 'Duplicate key error';
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
});
