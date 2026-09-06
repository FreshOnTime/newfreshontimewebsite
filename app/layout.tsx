import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import AdminChromeGuard from "../components/layout/AdminChromeGuard";
import { ServiceWorkerRegistration } from "@/components/layout/ServiceWorkerRegistration";
import { Footer } from "@/components/layout/Footer";
import { SERVICE_AREAS, SITE_URL, SUPPORT_EMAIL } from "@/lib/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Fresh Pick",
  title: {
    default: "Fresh Pick Sri Lanka | Fresh Grocery Delivery & Curated Food Partnerships",
    template: "%s | Fresh Pick Sri Lanka"
  },
  description: "Fresh Pick brings fresh groceries, recurring household orders, local food discoveries, and curated supplier partnerships together across Colombo, Sri Lanka.",
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
    "FreshPick supplier partnerships",
    "local food makers Sri Lanka",
    "restaurant supply Colombo",
    "premium household grocery plans",
    "farmer sourced produce Sri Lanka",
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
    title: "Fresh Pick Sri Lanka | Fresh Grocery Delivery & Food Partnerships",
    description: "Fresh groceries, recurring delivery, local food discoveries, and curated supplier partnerships in Sri Lanka.",
    url: SITE_URL,
    siteName: "Fresh Pick Sri Lanka",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Fresh Pick Sri Lanka fresh grocery delivery and food partnerships",
      },
    ],
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fresh Pick Sri Lanka | Fresh Grocery Delivery",
    description: "Fresh groceries, recurring orders, local discoveries, and curated food partnerships in Sri Lanka.",
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
      "description": "Fresh Pick is a Sri Lankan fresh-food commerce service for households and a curated partnership network for growers, makers, producers, distributors, and business buyers.",
      "email": SUPPORT_EMAIL,
      "areaServed": SERVICE_AREAS.map((name) => ({ "@type": "City", "name": `${name}, Sri Lanka` })),
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": SUPPORT_EMAIL,
        "availableLanguage": "English"
      },
      "knowsAbout": [
        "Fresh grocery delivery in Colombo",
        "Recurring grocery orders",
        "Cooked-food delivery in Colombo",
        "Sri Lankan homemade food makers",
        "Supplier onboarding",
        "Food producer partnerships",
        "Farmer sourced produce",
        "Business food supply partnerships"
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
      "description": "Online fresh grocery delivery and recurring food delivery for Colombo households.",
      "parentOrganization": { "@id": `${SITE_URL}/#organization` },
      "priceRange": "$$",
      "currenciesAccepted": "LKR",
      "knowsAbout": ["Fresh groceries", "Cooked food", "Recurring delivery", "Local food makers"],
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
      <body className="min-h-screen bg-background font-sans antialiased">
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
