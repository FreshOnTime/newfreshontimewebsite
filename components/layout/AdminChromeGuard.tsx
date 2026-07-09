'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AuthProvider } from '@/contexts/AuthContext';
import { BagProvider } from '@/contexts/BagContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const BottomNav = dynamic(() => import('@/components/layout/BottomNav'), { loading: () => null, ssr: false });
const WhatsAppButton = dynamic(() => import('@/components/WhatsAppButton'), { loading: () => null, ssr: false });
const FirstOrderPopup = dynamic(() => import('@/components/FirstOrderPopup'), { loading: () => null, ssr: false });

export default function AdminChromeGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isAdmin = pathname.startsWith('/admin');
  // The customer/supplier dashboard renders its own sidebar + header chrome,
  // so suppress the public Navbar/Footer there (same as admin). Scoped to the
  // exact path — the orphaned /dashboard/* sub-pages keep the public chrome.
  const isDashboard = pathname === '/dashboard';

  if (isAdmin || isDashboard) {
    // On admin/dashboard routes, do NOT render website Navbar/Footer
    return (
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">{children}</main>
        </div>
      </AuthProvider>
    );
  }

  // Public site chrome
  return (
    <AuthProvider>
      <BagProvider>
        <WishlistProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <BottomNav />
          <WhatsAppButton />
          <FirstOrderPopup />
        </WishlistProvider>
      </BagProvider>
    </AuthProvider>
  );
}
