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
    <header className="hidden h-16 items-center justify-between border-b border-border bg-background px-6 lg:flex lg:px-8">
      <div>
        <p className="text-xs font-bold normal-case text-brand-green">FreshPick workspace</p>
        <p className="mt-1 text-sm font-normal text-foreground">{title}</p>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/profile" className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-4 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-brand-green">
          <UserRound className="h-3.5 w-3.5" /> {user?.firstName || 'Profile'}
        </Link>
        <button onClick={handleLogout} className="inline-flex h-10 items-center gap-2 rounded-md px-4 text-xs font-medium text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-700">
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </header>
  );
}
