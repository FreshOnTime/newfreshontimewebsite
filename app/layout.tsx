import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import AdminChromeGuard from "../components/layout/AdminChromeGuard";
import { ServiceWorkerRegistration } from "@/components/layout/ServiceWorkerRegistration";
import { Footer } from "@/components/layout/Footer";

const SITE_URL = "https://freshpick.lk";
const SERVICE_AREAS = [
  "Colombo",
  "Rajagiriya",
  "Battaramulla",
  "Nawala",
  "Nugegoda",
  "Dehiwala",
  "Mount Lavinia",
  "Kollupitiya",
  "Bambalapitiya",
  "Cinnamon Gardens",
  "Havelock Town",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Fresh Pick",
  title: {
    default: "Fresh Pick Sri Lanka | Fresh Grocery Delivery, Recurring Orders & B2B Produce Supply",
    template: "%s | Fresh Pick Sri Lanka"
  },
  description: "Fresh Pick delivers fresh groceries, recurring household orders, and B2B produce supply for restaurants, hotels, offices, and premium homes across Colombo, Sri Lanka.",
  other: {
    "geo.region": "LK-11",
    "geo.placename": "Colombo, Sri Lanka",
    "geo.position": "6.9271;79.8612",
    "ICBM": "6.9271, 79.8612",
  },
  keywords: [
    "fresh grocery delivery Sri Lanka",
    "online grocery delivery Colombo",
    "recurring grocery delivery Colombo",
    "fresh produce Sri Lanka",
    "farm fresh vegetables Colombo",
    "B2B fresh produce supplier Colombo",
    "restaurant vegetable supplier Colombo",
    "hotel grocery supplier Sri Lanka",
    "office pantry supplier Colombo",
    "premium household grocery plans",
    "farmer sourced produce Sri Lanka",
    "same day grocery delivery Colombo",
  ],
  authors: [{ name: "Fresh Pick Team" }],
  creator: "Fresh Pick Sri Lanka",
  publisher: "Fresh Pick",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Fresh Pick Sri Lanka | Fresh Grocery Delivery & Produce Supply",
    description: "Fresh groceries, recurring household orders, and B2B produce supply for Colombo restaurants, hotels, offices, and premium homes.",
    url: SITE_URL,
    siteName: "Fresh Pick Sri Lanka",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Fresh Pick Sri Lanka fresh grocery delivery and produce supply",
      },
    ],
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fresh Pick Sri Lanka | Fresh Grocery Delivery",
    description: "Fresh groceries, recurring orders, and produce supply for homes, restaurants, hotels, and offices in Colombo.",
    images: ["/twitter-image.jpg"],
    creator: "@freshpicklk",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "food & drink",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      "name": "Fresh Pick Sri Lanka",
      "url": SITE_URL,
      "logo": `${SITE_URL}/logo.png`,
      "description": "Fresh Pick is a Sri Lankan fresh grocery and produce supply service for households, restaurants, hotels, offices, and farmer sourcing partnerships.",
      "email": "concierge@freshpick.lk",
      "areaServed": SERVICE_AREAS.map((name) => ({ "@type": "City", "name": `${name}, Sri Lanka` })),
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "concierge@freshpick.lk",
        "availableLanguage": "English"
      },
      "knowsAbout": [
        "Fresh grocery delivery in Colombo",
        "Recurring grocery orders",
        "Cooked-food delivery in Colombo",
        "Sri Lankan homemade food makers",
        "Restaurant produce supply",
        "Hotel produce procurement",
        "Farmer sourced produce",
        "Premium household grocery planning"
      ]
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "url": SITE_URL,
      "name": "Fresh Pick Sri Lanka",
      "publisher": { "@id": `${SITE_URL}/#organization` },
      "inLanguage": "en-LK",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${SITE_URL}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "GroceryStore",
      "@id": `${SITE_URL}/#grocery-store`,
      "name": "Fresh Pick Sri Lanka",
      "url": SITE_URL,
      "image": `${SITE_URL}/og-image.jpg`,
      "description": "Online fresh grocery delivery and recurring produce supply for Colombo households, restaurants, hotels, and offices.",
      "parentOrganization": { "@id": `${SITE_URL}/#organization` },
      "priceRange": "$$",
      "currenciesAccepted": "LKR",
      "knowsAbout": ["Fresh groceries", "Cooked food", "Recurring delivery", "B2B produce supply"],
      "areaServed": SERVICE_AREAS.map((name) => ({ "@type": "City", name })),
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 6.9271,
        "longitude": 79.8612
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-LK">
      <head>
        {/* Several collection pages use Unsplash photography above the fold.
            Opening this connection while the HTML is parsed removes a DNS/TLS
            round trip from their Largest Contentful Paint. */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      </head>
      <body
        className="min-h-screen bg-background font-sans antialiased"
      >
        <AdminChromeGuard footer={<Footer />}>{children}</AdminChromeGuard>
        <Toaster />
        <ServiceWorkerRegistration />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd)
          }}
        />
      </body>
    </html>
  );
}
