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
    <header className="bg-white shadow-sm border-b border-gray-200">
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
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="hidden md:block">
                    {user?.firstName} {user?.lastName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-sm text-gray-600">
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm text-gray-600">
                  Role: {user?.role}
                </DropdownMenuItem>
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
