import { serializeJsonLd } from '@/lib/seo';
import { publicPageMetadata } from '@/lib/publicPages';
import { Metadata } from "next";
import { unstable_cache } from "next/cache";
import HomemadeContent from "@/app/homemade/HomemadeContent";
import { Product } from "@/models/product";
import prisma from '@/lib/prisma';
import { productCardSelect, serializeProductCardForUi } from '@/lib/productSerializer';

// Match the subscription collection's cache behaviour: curated inventory does
// not need a database-backed page render for each visitor.
export const revalidate = 300;

// --- Super Best SEO Configuration ---
export const metadata: Metadata = publicPageMetadata('/homemade');

// Reusing logic to fetch products
const getDomesticProducts = unstable_cache(async (): Promise<Product[]> => {
    try {
        const raw = await prisma.product.findMany({
            // Use the indexed category relation directly. This avoids a
            // category query followed by a dependent product query.
            where: {
                category: { slug: { in: ['domestic-produce', 'homemade', 'small-business'] } },
                archived: false,
            },
            orderBy: { createdAt: 'desc' },
            select: productCardSelect,
            take: 48,
        });

        return raw.map((p) => serializeProductCardForUi(p) as Product);
    } catch (err) {
        console.error('Failed to get domestic products:', err);
        return [];
    }
}, ['domestic-products-v1'], { revalidate: 300, tags: ['products'] });

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
                "url": "https://freshpick.lk/brand/freshpick-wordmark.svg"
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
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
            />
            <HomemadeContent products={products} />
        </>
    );
}
