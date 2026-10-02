'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export default function AuthFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const signingUp = pathname.includes('signup') || pathname === '/auth/register';
  return (
    <div className="account-form editorial-wrap grid items-start gap-6 py-6 md:py-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 xl:gap-20">
      <aside className="overflow-hidden rounded-2xl bg-secondary lg:sticky lg:top-32">
        <div className="relative h-40 sm:h-52 lg:h-[440px] xl:h-[500px]">
          <Image
            src={signingUp ? '/images/auth/market-bag.webp' : '/images/auth/market-still-life.webp'}
            alt={signingUp ? 'A canvas market bag with greens, carrots, mangoes, bananas and limes' : 'Leafy greens, aubergines, limes, passion fruit and papaya on a stone counter'}
            fill priority sizes="(max-width: 1023px) calc(100vw - 40px), (max-width: 1440px) 42vw, 580px"
            className="object-cover object-[center_60%]"
          />
        </div>
        <div className="hidden bg-brand-green p-8 text-white lg:block xl:p-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/80">Your everyday market</p>
          <h2 className="mt-3 text-3xl leading-tight xl:text-4xl">{signingUp ? 'Good food starts here.' : 'Welcome back to good food.'}</h2>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/85">Save your favourites, plan a regular basket and keep your orders in one place.</p>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
