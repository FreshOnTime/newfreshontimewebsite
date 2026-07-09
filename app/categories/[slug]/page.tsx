import { Metadata } from "next";
import ProductGrid from "@/components/products/ProductGrid";
// import { PageContainer } from "@/components/templates/PageContainer"; 
// import SectionHeader from "@/components/home/SectionHeader";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import { Product } from "@/models/product";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

import prisma from '@/lib/prisma';
import { serializeProductForUi } from '@/lib/productSerializer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://freshpick.lk';

// Helper to get category details
async function getCategoryBySlug(slug: string) {
  try {
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (!cat) return null;
    return {
      id: cat.id,
      name: cat.name || slug,
      slug: cat.slug || slug,
      description: cat.description || null,
    };
  } catch {
    return null;
  }
}

async function getCategoryProductsBySlug(slug: string): Promise<Product[]> {
  try {
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (!cat) return [];

    const raw = await prisma.product.findMany({
      where: { categoryId: cat.id, archived: false },
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true, slug: true } } },
    });
    return raw.map((p) => serializeProductForUi(p) as Product);
  } catch (err) {
    console.error('Failed to get category products by slug:', err);
    return [];
  }
}

// Generate dynamic metadata for category pages
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  const name = category?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

  const description = category?.description
    || `Shop fresh ${name.toLowerCase()} online at Fresh Pick. Premium quality groceries delivered to your door in Colombo, Sri Lanka.`;

  const categoryUrl = `${SITE_URL}/categories/${slug}`;

  return {
    title: `${name} - Fresh Groceries`,
    description,
    keywords: [
      name.toLowerCase(),
      'fresh groceries',
      'colombo delivery',
      'sri lanka',
      'online grocery',
      'fresh produce',
    ].join(', '),
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
      title: `${name} | Fresh Pick`,
      description,
      url: categoryUrl,
      siteName: 'Fresh Pick',
      images: [
        {
          url: `${SITE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${name} - Fresh Pick`,
        },
      ],
      locale: 'en_LK',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | Fresh Pick`,
      description,
      images: [`${SITE_URL}/og-image.jpg`],
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  const name = category?.name || slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  const products = await getCategoryProductsBySlug(slug);

  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL },
    { name: 'Categories', url: `${SITE_URL}/categories` },
    { name, url: `${SITE_URL}/categories/${slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <PremiumPageHeader
        title={name}
        subtitle={`Explore our fresh selection of ${name.toLowerCase()}.`}
        count={products.length}
      />
      <div className="container mx-auto px-4 md:px-8 pb-24">
        <ProductGrid products={products} />

        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-zinc-400 font-serif">No products found in this category.</p>
            <div className="mt-6">
              <a href="/products" className="text-emerald-600 hover:underline">View all products</a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
