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
            name: product.brand || "Fresh On Time",
        },
        category: product.category || "Premium Groceries",
        offers: {
            "@type": "Offer",
            url: product.url || `https://freshpick.lk/products/${product.sku}`,
            priceCurrency: product.currency || "LKR",
            price: product.price.toFixed(2),
            itemCondition: "https://schema.org/NewCondition",
            availability: product.inStock !== false
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            seller: {
                "@type": "Store",
                name: "Fresh On Time",
                image: "https://freshpick.lk/logo.png", // Ensure this exists or use a valid URL
            },
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            areaServed: [
                {
                    "@type": "City",
                    name: "Colombo",
                    sameAs: "https://en.wikipedia.org/wiki/Colombo"
                },
                {
                    "@type": "City",
                    name: "Dehiwala-Mount Lavinia"
                },
                {
                    "@type": "GeoCircle",
                    geoMidpoint: {
                        "@type": "GeoCoordinates",
                        latitude: 6.9271,
                        longitude: 79.8612
                    },
                    geoRadius: "15000" // 15km radius
                }
            ],
            hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                merchantReturnDays: 1,
                returnMethod: "https://schema.org/ReturnInStore",
                returnFees: "https://schema.org/FreeReturn"
            },
            shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: {
                    "@type": "MonetaryAmount",
                    value: 350,
                    currency: "LKR"
                },
                shippingDestination: {
                    "@type": "DefinedRegion",
                    addressCountry: "LK"
                },
                deliveryTime: {
                    "@type": "ShippingDeliveryTime",
                    handlingTime: {
                        "@type": "QuantitativeValue",
                        minValue: 0,
                        maxValue: 1,
                        unitCode: "DAY"
                    },
                    transitTime: {
                        "@type": "QuantitativeValue",
                        minValue: 0,
                        maxValue: 1,
                        unitCode: "DAY"
                    }
                }
            }
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "850",
            bestRating: "5",
            worstRating: "1"
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
