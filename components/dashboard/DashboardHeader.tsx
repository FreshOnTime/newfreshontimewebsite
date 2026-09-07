'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { LogOut, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DashboardHeader({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="hidden h-16 items-center justify-between border-b border-zinc-200 bg-white/90 px-6 backdrop-blur-xl lg:flex lg:px-8">
      <div>
        <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-700">FreshPick workspace</p>
        <h1 className="mt-1 text-sm font-semibold text-zinc-900">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/profile" className="inline-flex h-10 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-xs font-medium text-zinc-600 transition-colors hover:border-emerald-300 hover:text-emerald-800">
          <UserRound className="h-3.5 w-3.5" /> {user?.firstName || 'Profile'}
        </Link>
        <button onClick={handleLogout} className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-medium text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-700">
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </header>
  );
}
