import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import EnhancedProduct from '@/lib/models/EnhancedProduct';
import Category from '@/lib/models/Category';

// GET /api/products - Get all products with optional filtering
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const supplierId = searchParams.get('supplierId');
    const archivedParam = searchParams.get('archived');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const inStockParam = searchParams.get('inStock');
    const sortParam = searchParams.get('sort'); // 'price-asc' | 'price-desc' | 'newest' | 'oldest'

    const filter: Record<string, unknown> = {};
    // Only non-archived by default
    filter.archived = archivedParam ? archivedParam === 'true' : false;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (supplierId) {
      filter.supplierId = supplierId;
    }

    // Price range filter
    const priceFilter: Record<string, unknown> = {};
    const minPrice = minPriceParam ? parseFloat(minPriceParam) : undefined;
    const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : undefined;
    if (typeof minPrice === 'number' && isFinite(minPrice)) {
      priceFilter.$gte = minPrice;
    }
    if (typeof maxPrice === 'number' && isFinite(maxPrice)) {
      priceFilter.$lte = maxPrice;
    }
    if (Object.keys(priceFilter).length) {
      filter.price = priceFilter;
    }

    // In-stock filter
    if (inStockParam === 'true') {
      filter.stockQty = { $gt: 0 };
    }

    const skip = (page - 1) * limit;

    // Sorting
    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortParam === 'price-asc') sort = { price: 1 };
    else if (sortParam === 'price-desc') sort = { price: -1 };
    else if (sortParam === 'newest') sort = { createdAt: -1 };
    else if (sortParam === 'oldest') sort = { createdAt: 1 };

    const [rawProducts, total] = await Promise.all([
      EnhancedProduct.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      EnhancedProduct.countDocuments(filter),
    ]);

    // Prefetch categories for mapping
    const categoryIds = Array.from(
      new Set(
        rawProducts
          .map((p) => (p as unknown as { categoryId?: unknown }).categoryId)
          .filter((id): id is string => typeof id === 'string')
      )
    );
    const categories = categoryIds.length
      ? await Category.find({ _id: { $in: categoryIds } })
        .select('name slug')
        .lean()
      : [];
    const categoryMap = new Map<string, { name: string; slug: string }>();
    for (const c of categories as Array<{ _id: unknown; name?: string; slug?: string }>) {
      const id = String(c._id);
      categoryMap.set(id, { name: c.name || '', slug: c.slug || '' });
    }

    // Map EnhancedProduct to UI product shape expected by the frontend
    const products = rawProducts.map((p) => {
      const single = (p as unknown as { image?: string }).image;
      const first = Array.isArray((p as unknown as { images?: string[] }).images)
        ? ((p as unknown as { images?: string[] }).images![0])
        : undefined;
      const img = single || first || '/placeholder.svg';
      const attrs = (p as unknown as { attributes?: Record<string, unknown> }).attributes || {};
      const maybeUnitOptions = (attrs as { unitOptions?: unknown }).unitOptions;
      const unitOptions = Array.isArray(maybeUnitOptions)
        ? maybeUnitOptions
          .map((opt) => {
            const o = opt as Partial<{ label: unknown; quantity: unknown; unit: unknown; price: unknown }>;
            const unit = typeof o.unit === 'string' && ['g', 'kg', 'ml', 'l', 'ea', 'lb'].includes(o.unit)
              ? (o.unit as 'g' | 'kg' | 'ml' | 'l' | 'ea' | 'lb')
              : undefined;
            const quantity = typeof o.quantity === 'number' && isFinite(o.quantity) && o.quantity > 0 ? o.quantity : undefined;
            const price = typeof o.price === 'number' && isFinite(o.price) && o.price >= 0 ? o.price : undefined;
            const label = typeof o.label === 'string' && o.label.trim().length > 0 ? o.label : undefined;
            if (!unit || !quantity || price === undefined) return null;
            return { label: label || `${quantity}${unit}`, quantity, unit, price };
          })
          .filter(Boolean) as Array<{ label: string; quantity: number; unit: 'g' | 'kg' | 'ml' | 'l' | 'ea' | 'lb'; price: number }>
        : undefined;
      return ({
        _id: String(p._id), // Ensure _id is passed to frontend
        sku: String(p.sku || p._id),
        name: p.name || '',
        image: {
          url: String(img),
          filename: '',
          contentType: '',
          path: String(img),
          alt: p.name || undefined,
        },
        description: (p as unknown as { description?: string }).description || '',
        category: (p as unknown as { categoryId?: unknown }).categoryId
          ? (() => {
            const id = String((p as unknown as { categoryId?: unknown }).categoryId);
            const meta = categoryMap.get(id);
            return { id, name: meta?.name || '', slug: meta?.slug || '' };
          })()
          : undefined,
        // EnhancedProduct does not track measurements; default to each item
        baseMeasurementQuantity: 1,
        pricePerBaseQuantity: Number(p.price ?? 0),
        measurementUnit: 'ea',
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
      });
    });
    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve products' },
      { status: 500 }
    );
  }
}
// Note: Product creation for EnhancedProduct is handled via /api/admin/products
