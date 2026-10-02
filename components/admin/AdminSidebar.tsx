'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  FileText,
  Building2,
  Tags,
  Menu,
  X,
  BookOpen,
  Bell,
  Layers,
  Handshake,
  ChefHat,
  BrainCircuit,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Intelligence', href: '/admin/intelligence', icon: BrainCircuit },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Suppliers', href: '/admin/suppliers', icon: Building2 },
  { name: 'Supplier Uploads', href: '/admin/supplier-uploads', icon: FileText },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Recipe Studio', href: '/admin/recipes', icon: ChefHat },
  { name: 'Collection Studio', href: '/admin/collections', icon: Layers },
  { name: 'Categories', href: '/admin/categories', icon: Tags },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: Layers },
  { name: 'Partnerships', href: '/admin/business-leads', icon: Handshake },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Blog Posts', href: '/admin/blogs', icon: BookOpen },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
  { name: 'Account settings', href: '/profile', icon: Settings },
];

export function AdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex h-[100svh] w-full max-w-xs flex-1 flex-col overflow-y-auto bg-background">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent pathname={pathname} />
          </div>
        </div>
      )}

      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-background px-6">
          <SidebarContent pathname={pathname} />
        </div>
      </div>

      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-background px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-foreground lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-foreground">
          Admin Dashboard
        </div>
      </div>
    </>
  );
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <>
      <div className="flex h-16 shrink-0 items-center">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FP</span>
          </div>
          <span className="font-bold text-xl text-foreground">Fresh Pick</span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      pathname?.startsWith(item.href)
                        ? 'bg-secondary text-brand-green'
                        : 'text-foreground hover:text-brand-green hover:bg-secondary',
                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                    )}
                  >
                    <item.icon
                      className={cn(
                        pathname?.startsWith(item.href) ? 'text-brand-green' : 'text-muted-foreground group-hover:text-brand-green',
                        'h-6 w-6 shrink-0'
                      )}
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </>
  );
}
