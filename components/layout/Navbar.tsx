'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CircleUserRound, Plus } from 'lucide-react';
import Wordmark from '@/components/brand/Wordmark';
import { MARKET_NAVIGATION } from '@/lib/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const path = usePathname();
  const { user } = useAuth();
  const studio = user?.role === 'supplier';
  return <header className="maker-masthead">
    <div className="editorial-wrap flex h-[72px] items-center justify-between gap-3">
      <Link href="/" aria-label="FreshPick home"><Wordmark className="text-3xl" /></Link>
      <nav aria-label="Discover FreshPick" className="hidden items-center gap-8 md:flex">
        {MARKET_NAVIGATION.map(link => <Link key={link.href} href={link.href} aria-current={path.startsWith(link.href) ? 'page' : undefined} className="mast-link">{link.label}</Link>)}
      </nav>
      <div className="flex items-center gap-3">
        <Link href={studio ? '/dashboard' : '/join'} className="maker-button"><Plus size={16} />{studio ? 'Maker studio' : 'Become a maker'}</Link>
        <Link href={user ? '/dashboard' : '/auth/login'} aria-label={user ? 'Your account' : 'Sign in'} className="grid h-11 w-11 place-items-center"><CircleUserRound size={21}/></Link>
      </div>
    </div>
  </header>;
}
