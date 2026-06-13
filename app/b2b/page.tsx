import type { Metadata } from 'next';
import B2BContent from './B2BContent';

const SITE_URL = 'https://freshpick.lk';
const SERVICE_AREAS = [
    'Colombo',
    'Rajagiriya',
    'Battaramulla',
    'Nawala',
    'Nugegoda',
    'Dehiwala',
    'Mount Lavinia',
    'Kollupitiya',
    'Bambalapitiya',
];

export const metadata: Metadata = {
    title: "B2B Fresh Produce Supply Colombo | Restaurants, Hotels, Farmers & Households | Fresh Pick",
    description: "Fresh Pick supplies restaurants, hotels, offices, premium households, and farmers with reliable fresh produce sourcing, recurring grocery plans, and Colombo delivery support.",
    keywords: [
        "B2B fresh produce Colombo",
        "restaurant vegetable supplier Colombo",
        "hotel grocery supplier Sri Lanka",
        "fresh produce supplier Sri Lanka",
        "farm to table supplier Colombo",
        "recurring grocery delivery Colombo",
        "office pantry supplier Colombo",
        "premium household grocery plans Sri Lanka",
        "farmer sourcing Sri Lanka",
        "wholesale vegetables Colombo",
    ],
    openGraph: {
        title: "Fresh Pick B2B Supply Network | Colombo Fresh Produce Delivery",
        description: "Premium recurring produce supply for restaurants, hotels, offices, households, and farmer sourcing partnerships in Sri Lanka.",
        url: `${SITE_URL}/b2b`,
        siteName: 'Fresh Pick Sri Lanka',
        locale: 'en_LK',
        type: 'website',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Fresh Pick B2B fresh produce supply in Colombo',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: "Fresh Pick B2B Supply Network",
        description: "Fresh produce sourcing and recurring supply for Colombo restaurants, hotels, offices, households, and farmers.",
        images: ['/twitter-image.jpg'],
    },
    alternates: {
        canonical: `${SITE_URL}/b2b`,
    },
    other: {
        "geo.region": "LK-11",
        "geo.placename": "Colombo, Sri Lanka",
        "geo.position": "6.9271;79.8612",
        "ICBM": "6.9271, 79.8612",
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
                "name": "Fresh Pick B2B Fresh Produce Supply Network",
                "description": "B2B and recurring fresh produce supply for restaurants, hotels, offices, premium households, and farmer sourcing partnerships in Colombo, Sri Lanka.",
                "isPartOf": { "@id": `${SITE_URL}/#website` },
                "about": { "@id": `${SITE_URL}/b2b#service` },
                "inLanguage": "en-LK",
            },
            {
                "@type": "Service",
                "@id": `${SITE_URL}/b2b#service`,
                "name": "Fresh Produce Supply and Recurring Grocery Procurement",
                "serviceType": "Fresh produce supply, grocery procurement, recurring grocery delivery, farmer sourcing coordination",
                "provider": { "@id": `${SITE_URL}/#organization` },
                "areaServed": SERVICE_AREAS.map((name) => ({ "@type": "City", name })),
                "audience": [
                    { "@type": "BusinessAudience", "name": "Restaurants and cloud kitchens" },
                    { "@type": "BusinessAudience", "name": "Hotels, cafes and offices" },
                    { "@type": "Audience", "name": "Premium households and private residences" },
                    { "@type": "Audience", "name": "Sri Lankan farmers and grower networks" },
                ],
                "offers": {
                    "@type": "OfferCatalog",
                    "name": "Fresh Pick B2B Supply Plans",
                    "itemListElement": [
                        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Restaurant and hotel produce supply" } },
                        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Office pantry and staff meal supply" } },
                        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Premium household recurring grocery plans" } },
                        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Farmer sourcing and harvest coordination" } }
                    ]
                }
            },
            {
                "@type": "FAQPage",
                "@id": `${SITE_URL}/b2b#faq`,
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Who can use Fresh Pick B2B supply?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Fresh Pick supports restaurants, hotels, cafes, offices, premium households, villas, and farmer sourcing partnerships that need reliable fresh produce supply in Colombo."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Does Fresh Pick support recurring grocery orders?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes. Fresh Pick supports daily, weekly, and custom recurring grocery plans for business kitchens, office pantry needs, and household staples."
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
