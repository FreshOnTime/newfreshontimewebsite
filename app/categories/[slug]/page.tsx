import { Metadata } from "next";
import ProductGrid from "@/components/products/ProductGrid";
// import { PageContainer } from "@/components/templates/PageContainer"; 
// import SectionHeader from "@/components/home/SectionHeader";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import { Product } from "@/models/product";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

import connectDB from '@/lib/database';
import CategoryModel from '@/lib/models/Category';
import EnhancedProduct from '@/lib/models/EnhancedProduct';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://freshpick.lk';

// Helper to get category details
async function getCategoryBySlug(slug: string) {
  try {
    await connectDB();
    const cat = await CategoryModel.findOne({ slug }).lean();
    if (!cat) return null;
    return {
      id: String((cat as any)._id),
      name: (cat as any).name || slug,
      slug: (cat as any).slug || slug,
      description: (cat as any).description || null,
    };
  } catch {
    return null;
  }
}

async function getCategoryProductsBySlug(slug: string): Promise<Product[]> {
  try {
    await connectDB();
    const cat = await CategoryModel.findOne({ slug }).lean();
    if (!cat) return [];

    const raw = await EnhancedProduct.find({ categoryId: String((cat as any)._id), archived: { $ne: true } }).lean();
    // map shape similar to products API
    const products: Product[] = raw.map((p: any) => {
      const img = Array.isArray(p.images) && p.images[0] ? String(p.images[0]) : (p.image ? String(p.image) : '/placeholder.svg');
      return {
        sku: String(p.sku || p._id),
        name: p.name || '',
        image: { url: img, filename: '', contentType: '', path: img, alt: p.name || undefined },
        description: p.description || '',
        category: { id: String(p.categoryId), name: (cat as any).name || '', slug: (cat as any).slug || '' },
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
      } as Product;
    });
    return products;
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

  // Determine background image (use first product image or fallback if category has no image)
  // Since we don't have category image in this fetch, we'll try to use a nice broad fallback or maybe the first product's image if suitable? 
  // Actually, let's use a specific fresh produce Unsplash image as a safe high-quality default.
  // Or better, we can assume we might add category images later. For now, a targeted Unsplash URL is best.
  const bgImage = "https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=2670&auto=format&fit=crop";

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
        backgroundImage={bgImage}
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
