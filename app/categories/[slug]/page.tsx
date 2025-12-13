import ProductGrid from "@/components/products/ProductGrid";
// import { PageContainer } from "@/components/templates/PageContainer"; 
// import SectionHeader from "@/components/home/SectionHeader";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import { Product } from "@/models/product";

import connectDB from '@/lib/database';
import CategoryModel from '@/lib/models/Category';
import EnhancedProduct from '@/lib/models/EnhancedProduct';

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

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  const products = await getCategoryProductsBySlug(slug);

  // Determine background image (use first product image or fallback if category has no image)
  // Since we don't have category image in this fetch, we'll try to use a nice broad fallback or maybe the first product's image if suitable? 
  // Actually, let's use a specific fresh produce Unsplash image as a safe high-quality default.
  // Or better, we can assume we might add category images later. For now, a targeted Unsplash URL is best.
  const bgImage = "https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=2670&auto=format&fit=crop";

  return (
    <>
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
