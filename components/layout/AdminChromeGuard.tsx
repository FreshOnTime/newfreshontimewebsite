'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Wordmark from '@/components/brand/Wordmark';
import { AuthProvider } from '@/contexts/AuthContext';
import { BagProvider } from '@/contexts/BagContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { Navbar } from '@/components/layout/Navbar';
import { ModernMotion } from '@/components/makers/ModernMotion';
import AuthFrame from '@/components/layout/AuthFrame';

export default function AdminChromeGuard({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  const pathname = usePathname() || '';
  const workspace = pathname === '/admin' || pathname.startsWith('/admin/');
  const authentication = pathname.startsWith('/auth/');
  const checkout = pathname === '/checkout';
  const publication = !authentication && !checkout && !/^\/(dashboard|profile|orders|bags|wishlist|subscriptions)(\/|$)/.test(pathname);
  if (workspace) return <AuthProvider><div className="fp-admin flex min-h-screen flex-col"><main id="main-content" className="flex-1">{children}</main></div></AuthProvider>;
  return (
    <AuthProvider><BagProvider><WishlistProvider>
      <div className="freshpick-market flex min-h-screen flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-5 focus:top-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground">Skip to content</a>
        <Navbar />
        <main id="main-content" className="flex-1 studio-content" data-publication={publication ? "true" : undefined}><ModernMotion/>{authentication ? <AuthFrame>{children}</AuthFrame> : children}</main>
        {checkout || authentication ? <footer className="editorial-wrap flex flex-wrap justify-between gap-4 border-t border-border py-6 text-xs text-muted-foreground"><span className="inline-flex items-center gap-2"><Wordmark /> · Colombo</span><nav aria-label="Checkout and account help" className="flex gap-5"><Link href="/contact">Need a hand?</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></nav></footer> : footer}
      </div>
    </WishlistProvider></BagProvider></AuthProvider>
  );
}
