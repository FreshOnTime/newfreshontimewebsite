'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Home } from 'lucide-react';
import Link from 'next/link';
import NotificationsBell from './NotificationsBell';
import { useRouter } from 'next/navigation';

export function AdminHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-background shadow-sm border-b border-border">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="mr-4">
              <Button
                variant="ghost"
                className="flex items-center space-x-2"
                onClick={() => router.push('/')}
              >
                <Home className="h-5 w-5" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </div>
            <div className="flex-shrink-0">
              <p className="hidden text-sm font-medium text-brand-green sm:block">FreshPick administration</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <NotificationsBell />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" aria-label="Admin account and settings" className="flex items-center space-x-2">
                  <User className="h-5 w-5" aria-hidden="true" />
                  <span className="hidden md:block">
                    {user?.firstName} {user?.lastName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-sm text-muted-foreground">
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm text-muted-foreground">
                  Role: {user?.role}
                </DropdownMenuItem>
                {[
                  ['Your profile', '/profile'],
                  ['User access', '/admin/users'],
                  ['Activity log', '/admin/audit-logs'],
                  ['Send notifications', '/admin/notifications'],
                ].map(([label, href]) => <DropdownMenuItem key={href} asChild><Link href={href} className="min-h-11">{label}</Link></DropdownMenuItem>)}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
