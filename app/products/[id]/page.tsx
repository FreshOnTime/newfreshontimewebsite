import { notFound } from "next/navigation";
import ProductImage from "@/components/products/ProductImage";
import { Product } from "@/models/product";
import { Separator } from "@radix-ui/react-separator";
import Markdown from "react-markdown";
import { Suspense } from "react";
import { ProductControls } from "./ProductControls";
import { PageContainer } from "@/components/templates/PageContainer";
import rehypeSanitize from "rehype-sanitize";
import Link from "next/link";

import connectDB from '@/lib/database';
import EnhancedProduct from '@/lib/models/EnhancedProduct';
import Category from '@/lib/models/Category';
import type { IProduct as IEnhancedProduct } from '@/lib/models/EnhancedProduct';

async function getProduct(id: string): Promise<Product | null> {
  try {
    console.log('ProductPage - getProduct id:', id);
    await connectDB();
    // Support finding by _id, sku or slug in the DB
    const mongoose = await import('mongoose');
    let p: Partial<IEnhancedProduct> | null = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      p = await EnhancedProduct.findById(id).lean() as Partial<IEnhancedProduct> | null;
    }
    if (!p) {
      p = await EnhancedProduct.findOne({ $or: [{ sku: id }, { slug: id }] }).lean() as Partial<IEnhancedProduct> | null;
    }
    if (!p) {
      console.log('ProductPage - product not found in DB for id:', id);
      return null;
    }

    let categoryMeta: { id: string; name: string; slug: string } | undefined;
    if (p?.categoryId) {
      try {
        const cat = await Category.findById(p.categoryId).select('name slug').lean() as { name?: string; slug?: string } | null;
        if (cat) categoryMeta = { id: String(p.categoryId), name: cat.name || '', slug: cat.slug || '' };
      } catch { }
    }

    const attrs = p.attributes || {};
    const maybeUnitOptions = attrs.unitOptions;
    const unitOptions = Array.isArray(maybeUnitOptions)
      ? maybeUnitOptions
        .map((o: { unit?: string; quantity?: number; price?: number; label?: string }) => {
          const unit = typeof o.unit === 'string' && ['g', 'kg', 'ml', 'l', 'ea', 'lb'].includes(o.unit) ? o.unit : undefined;
          const quantity = typeof o.quantity === 'number' ? o.quantity : undefined;
          const price = typeof o.price === 'number' ? o.price : undefined;
          if (!unit || !quantity || price === undefined) return null;
          return { label: o.label || `${quantity}${unit}`, quantity, unit, price };
        })
        .filter(Boolean)
      : undefined;

    const product = {
      _id: String(p._id),
      sku: String(p.sku || p._id),
      name: p.name || '',
      image: {
        url: Array.isArray(p.images) && p.images[0] ? String(p.images[0]) : (p.image ? String(p.image) : '/placeholder.svg'),
        filename: '',
        contentType: '',
        path: Array.isArray(p.images) && p.images[0] ? String(p.images[0]) : (p.image ? String(p.image) : '/placeholder.svg'),
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
      updatedAt: p.updatedAt as unknown as Date | undefined,
      ingredients: undefined,
      nutritionFacts: undefined,
      unitOptions,
    };

    return product as Product;
  } catch (error) {
    console.error('Failed to load product from DB:', error);
    // Fallback: try fetching internal API
    try {
      const { withBase } = await import('@/lib/serverUrl');
      const absolute = withBase(`/api/products/${id}`);
      let resp = await fetch(absolute, { cache: 'no-store' });
      if (!resp.ok) resp = await fetch(`/api/products/${id}`, { cache: 'no-store' });
      if (resp.ok) {
        const data = await resp.json();
        return data.data || null;
      }
      console.error('ProductPage - fallback fetch failed status', resp.status);
    } catch (err) {
      console.error('ProductPage - fallback fetch error:', err);
    }
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = await params;
  const product = await getProduct(productId);

  if (!product) {
    notFound();
  }

  const pricePerBaseQuantityWithDiscount = product.discountPercentage
    ? product.pricePerBaseQuantity -
    (product.pricePerBaseQuantity * (product.discountPercentage || 0)) / 100
    : product.pricePerBaseQuantity;
  const pricePerMeasurement =
    pricePerBaseQuantityWithDiscount / product.baseMeasurementQuantity;

  return (
    <div className="bg-white min-h-screen pb-20 pt-32 md:pt-40">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid gap-12 lg:gap-24 md:grid-cols-12 items-start">
          <div className="md:col-span-6 lg:col-span-7 sticky top-32">
            <div className="border-0 rounded-[3rem] overflow-hidden bg-zinc-50 shadow-sm ring-1 ring-zinc-100">
              <ProductImage src={product.image.url} alt={product.name} />
            </div>
          </div>
          <div className="md:col-span-6 lg:col-span-5 flex flex-col space-y-8 animate-fade-up">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium uppercase tracking-wider">
                {product.category?.slug && (
                  <Link href={`/categories/${product.category.slug}`} className="hover:text-emerald-800 transition-colors">
                    {product.category.name}
                  </Link>
                )}
                <span>•</span>
                <span>{product.sku}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-zinc-900 leading-tight">
                {product.name}
              </h1>
              <div className="space-y-1">
                <p className="text-xl font-semibold text-gray-900">
                  Rs. {pricePerBaseQuantityWithDiscount.toFixed(2)}
                  {!product.isSoldAsUnit && product.baseMeasurementQuantity > 0 && (
                    <span className="text-lg text-gray-600">
                      /{product.baseMeasurementQuantity}
                      {product.measurementUnit}
                    </span>
                  )}
                  {product.discountPercentage && (
                    <span className="ml-2 text-lg text-gray-500 line-through">
                      Rs. {product.pricePerBaseQuantity.toFixed(2)}
                    </span>
                  )}
                </p>
                {!product.isSoldAsUnit && product.baseMeasurementQuantity > 0 && (
                  <p className="text-sm text-gray-600">
                    Rs. {pricePerMeasurement.toFixed(2)}/{product.measurementUnit}
                  </p>
                )}
              </div>
            </div>
            <Separator />

            <div className="space-y-4">
              {product.description && (
                <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
                  <Markdown
                    rehypePlugins={[rehypeSanitize]}
                    className="text-gray-600 leading-relaxed prose"
                  >
                    {product.description}
                  </Markdown>
                </Suspense>
              )}
              <ProductControls product={product} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
