import { Metadata } from "next";
import HomemadeContent from "@/app/homemade/HomemadeContent";
import { Product } from "@/models/product";
import connectDB from '@/lib/database';
import CategoryModel from '@/lib/models/Category';
import EnhancedProduct from '@/lib/models/EnhancedProduct';

// --- Super Best SEO Configuration ---
export const metadata: Metadata = {
    title: "Premium Homemade Products in Sri Lanka | Domestic Produce | Fresh Pick",
    description: "Discover exclusive homemade products and small-batch domestic produce in Colombo. Curated selections from Sri Lanka's finest local artisans. Delivered fresh to your door.",
    keywords: [
        "homemade products sri lanka",
        "domestic produce colombo",
        "small business sri lanka",
        "artisan food colombo",
        "premium groceries sri lanka",
        "fresh pick homemade",
        "local entrepreneurs sri lanka",
        "handcrafted food colombo",
        "organic homemade sri lanka",
        "luxury food delivery colombo"
    ].join(", "),
    openGraph: {
        title: "Homemade & Handcrafted | The Private Collection by Fresh Pick",
        description: "A tribute to the artisans. Discover a curated collection of premium domestic produce from small entrepreneurs in Sri Lanka.",
        url: 'https://freshpick.lk/homemade',
        siteName: 'Fresh Pick',
        locale: 'en_LK',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "Fresh Pick | Homemade Collection",
        description: "Curated domestic excellence. Sourced from the finest home kitchens in Colombo.",
    },
    alternates: {
        canonical: 'https://freshpick.lk/homemade',
    },
    // Geo-Targeting for Colombo, Sri Lanka
    other: {
        "geo.region": "LK-11", // Colombo
        "geo.placename": "Colombo",
        "geo.position": "6.9271;79.8612",
        "ICBM": "6.9271, 79.8612"
    }
};

// Reusing logic to fetch products
async function getDomesticProducts(): Promise<Product[]> {
    try {
        await connectDB();
        let cat = await CategoryModel.findOne({ slug: 'domestic-produce' }).lean();
        if (!cat) cat = await CategoryModel.findOne({ slug: 'homemade' }).lean();
        if (!cat) cat = await CategoryModel.findOne({ slug: 'small-business' }).lean();

        if (!cat) return [];

        const raw = await EnhancedProduct.find({ categoryId: String((cat as any)._id), archived: { $ne: true } }).lean();

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

    // JSON-LD for Search Engines
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Homemade & Handcrafted Collection",
        "description": "Premium homemade products and domestic produce from small entrepreneurs in Sri Lanka.",
        "url": "https://freshpick.lk/homemade",
        "publisher": {
            "@type": "Organization",
            "name": "Fresh Pick",
            "logo": {
                "@type": "ImageObject",
                "url": "https://freshpick.lk/logo.png"
            }
        },
        "areaServed": {
            "@type": "City",
            "name": "Colombo"
        },
        "about": {
            "@type": "Thing",
            "name": "Domestic Produce",
            "description": "High-quality, small-batch goods from local Sri Lankan artisans."
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HomemadeContent products={products} />
        </>
    );
}
