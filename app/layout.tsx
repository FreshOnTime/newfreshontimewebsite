import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { BagProvider } from "@/contexts/BagContext";
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
        <html lang="en">
          <body className={`${defaultFont.className} antialiased`}>
            <AdminChromeGuard>{children}</AdminChromeGuard>
            <Toaster />
          </body>
        </html>
      </BagProvider>
    </AuthProvider>
  );
}
