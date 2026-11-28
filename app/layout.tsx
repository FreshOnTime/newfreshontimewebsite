import { serializeJsonLd } from '@/lib/seo';
import type { Metadata } from "next";
import "./globals.css";
import "./discovery.css";
import "./discovery-polish.css";
import "./discovery-mobile.css";
import "./discovery-hub.css";
import "./discovery-experience.css";
import { Toaster } from "@/components/ui/sonner";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import AdminChromeGuard from "../components/layout/AdminChromeGuard";
import { ServiceWorkerRegistration } from "@/components/layout/ServiceWorkerRegistration";
import { Footer } from "@/components/layout/Footer";
import { SITE_URL, SOCIAL_LINKS, DISCOVERY_TITLE, DISCOVERY_DESCRIPTION } from "@/lib/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL), applicationName: 'FreshPick',
  alternates:{types:{'application/rss+xml':'/feed.xml'}},
  category: 'food',
  title: { default: `${DISCOVERY_TITLE} | FreshPick`, template: '%s | FreshPick' },
  description: DISCOVERY_DESCRIPTION,
  openGraph: { type: 'website', locale: 'en_LK', siteName: 'FreshPick Sri Lanka', images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'FreshPick Sri Lanka food discovery, dining, producers and events' }] },
  twitter: { card: 'summary_large_image', images: ['/opengraph-image'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  formatDetection: { email: false, address: false, telephone: false },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      "name": "FreshPick Sri Lanka",
      "url": SITE_URL,
      "logo": `${SITE_URL}/brand/freshpick-wordmark.svg`,
      "description": DISCOVERY_DESCRIPTION,
      "sameAs": Object.values(SOCIAL_LINKS).filter(Boolean),
      "areaServed": {"@type":"Country","name":"Sri Lanka"},
      "knowsAbout": ["Sri Lankan cuisine","Restaurants and cafés","Local food producers","Food products and gifts","Food events and culinary experiences","Food journalism"] 
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "url": SITE_URL,
      "name": "FreshPick",
      "alternateName": "FreshPick Sri Lanka",
      "description": DISCOVERY_DESCRIPTION,
      "publisher": { "@id": `${SITE_URL}/#organization` },
      "inLanguage": "en-LK",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${SITE_URL}/discover?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
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
            __html: serializeJsonLd(organizationJsonLd)
          }}
        />
      </body>
    </html>
  );
}
