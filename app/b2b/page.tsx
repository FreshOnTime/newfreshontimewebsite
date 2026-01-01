import type { Metadata } from 'next';
import B2BContent from './B2BContent';

export const metadata: Metadata = {
    title: "Premium Wholesale Vegetable Suppliers in Sri Lanka | Private Client Division | Fresh Pick",
    description: "The definitive produce supply chain for Colombo's Michelin-standard kitchens. Exclusive wholesale partnership for high-end restaurants, hotels, and luxury villas. Strictly by application.",
    keywords: "wholesale vegetables colombo, luxury produce suppliers sri lanka, fine dining vegetable suppliers, hotel vegetable delivery colombo, organic wholesale sri lanka, premium vegetable suppliers, restaurant supply chain colombo",
    openGraph: {
        title: "Fresh Pick Private Client Division | The Finest Produce in Ceylon",
        description: "Curated for the executive chef. Direct farm-to-kitchen logistics. Uncompromising quality.",
        url: 'https://freshpick.lk/b2b',
        siteName: 'Fresh Pick',
        locale: 'en_LK',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "Fresh Pick Private Client | Wholesale",
        description: "The supply chain behind Colombo's best menus.",
    },
    alternates: {
        canonical: 'https://freshpick.lk/b2b',
    },
    // Geo-targeting for Colombo, Sri Lanka
    other: {
        "geo.region": "LK-11", // Colombo District
        "geo.placename": "Colombo",
        "geo.position": "6.9271;79.8612",
        "ICBM": "6.9271, 79.8612"
    }
};

export default function B2BPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WholesaleStore",
        "name": "Fresh Pick Private Client Division",
        "image": "https://freshpick.lk/images/og-b2b.jpg", // Placeholder or actual image
        "description": "Premium B2B vegetable supply service for high-end hotels and restaurants in Sri Lanka.",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Colombo Wholesale Market",
            "addressLocality": "Colombo",
            "addressRegion": "Western Province",
            "postalCode": "00100",
            "addressCountry": "LK"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 6.9271,
            "longitude": 79.8612
        },
        "url": "https://freshpick.lk/b2b",
        "telephone": "+94771234567",
        "priceRange": "$$$",
        "areaServed": [
            {
                "@type": "City",
                "name": "Colombo"
            },
            {
                "@type": "City",
                "name": "Galle"
            },
            {
                "@type": "City",
                "name": "Kandy"
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <B2BContent />
        </>
    );
}
