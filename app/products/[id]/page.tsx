// ... imports remain the same, but let's ensure we have everything
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductImage from "@/components/products/ProductImage";
import { Product } from "@/models/product";
import Markdown from "react-markdown";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { ProductControls } from "./ProductControls";
// import { PageContainer } from "@/components/templates/PageContainer"; // Removed
import rehypeSanitize from "rehype-sanitize";
import Link from "next/link";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

import prisma from '@/lib/prisma';
import { serializeProductForUi } from '@/lib/productSerializer';

// ISR: product details change occasionally; revalidate every 5 minutes.
// Works alongside generateStaticParams to pre-render top products at build time
// and serve cached responses for subsequent requests.
export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://freshpick.lk';

const getProduct = unstable_cache(async (id: string): Promise<Product | null> => {
  try {
    const p = await prisma.product.findFirst({
      where: { OR: [{ id }, { sku: id }, { slug: id }] },
      include: { category: { select: { name: true, slug: true } } },
    });

    if (!p) {
      console.log('ProductPage - product not found in DB for id:', id);
      return null;
    }

    return serializeProductForUi(p) as Product;
  } catch (error) {
    console.error('Failed to load product from DB:', error);
    return null;
  }
}, ['product-detail-v1'], { revalidate: 300, tags: ['products'] });

// ... (keep generateMetadata exactly as is)
// Enable SSG for top products to improve performance
export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { archived: false },
      select: { sku: true, slug: true, id: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return products.map((p) => ({
      id: p.sku || p.slug || p.id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

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
    ? product.description.slice(0, 160).replace(/\s+/g, ' ').trim() + (product.description.length > 160 ? '...' : '')
    : `Discover ${product.name}, a premium selection from our curated artisan and fresh collection. Fresh On Time brings you the finest home-made and farm-fresh products in Colombo.`;

  const productUrl = `${SITE_URL}/products/${product.sku}`;
  const imageUrl = product.image?.url?.startsWith('http')
    ? product.image.url
    : `${SITE_URL}${product.image?.url || '/og-image.jpg'}`;

  const title = `${product.name} | Artisan & Premium Grocery Delivery Colombo | Fresh On Time`;

  return {
    title,
    description,
    keywords: [
      product.name.toLowerCase(),
      product.category?.name?.toLowerCase() || 'artisan groceries',
      'home made products sri lanka',
      'artisan food delivery colombo',
      'small batch local suppliers',
      'fresh pick premium',
      'grocery delivery colombo',
      'luxury food sri lanka',
      'high end supermarket',
      'colombo 7 grocery',
      'organic produce sri lanka'
    ].filter(Boolean).join(', '),
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title,
      description,
      url: productUrl,
      siteName: 'Fresh On Time',
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
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
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
                  <ProductImage src={product.image.url} alt={product.name} priority />
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
