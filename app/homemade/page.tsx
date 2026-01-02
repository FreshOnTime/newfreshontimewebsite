import { Metadata } from "next";
import HomemadeContent from "@/app/homemade/HomemadeContent";
import { Product } from "@/models/product";
import connectDB from '@/lib/database';
import CategoryModel from '@/lib/models/Category';
import EnhancedProduct from '@/lib/models/EnhancedProduct';

export const metadata: Metadata = {
    title: 'Homemade & Handcrafted | Fresh Pick',
    description: 'Premium homemade products and domestic produce from small entrepreneurs.',
};

// Reusing logic to fetch products
async function getDomesticProducts(): Promise<Product[]> {
    try {
        await connectDB();
        // Try to find 'domestic-produce' first, fallback to 'homemade', then 'small-business'
        let cat = await CategoryModel.findOne({ slug: 'domestic-produce' }).lean();
        if (!cat) cat = await CategoryModel.findOne({ slug: 'homemade' }).lean();
        if (!cat) cat = await CategoryModel.findOne({ slug: 'small-business' }).lean();

        // If no category found, return empty
        if (!cat) return [];

        const raw = await EnhancedProduct.find({ categoryId: String((cat as any)._id), archived: { $ne: true } }).lean();

        // transform to Product shape
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
                updatedAt: p.updatedAt as unknown as Date | undefined,
            } as Product;
        });

        return products;
    } catch (err) {
        console.error('Failed to get domestic products:', err);
        return [];
    }
}

export default async function HomemadePage() {
    const products = await getDomesticProducts();

    return <HomemadeContent products={products} />;
}
