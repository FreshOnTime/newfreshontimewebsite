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
  applicationName: "FreshPick",
  title: {
    default: "FreshPick Sri Lanka | Food Discovery, Smart Grocery & Local Food",
    template: "%s | FreshPick Sri Lanka"
  },
  description: "FreshPick is a connected food discovery and commerce platform for Sri Lanka, combining shoppable recipes, smart recurring baskets, groceries, ready meals, local makers, and curated supply partnerships.",
  other: {
    "geo.region": "LK-11",
    "geo.placename": "Colombo, Sri Lanka",
    "geo.position": "6.9271;79.8612",
    "ICBM": "6.9271, 79.8612",
  },
  keywords: [
    "food discovery Sri Lanka",
    "smart grocery Sri Lanka",
    "shoppable recipes Colombo",
    "fresh grocery delivery Colombo",
    "recurring grocery delivery Colombo",
    "local food makers Sri Lanka",
    "prepared meals Colombo",
    "FreshPick supplier partnerships",
    "food commerce Sri Lanka",
    "online groceries Sri Lanka",
  ],
  authors: [{ name: "FreshPick Team" }],
  creator: "FreshPick Sri Lanka",
  publisher: "FreshPick",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "FreshPick Sri Lanka | Food Discovery That Gets Smarter With You",
    description: "Discover what to eat, shop the whole idea, automate repeat baskets, and explore Sri Lankan makers through one connected food platform.",
    url: SITE_URL,
    siteName: "FreshPick Sri Lanka",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FreshPick Sri Lanka food discovery and commerce platform",
      },
    ],
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FreshPick Sri Lanka | Connected Food Discovery & Commerce",
    description: "Shoppable recipes, smart recurring baskets, groceries, ready meals, and local maker discovery in one FreshPick experience.",
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
      "name": "FreshPick Sri Lanka",
      "url": SITE_URL,
      "logo": `${SITE_URL}/logo.png`,
      "description": "FreshPick is a Sri Lankan food discovery and commerce platform connecting households to shoppable recipes, recurring baskets, groceries, prepared food, local makers, and curated food-supply partners.",
      "email": SUPPORT_EMAIL,
      "areaServed": SERVICE_AREAS.map((name) => ({ "@type": "City", "name": `${name}, Sri Lanka` })),
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": SUPPORT_EMAIL,
        "availableLanguage": "English"
      },
      "knowsAbout": [
        "Food discovery in Colombo",
        "Shoppable recipes",
        "Fresh grocery delivery in Colombo",
        "Recurring grocery orders",
        "Prepared food delivery in Colombo",
        "Sri Lankan independent food makers",
        "Supplier onboarding",
        "Food producer partnerships",
        "Business food supply partnerships"
      ]
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "url": SITE_URL,
      "name": "FreshPick Sri Lanka",
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
      "name": "FreshPick Sri Lanka",
      "url": SITE_URL,
      "image": `${SITE_URL}/og-image.jpg`,
      "description": "The grocery-commerce layer of FreshPick, serving Colombo households with fresh products, prepared food, and recurring delivery.",
      "parentOrganization": { "@id": `${SITE_URL}/#organization` },
      "priceRange": "$$",
      "currenciesAccepted": "LKR",
      "knowsAbout": ["Fresh groceries", "Shoppable recipes", "Prepared food", "Recurring delivery", "Local food makers"],
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
