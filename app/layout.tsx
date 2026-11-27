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
import { SITE_URL, SOCIAL_LINKS } from "@/lib/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL), applicationName: 'FreshPick',
  category: 'food',
  keywords: ['FreshPick','restaurants Sri Lanka','cafés Sri Lanka','food discovery','independent food businesses'],
  title: { default: 'Discover Sri Lankan food, makers and dining | FreshPick', template: '%s | FreshPick' },
  description: 'FreshPick is an independent Sri Lankan food discovery guide. Find restaurants, cafés, food brands, products and food stories.',
  openGraph: { type: 'website', locale: 'en_LK', siteName: 'FreshPick Sri Lanka', images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Sri Lankan food and restaurant discovery on FreshPick' }] },
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
      "description": "FreshPick helps people discover restaurants, cafés, food businesses, products and food stories across Sri Lanka.",
      "sameAs": Object.values(SOCIAL_LINKS).filter(Boolean),
      "areaServed": {"@type":"Country","name":"Sri Lanka"},
      "knowsAbout": ["Sri Lankan restaurants","Cafés","Food businesses","Food products","Food stories"]
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
