import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/config/site';
import B2BContent from './B2BContent';

export const metadata: Metadata = {
    title: "Become a FreshPick Supplier | Partnerships & Supplier Onboarding Sri Lanka",
    description: "Partner with FreshPick as a grower, food maker, producer, distributor, or business partner. Learn how our curated supplier onboarding works and apply to work with FreshPick in Sri Lanka.",
    keywords: [
        "FreshPick supplier onboarding",
        "become a supplier Sri Lanka",
        "food supplier partnership Sri Lanka",
        "farmer partnership Sri Lanka",
        "local food producers Sri Lanka",
        "sell food products Colombo",
        "grocery supplier Colombo",
        "FreshPick partnerships",
        "restaurant supply partnership Colombo",
        "food brand distribution Sri Lanka",
    ],
    openGraph: {
        title: "Partner with FreshPick | Supplier Onboarding & Partnerships",
        description: "FreshPick works with selected growers, makers, producers, distributors, and business partners across Sri Lanka. Apply to join our curated supply network.",
        url: `${SITE_URL}/b2b`,
        siteName: 'Fresh Pick Sri Lanka',
        locale: 'en_LK',
        type: 'website',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'FreshPick supplier partnerships and onboarding in Sri Lanka',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: "Partner with FreshPick",
        description: "Supplier onboarding for growers, makers, producers, distributors, and strategic business partners in Sri Lanka.",
        images: ['/twitter-image.jpg'],
    },
    alternates: {
        canonical: `${SITE_URL}/b2b`,
    },
};

export default function B2BPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "@id": `${SITE_URL}/b2b#webpage`,
                "url": `${SITE_URL}/b2b`,
                "name": "FreshPick Supplier Partnerships and Onboarding",
                "description": "Partnership and supplier onboarding information for growers, makers, producers, distributors, and business partners interested in working with FreshPick in Sri Lanka.",
                "isPartOf": { "@id": `${SITE_URL}/#website` },
                "about": { "@id": `${SITE_URL}/b2b#partnership-service` },
                "inLanguage": "en-LK",
            },
            {
                "@type": "Service",
                "@id": `${SITE_URL}/b2b#partnership-service`,
                "name": "FreshPick Supplier Partnership and Onboarding",
                "serviceType": "Supplier onboarding, sourcing partnerships, grower partnerships, producer partnerships, distribution partnerships, and business supply collaboration",
                "provider": { "@id": `${SITE_URL}/#organization` },
                "areaServed": { "@type": "Country", "name": "Sri Lanka" },
                "audience": [
                    { "@type": "BusinessAudience", "name": "Farmers and growers" },
                    { "@type": "BusinessAudience", "name": "Food makers and producers" },
                    { "@type": "BusinessAudience", "name": "Distributors and importers" },
                    { "@type": "BusinessAudience", "name": "Restaurants, hotels, offices and strategic business partners" },
                ],
            },
            {
                "@type": "FAQPage",
                "@id": `${SITE_URL}/b2b#faq`,
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Who can apply to become a FreshPick supplier?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "FreshPick welcomes applications from growers, farms, local food makers, producers, established brands, distributors, importers, and other suppliers that can meet FreshPick quality, consistency, and customer experience standards."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Is FreshPick an open marketplace?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No. FreshPick uses a curated partnership model. Supplier applications are reviewed for product fit, quality, consistency, commercial suitability, and operational readiness before onboarding."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Can restaurants, hotels, offices, and other businesses partner with FreshPick?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes. FreshPick also works with business buyers and strategic partners that need recurring supply, custom sourcing, or other food-commerce partnerships."
                        }
                    }
                ]
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
