import { serializeJsonLd } from '@/lib/seo';
import type { Metadata } from "next";
import "./globals.css";
import "./discovery.css";
import { Toaster } from "@/components/ui/sonner";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import AdminChromeGuard from "../components/layout/AdminChromeGuard";
import { ServiceWorkerRegistration } from "@/components/layout/ServiceWorkerRegistration";
import { Footer } from "@/components/layout/Footer";
import { SERVICE_AREAS, SITE_URL, SUPPORT_EMAIL, SOCIAL_LINKS } from "@/lib/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL), applicationName: 'FreshPick',
  category: 'food',
  keywords: ['FreshPick', 'local bakers and cooks', 'Sri Lankan local food'],
  title: { default: 'Discover Sri Lankan food, makers and dining | FreshPick', template: '%s | FreshPick' },
  description: 'Discover independent Sri Lankan food makers, restaurants, cafés, products and stories.',
  openGraph: { type: 'website', locale: 'en_LK', siteName: 'FreshPick Sri Lanka', images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Sri Lankan food makers on FreshPick' }] },
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
      "description": "FreshPick connects people with independent food makers across Sri Lanka.",
      "sameAs": Object.values(SOCIAL_LINKS).filter(Boolean),
      "email": SUPPORT_EMAIL,
      "areaServed": SERVICE_AREAS.map((name) => ({ "@type": "City", "name": `${name}, Sri Lanka` })),
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": SUPPORT_EMAIL,
        "availableLanguage": "English"
      },
      "knowsAbout": ["Sri Lankan food makers", "Home baking", "Food stories", "Local produce"]
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
