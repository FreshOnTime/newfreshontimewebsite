import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { BagProvider } from "@/contexts/BagContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import AdminChromeGuard from "../components/layout/AdminChromeGuard";

const defaultFont = Inter({
  subsets: ["latin"],
  variable: "--font-default",
});

export const metadata: Metadata = {
  applicationName: "Fresh Pick",
  title: "Join the Fresh Pick Waitlist",
  description:
    "Fresh Pick: Pick Fresh, Live Easy! Join our waitlist to be the first to get the freshest groceries delivered with easy subscriptions. First 50 get free delivery at launch!",
  keywords:
    "fresh groceries, grocery delivery, easy subscriptions, fresh pick, join waitlist, coming soon, grocery launch, free delivery, pre-launch, hassle-free shopping, pick fresh live easy, grocery waitlist, exclusive offers",
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
            <body className={`${defaultFont.className} antialiased`}>
              <AdminChromeGuard>{children}</AdminChromeGuard>
              <Toaster />
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
                    "address": {
                      "@type": "PostalAddress",
                      "streetAddress": "Colombo",
                      "addressLocality": "Colombo",
                      "addressRegion": "Western",
                      "postalCode": "00100",
                      "addressCountry": "LK"
                    },
                    "geo": {
                      "@type": "GeoCoordinates",
                      "latitude": 6.9271,
                      "longitude": 79.8612
                    },
                    "url": "https://freshpick.lk",
                    "telephone": "+94770000000",
                    "openingHoursSpecification": [
                      {
                        "@type": "OpeningHoursSpecification",
                        "dayOfWeek": [
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday"
                        ],
                        "opens": "08:00",
                        "closes": "22:00"
                      }
                    ]
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
