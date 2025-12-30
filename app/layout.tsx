import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { BagProvider } from "@/contexts/BagContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import AdminChromeGuard from "../components/layout/AdminChromeGuard";
import { ServiceWorkerRegistration } from "@/components/layout/ServiceWorkerRegistration";
import BottomNav from "@/components/layout/BottomNav";
// import ChatWidget from "@/components/chat/ChatWidget"; // Temporarily disabled

const defaultFont = Inter({
  subsets: ["latin"],
  variable: "--font-default",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://freshpick.lk"),
  applicationName: "Fresh Pick",
  title: {
    default: "Fresh Pick | Premium Online Grocery Delivery in Colombo",
    template: "%s | Fresh Pick"
  },
  description: "Experience the freshest groceries delivered to your door in Colombo. Shop premium produce, dairy, meats, and pantry staples with same-day delivery.",
  keywords: ["fresh groceries", "grocery delivery colombo", "online supermarket sri lanka", "premium produce", "fruit delivery", "vegetable delivery", "fresh meat", "seafood delivery", "fresh pick"],
  authors: [{ name: "Fresh Pick Team" }],
  creator: "Fresh Pick",
  publisher: "Fresh Pick",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Fresh Pick | Pick Fresh, Live Easy",
    description: "Your premium online grocery store in Colombo. Freshness guaranteed or your money back.",
    url: "https://freshpick.lk",
    siteName: "Fresh Pick",
    images: [
      {
        url: "/og-image.jpg", // Make sure to add this image to public folder or use a dynamic one
        width: 1200,
        height: 630,
        alt: "Fresh Pick - Premium Groceries",
      },
    ],
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fresh Pick | Premium Grocery Delivery",
    description: "Freshest groceries delivered to your doorstep in Colombo.",
    images: ["/twitter-image.jpg"], // Make sure to add this image
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
    canonical: "https://freshpick.lk",
  },
  verification: {
    google: "google-site-verification-code", // Placeholder
  },
  category: "food & drink",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <BagProvider>
        <WishlistProvider>
          <html lang="en">
            <body className={`${defaultFont.className} antialiased pb-16 md:pb-0`}>
              <AdminChromeGuard>{children}</AdminChromeGuard>
              <BottomNav />
              <ChatWidget />
              <Toaster />
              <ServiceWorkerRegistration />
              {/* Puter.js for AI Chat */}
              <script src="https://js.puter.com/v2/" async />
              {process.env.NEXT_PUBLIC_GA_ID && (
                <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID} />
              )}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "GroceryStore",
                    "name": "Fresh Pick",
                    "image": "https://freshpick.lk/logo.png",
                    "description": "Freshest groceries delivered to your doorstep in Colombo.",
                    "url": "https://freshpick.lk",
                    "telephone": "+94770000000",
                    "priceRange": "$$",
                    "address": {
                      "@type": "PostalAddress",
                      "streetAddress": "123 Galle Road",
                      "addressLocality": "Colombo",
                      "addressRegion": "Western",
                      "postalCode": "00300",
                      "addressCountry": "LK"
                    },
                    "geo": {
                      "@type": "GeoCoordinates",
                      "latitude": 6.9271,
                      "longitude": 79.8612
                    },
                    "openingHoursSpecification": [
                      {
                        "@type": "OpeningHoursSpecification",
                        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                        "opens": "08:00",
                        "closes": "22:00"
                      }
                    ],
                    "sameAs": [
                      "https://www.facebook.com/freshpicklk",
                      "https://www.instagram.com/freshpicklk",
                      "https://twitter.com/freshpicklk"
                    ],
                    "potentialAction": {
                      "@type": "SearchAction",
                      "target": "https://freshpick.lk/search?q={search_term_string}",
                      "query-input": "required name=search_term_string"
                    }
                  })
                }}
              />
            </body>
          </html>
        </WishlistProvider>
      </BagProvider>
    </AuthProvider>
  );
}
