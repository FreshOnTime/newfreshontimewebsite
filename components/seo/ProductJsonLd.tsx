import { absoluteUrl, SITE_NAME_LONG } from '@/lib/config/site';

interface ProductJsonLdProps {
    product: {
        name: string;
        description?: string;
        sku: string;
        image?: string;
        price: number;
        currency?: string;
        inStock?: boolean;
        category?: string;
        brand?: string;
        url?: string;
        ratingValue?: number;
        reviewCount?: number;
    };
}

export default function ProductJsonLd({ product }: ProductJsonLdProps) {
    const hasVerifiedRating =
        typeof product.ratingValue === 'number' &&
        Number.isFinite(product.ratingValue) &&
        typeof product.reviewCount === 'number' &&
        Number.isInteger(product.reviewCount) &&
        product.reviewCount > 0;

    const image = product.image
        ? (product.image.startsWith('http') ? product.image : absoluteUrl(product.image))
        : absoluteUrl('/og-image.jpg');

    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || `Fresh ${product.name} from Fresh Pick, available for delivery in Colombo.`,
        sku: product.sku,
        image,
        brand: {
            "@type": "Brand",
            name: product.brand || SITE_NAME_LONG,
        },
        category: product.category || "Groceries",
        offers: {
            "@type": "Offer",
            url: product.url || absoluteUrl(`/products/${product.sku}`),
            priceCurrency: product.currency || "LKR",
            price: product.price.toFixed(2),
            itemCondition: "https://schema.org/NewCondition",
            availability: product.inStock !== false
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            seller: {
                "@type": "Organization",
                name: SITE_NAME_LONG,
                url: absoluteUrl(),
            },
        },
        ...(hasVerifiedRating ? {
            aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: product.ratingValue!.toFixed(1),
                reviewCount: String(product.reviewCount),
                bestRating: "5",
                worstRating: "1",
            },
        } : {}),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
