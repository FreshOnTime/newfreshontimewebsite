// ... imports remain the same, but let's ensure we have everything
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductImage from "@/components/products/ProductImage";
import { Product } from "@/models/product";
import Markdown from "react-markdown";
import { Suspense } from "react";
import { ProductControls } from "./ProductControls";
// import { PageContainer } from "@/components/templates/PageContainer"; // Removed
import rehypeSanitize from "rehype-sanitize";
import Link from "next/link";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

import connectDB from '@/lib/database';
import EnhancedProduct from '@/lib/models/EnhancedProduct';
import Category from '@/lib/models/Category';
import type { IProduct as IEnhancedProduct } from '@/lib/models/EnhancedProduct';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://freshpick.lk';

async function getProduct(id: string): Promise<Product | null> {
  // ... (keep existing getProduct logic exactly as is)
  try {
    console.log('ProductPage - getProduct id:', id);
    await connectDB();
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
      tags: p.tags || [], // Ensure tags are passed
    };

    return product as Product;
  } catch (error) {
    console.error('Failed to load product from DB:', error);
    // ... (keep fallback logic)
    try {
      const { withBase } = await import('@/lib/serverUrl');
      const absolute = withBase(`/api/products/${id}`);
      let resp = await fetch(absolute, { cache: 'no-store' });
      if (!resp.ok) resp = await fetch(`/api/products/${id}`, { cache: 'no-store' });
      if (resp.ok) {
        const data = await resp.json();
        return data.data || null;
      }
    } catch (err) {
      console.error('ProductPage - fallback fetch error:', err);
    }
    return null;
  }
}

// ... (keep generateMetadata exactly as is)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The product you are looking for could not be found.',
    };
  }

  const description = product.description
    ? product.description.slice(0, 155).replace(/\s+/g, ' ').trim() + (product.description.length > 155 ? '...' : '')
    : `Buy fresh ${product.name} online at Fresh Pick. Premium quality groceries delivered to your door in Colombo.`;

  const productUrl = `${SITE_URL}/products/${product.sku}`;
  const imageUrl = product.image?.url?.startsWith('http')
    ? product.image.url
    : `${SITE_URL}${product.image?.url || '/og-image.jpg'}`;

  return {
    title: product.name,
    description,
    keywords: [
      product.name.toLowerCase(),
      product.category?.name?.toLowerCase() || 'groceries',
      'fresh',
      'delivery',
      'colombo',
      'sri lanka',
      'online grocery',
    ].filter(Boolean).join(', '),
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${product.name} | Fresh Pick`,
      description,
      url: productUrl,
      siteName: 'Fresh Pick',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      locale: 'en_LK',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Fresh Pick`,
      description,
      images: [imageUrl],
    },
  };
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

  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL },
    ...(product.category?.slug ? [{ name: product.category.name, url: `${SITE_URL}/categories/${product.category.slug}` }] : []),
    { name: product.name, url: `${SITE_URL}/products/${product.sku}` },
  ];

  return (
    <>
      <ProductJsonLd product={{
        name: product.name,
        description: product.description,
        sku: product.sku,
        image: product.image?.url,
        price: pricePerBaseQuantityWithDiscount,
        currency: 'LKR',
        inStock: !product.isOutOfStock,
        category: product.category?.name,
        url: `${SITE_URL}/products/${product.sku}`,
      }}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Cinematic Content */}
      <div className="bg-white min-h-screen">

        {/* Hero Section */}
        <div className="pt-32 pb-16 md:pt-40 md:pb-20 border-b border-zinc-100 bg-zinc-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]"></div>
          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <div className="grid gap-16 md:grid-cols-12 items-center">

              {/* Visual */}
              <div className="md:col-span-6 lg:col-span-6 order-2 md:order-1">
                <div className="relative aspect-[4/5] w-full max-w-lg mx-auto md:mr-auto rounded-sm overflow-hidden shadow-2xl">
                  <ProductImage src={product.image.url} alt={product.name} />
                </div>
              </div>

              {/* Narrative */}
              <div className="md:col-span-6 lg:col-span-6 order-1 md:order-2 flex flex-col space-y-8 md:pl-12">
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                  {product.category?.name && (
                    <Link href={`/categories/${product.category.slug || ''}`} className="hover:text-black transition-colors">
                      {product.category.name}
                    </Link>
                  )}
                  <span className="text-zinc-300">•</span>
                  <span className="text-zinc-400 font-medium tracking-widest">{product.isOutOfStock ? 'Sold Out' : 'In Stock'}</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-serif font-medium text-zinc-900 leading-[1.1] tracking-tight">
                  {product.name}
                </h1>

                <div className="flex flex-col gap-2 border-l-2 border-emerald-500 pl-6 py-2">
                  <div className="text-3xl font-serif font-medium text-zinc-900">
                    Rs. {pricePerBaseQuantityWithDiscount.toFixed(2)}
                    {/* Discount logic handled in controls/view usually, keeping simple here */}
                  </div>
                  {!product.isSoldAsUnit && (
                    <span className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
                      Per {product.baseMeasurementQuantity}{product.measurementUnit}
                    </span>
                  )}
                </div>

                <div className="pt-6">
                  <ProductControls product={product} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="container mx-auto px-4 md:px-8 py-24">
          <div className="max-w-4xl mx-auto space-y-12">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-6">The Story</h3>
              <div className="prose prose-lg prose-zinc font-light leading-loose text-zinc-600">
                {product.description ? (
                  <Markdown rehypePlugins={[rehypeSanitize]}>
                    {product.description}
                  </Markdown>
                ) : (
                  <p>A hallmark of quality and taste, selected for the discerning palate. This product represents the pinnacle of its category, sourced with care and delivered with precision.</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
