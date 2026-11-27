'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import MakerStudio from '@/components/makers/MakerStudio';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login?redirect=/dashboard');
    if (user?.role === 'admin') router.replace('/admin');
  }, [loading, user, router]);
  if (loading || !user || user.role === 'admin') return <p className="editorial-wrap py-12" role="status">Opening your account…</p>;
  const maker = user.role === 'supplier';
  return <div className="fp-dash editorial-wrap py-10">
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
      <h1 className="maker-headline">{maker ? 'Business studio.' : 'Your FreshPick.'}</h1>
      <button onClick={async () => { await logout(); router.replace('/'); }} className="text-sm underline">Sign out</button>
    </header>
    {maker ? <MakerStudio/> : <div className="mb-8 flex flex-wrap gap-4"><Link className="maker-button" href="/discover">Explore food and places</Link><Link className="editorial-link" href="/for-businesses">List a business</Link></div>}
    <nav aria-label="Account settings and history" className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-5 text-sm underline">
      <Link href="/saved">Saved picks</Link><Link href="/profile">Account settings</Link><Link href="/profile/notifications">Notifications</Link><Link href="/orders">Legacy order history</Link><Link href="/profile/subscriptions">Legacy subscriptions</Link>
    </nav>
  </div>;
}
