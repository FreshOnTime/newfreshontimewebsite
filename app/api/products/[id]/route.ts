import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/database';
import EnhancedProduct from '@/lib/models/EnhancedProduct';
import Category from '@/lib/models/Category';
import { requireRoles, AuthenticatedRequest } from '@/lib/middleware/auth';
import { sendSuccess, sendNotFound, sendInternalError, sendBadRequest } from '@/lib/utils/apiResponses';

// GET /api/products/[id] - Get a single product
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const id = params.id;
    
    if (!id) {
      return sendBadRequest('Product ID is required');
    }

    // Support id as Mongo _id, sku, or slug
    interface EnhancedProductLean {
      _id: mongoose.Types.ObjectId;
      sku: string;
      slug: string;
      name: string;
      images: string[];
      description?: string;
      price: number;
      stockQty: number;
      minStockLevel?: number;
      categoryId?: mongoose.Types.ObjectId;
      createdAt?: Date;
      updatedAt?: Date;
    }

  let p: EnhancedProductLean | null = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
  p = (await EnhancedProduct.findById(id).lean()) as unknown as EnhancedProductLean | null;
    }
    if (!p) {
  p = (await EnhancedProduct.findOne({ $or: [{ sku: id }, { slug: id }] }).lean()) as unknown as EnhancedProductLean | null;
    }
    if (!p) {
      return sendNotFound('Product not found');
    }

  const attrs = (p as unknown as { attributes?: Record<string, unknown> }).attributes || {};
  // Fetch category meta (name, slug)
  let categoryMeta: { id: string; name: string; slug: string } | undefined = undefined;
  if (p.categoryId) {
    try {
      const cat = (await Category.findById(p.categoryId).select('name slug').lean()) as unknown as { _id: unknown; name?: string; slug?: string } | null;
      if (cat) categoryMeta = { id: String(p.categoryId), name: cat.name || '', slug: cat.slug || '' };
    } catch {}
  }
  const maybeUnitOptions = (attrs as { unitOptions?: unknown }).unitOptions;
  const unitOptions = Array.isArray(maybeUnitOptions)
    ? maybeUnitOptions
        .map((opt) => {
          const o = opt as Partial<{ label: unknown; quantity: unknown; unit: unknown; price: unknown }>;
          const unit = typeof o.unit === 'string' && ['g','kg','ml','l','ea','lb'].includes(o.unit)
            ? (o.unit as 'g'|'kg'|'ml'|'l'|'ea'|'lb')
            : undefined;
          const quantity = typeof o.quantity === 'number' && isFinite(o.quantity) && o.quantity > 0 ? o.quantity : undefined;
          const price = typeof o.price === 'number' && isFinite(o.price) && o.price >= 0 ? o.price : undefined;
          const label = typeof o.label === 'string' && o.label.trim().length > 0 ? o.label : undefined;
          if (!unit || !quantity || price === undefined) return null;
          return { label: label || `${quantity}${unit}`, quantity, unit, price };
        })
        .filter(Boolean) as Array<{ label: string; quantity: number; unit: 'g'|'kg'|'ml'|'l'|'ea'|'lb'; price: number }>
    : undefined;

  const product = {
      sku: String(p.sku || p._id),
      name: p.name || '',
      image: {
  url: Array.isArray(p.images) && p.images[0] ? String(p.images[0]) : '/placeholder.svg',
        filename: '',
        contentType: '',
  path: Array.isArray(p.images) && p.images[0] ? String(p.images[0]) : '/placeholder.svg',
        alt: p.name || undefined,
      },
      description: p.description || '',
  category: categoryMeta,
      baseMeasurementQuantity: 1,
      pricePerBaseQuantity: Number(p.price ?? 0),
      measurementUnit: 'ea' as const,
      isSoldAsUnit: true,
      minOrderQuantity: 1,
      maxOrderQuantity: 9999,
      stepQuantity: 1,
      stockQuantity: Number(p.stockQty ?? 0),
      isOutOfStock: Number(p.stockQty ?? 0) <= 0,
      totalSales: 0,
      isFeatured: false,
      discountPercentage: 0,
  lowStockThreshold: Number(p.minStockLevel ?? 0),
  createdAt: p.createdAt as unknown as Date | undefined,
      createdBy: undefined,
  updatedAt: p.updatedAt as unknown as Date | undefined,
      updatedBy: undefined,
      ingredients: undefined,
      nutritionFacts: undefined,
  unitOptions,
    };

    return sendSuccess('Product retrieved successfully', product);
  } catch (error) {
    console.error('Get product error:', error);
    return sendInternalError('Failed to retrieve product');
  }
}

// PUT handler function
async function handleUpdateProduct(
  req: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const id = (await context.params).id;
    if (!id) return sendBadRequest('Product ID is required');

    const updateData = await req.json();
    const updated = await EnhancedProduct.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return sendNotFound('Product not found');
    return sendSuccess('Product updated successfully', updated);
  } catch (error) {
    console.error('Update product error:', error);
    return sendInternalError('Failed to update product');
  }
}

// Export wrapped function
export const PUT = requireRoles(['admin', 'inventory_manager'])(handleUpdateProduct);

// DELETE handler function
async function handleDeleteProduct(
  req: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const id = (await context.params).id;
    if (!id) return sendBadRequest('Product ID is required');

    const deleted = await EnhancedProduct.findByIdAndDelete(id);
    if (!deleted) return sendNotFound('Product not found');
    return sendSuccess('Product deleted successfully');
  } catch (error) {
    console.error('Delete product error:', error);
    return sendInternalError('Failed to delete product');
  }
}

// Export wrapped function
export const DELETE = requireRoles(['admin', 'inventory_manager'])(handleDeleteProduct);
