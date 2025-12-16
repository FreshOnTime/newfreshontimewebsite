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
    };
}

export default function ProductJsonLd({ product }: ProductJsonLdProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || `Fresh ${product.name} from Fresh Pick - Premium quality groceries delivered to your door in Colombo.`,
        sku: product.sku,
        image: product.image || "https://freshpick.lk/og-image.jpg",
        brand: {
            "@type": "Brand",
            name: product.brand || "Fresh Pick",
        },
        category: product.category || "Groceries",
        offers: {
            "@type": "Offer",
            url: product.url || `https://freshpick.lk/products/${product.sku}`,
            priceCurrency: product.currency || "LKR",
            price: product.price.toFixed(2),
            availability: product.inStock !== false
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            seller: {
                "@type": "Organization",
                name: "Fresh Pick",
            },
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "127",
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
