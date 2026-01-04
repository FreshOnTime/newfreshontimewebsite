import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { BagProvider } from "@/contexts/BagContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import AdminChromeGuard from "../components/layout/AdminChromeGuard";
import { ServiceWorkerRegistration } from "@/components/layout/ServiceWorkerRegistration";
import BottomNav from "@/components/layout/BottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";
// import ReferralBanner from "@/components/ReferralBanner";
import FirstOrderPopup from "@/components/FirstOrderPopup";
import RecentPurchasePopup from "@/components/RecentPurchasePopup";
// import ChatWidget from "@/components/chat/ChatWidget"; // Temporarily disabled

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-accent",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://freshpick.lk"),
  applicationName: "Fresh Pick",
  title: {
    default: "Fresh Pick | Premium Online Grocery Delivery in Sri Lanka",
    template: "%s | Fresh Pick Sri Lanka"
  },
  description: "Experience the freshest groceries delivered to your door in Colombo and suburbs. Shop premium produce, dairy, meats, and pantry staples with same-day delivery in Sri Lanka.",
  keywords: [
    "fresh groceries sri lanka",
    "online grocery delivery colombo",
    "supermarket delivery sri lanka",
    "fresh vegetables colombo",
    "online keells alternative",
    "cargills online alternative",
    "premium food delivery sri lanka",
    "exotic fruit delivery sri lanka",
    "fresh pick",
    "same day delivery groceries colombo"
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
    title: "Fresh Pick | Premium Online Grocery Store Sri Lanka",
    description: "Your premium online grocery store in Colombo. Freshness guaranteed or your money back. Same-day delivery available.",
    url: "https://freshpick.lk",
    siteName: "Fresh Pick Sri Lanka",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Fresh Pick - Premium Groceries Sri Lanka",
      },
    ],
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fresh Pick | Premium Grocery Delivery Sri Lanka",
    description: "Freshest groceries delivered to your doorstep in Colombo, Sri Lanka.",
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
    canonical: "https://freshpick.lk",
  },
  verification: {
    google: "google-site-verification-code",
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
            <body
              className={`${inter.variable} ${playfair.variable} ${cormorant.variable} min-h-screen bg-background font-sans antialiased`}
            >
              <AdminChromeGuard>{children}</AdminChromeGuard>
              <BottomNav />
              <WhatsAppButton />
              <FirstOrderPopup />
              {/* <RecentPurchasePopup /> */}
              {/* <ChatWidget /> */}
              <Toaster />
              <ServiceWorkerRegistration />
              {/* Puter.js for AI Chat - Temporarily disabled */}
              {/* <script src="https://js.puter.com/v2/" async /> */}
              {process.env.NEXT_PUBLIC_GA_ID && (
                <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID} />
              )}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "GroceryStore",
                    "name": "Fresh Pick Sri Lanka",
                    "image": "https://freshpick.lk/logo.png",
                    "description": "Premium online grocery store delivering fresh produce and essentials in Colombo, Sri Lanka.",
                    "url": "https://freshpick.lk",
                    "telephone": "+94777123456", // Placeholder realistic number
                    "priceRange": "LKR",
                    "address": {
                      "@type": "PostalAddress",
                      "streetAddress": "No. 123, Galle Road",
                      "addressLocality": "Bambalapitiya",
                      "addressRegion": "Colombo",
                      "postalCode": "00400",
                      "addressCountry": "LK"
                    },
                    "geo": {
                      "@type": "GeoCoordinates",
                      "latitude": 6.8906,
                      "longitude": 79.8549
                    },
                    "areaServed": {
                      "@type": "City",
                      "name": "Colombo"
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
