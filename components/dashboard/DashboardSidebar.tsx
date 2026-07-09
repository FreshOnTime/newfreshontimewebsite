'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Mail,
  User as UserIcon,
  ShoppingBag,
  Repeat,
  Heart,
  ShoppingCart,
  Menu,
  X,
} from 'lucide-react';

type IconType = React.ComponentType<{ className?: string }>;

// A nav item is either an internal dashboard section (switches the active
// panel in place) or an external link to another part of the site.
type NavItem = {
  name: string;
  icon: IconType;
  section?: string;
  href?: string;
};

const supplierNav: NavItem[] = [
  { name: 'Overview', section: 'overview', icon: LayoutDashboard },
  { name: 'Products', section: 'products', icon: Package },
  { name: 'Messages', section: 'messages', icon: Mail },
  { name: 'Profile', section: 'profile', icon: UserIcon },
];

const customerNav: NavItem[] = [
  { name: 'Overview', section: 'overview', icon: LayoutDashboard },
  { name: 'My Orders', href: '/orders', icon: ShoppingBag },
  { name: 'Subscriptions', href: '/profile/subscriptions', icon: Repeat },
  { name: 'Wishlist', href: '/wishlist', icon: Heart },
  { name: 'My Bags', href: '/bags', icon: ShoppingCart },
  { name: 'Profile', section: 'profile', icon: UserIcon },
];

interface DashboardSidebarProps {
  role?: string;
  active: string;
  onSelect: (section: string) => void;
  title: string;
}

export function DashboardSidebar({ role, active, onSelect, title }: DashboardSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const nav = role === 'supplier' ? supplierNav : customerNav;

  const content = (
    <SidebarContent
      nav={nav}
      active={active}
      onSelect={(section) => {
        onSelect(section);
        setSidebarOpen(false);
      }}
    />
  );

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          {content}
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">{title}</div>
      </div>
    </>
  );
}

function SidebarContent({
  nav,
  active,
  onSelect,
}: {
  nav: NavItem[];
  active: string;
  onSelect: (section: string) => void;
}) {
  return (
    <>
      <div className="flex h-16 shrink-0 items-center">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-emerald-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FP</span>
          </div>
          <span className="font-bold text-xl text-gray-900">Fresh Pick</span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {nav.map((item) => {
                const isActive = item.section ? active === item.section : false;
                const classes = cn(
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-700 hover:text-emerald-700 hover:bg-emerald-50',
                  'group flex w-full items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                );
                const icon = (
                  <item.icon
                    className={cn(
                      isActive ? 'text-emerald-700' : 'text-gray-400 group-hover:text-emerald-700',
                      'h-6 w-6 shrink-0'
                    )}
                  />
                );

                return (
                  <li key={item.name}>
                    {item.section ? (
                      <button
                        type="button"
                        onClick={() => onSelect(item.section!)}
                        className={cn(classes, 'text-left')}
                      >
                        {icon}
                        {item.name}
                      </button>
                    ) : (
                      <Link href={item.href!} className={classes}>
                        {icon}
                        {item.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
      </nav>
    </>
  );
}
