'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AuthProvider } from '@/contexts/AuthContext';
import { BagProvider } from '@/contexts/BagContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { Navbar } from '@/components/layout/Navbar';
import { scheduleIdleTask } from '@/lib/utils/idleCallback';

const BottomNav = dynamic(() => import('@/components/layout/BottomNav'), { loading: () => null, ssr: false });
const FloatingCustomerWidgets = dynamic(() => import('@/components/layout/FloatingCustomerWidgets'), { loading: () => null, ssr: false });

export default function AdminChromeGuard({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  const isAdmin = pathname.startsWith('/admin');
  // The customer/supplier dashboard renders its own sidebar + header chrome,
  // so suppress the public Navbar/Footer there (same as admin). Scoped to the
  // exact path — the orphaned /dashboard/* sub-pages keep the public chrome.
  const isDashboard = pathname === '/dashboard';
  const [showDeferredWidgets, setShowDeferredWidgets] = useState(false);

  useEffect(() => {
    if (isAdmin || isDashboard) return;

    const deferredTask = scheduleIdleTask(() => setShowDeferredWidgets(true), {
      timeout: 3000,
      fallbackDelayMs: 3000,
    });

    return () => deferredTask.cancel();
  }, [isAdmin, isDashboard]);

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
            {footer}
          </div>
          <BottomNav />
          {showDeferredWidgets && <FloatingCustomerWidgets />}
        </WishlistProvider>
      </BagProvider>
    </AuthProvider>
  );
}
