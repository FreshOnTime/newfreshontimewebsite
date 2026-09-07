'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  LayoutDashboard,
  Mail,
  Menu,
  Package,
  Repeat,
  ShoppingBag,
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-react';

type IconType = React.ComponentType<{ className?: string }>;
type NavItem = { name: string; icon: IconType; section?: string; href?: string };

const supplierNav: NavItem[] = [
  { name: 'Overview', section: 'overview', icon: LayoutDashboard },
  { name: 'Products', section: 'products', icon: Package },
  { name: 'Messages', section: 'messages', icon: Mail },
  { name: 'Profile', section: 'profile', icon: UserRound },
];

const customerNav: NavItem[] = [
  { name: 'Overview', section: 'overview', icon: LayoutDashboard },
  { name: 'Orders', href: '/orders', icon: ShoppingBag },
  { name: 'Smart Basket', href: '/profile/subscriptions', icon: Repeat },
  { name: 'Saved', href: '/wishlist', icon: Heart },
  { name: 'Shopping bags', href: '/bags', icon: ShoppingCart },
  { name: 'Profile', href: '/profile', icon: UserRound },
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
      role={role}
      onSelect={(section) => {
        onSelect(section);
        setSidebarOpen(false);
      }}
    />
  );

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button aria-label="Close account navigation" className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative h-full w-[86%] max-w-[320px] bg-[#0b1710] text-white shadow-2xl">
            <button type="button" aria-label="Close menu" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/70" onClick={() => setSidebarOpen(false)}><X className="h-4 w-4" /></button>
            {content}
          </div>
        </div>
      )}

      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:bg-[#0b1710] lg:text-white">
        {content}
      </aside>

      <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-zinc-200 bg-white/95 px-5 backdrop-blur-xl lg:hidden">
        <button type="button" aria-label="Open account navigation" className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-700" onClick={() => setSidebarOpen(true)}><Menu className="h-4 w-4" /></button>
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-emerald-700">FreshPick account</p>
          <p className="mt-0.5 text-sm font-medium text-zinc-900">{title}</p>
        </div>
      </div>
    </>
  );
}

function SidebarContent({ nav, active, role, onSelect }: { nav: NavItem[]; active: string; role?: string; onSelect: (section: string) => void }) {
  return (
    <div className="flex h-full flex-col px-5 pb-6 pt-6">
      <Link href="/" className="inline-flex flex-col leading-none">
        <span className="font-serif text-2xl font-bold tracking-[-0.03em] text-white">Fresh<span className="italic text-emerald-300">Pick</span></span>
        <span className="mt-1 text-[7px] font-semibold uppercase tracking-[0.28em] text-white/30">{role === 'supplier' ? 'Partner workspace' : 'Your account'}</span>
      </Link>

      <div className="mt-9 h-px bg-white/10" />
      <p className="mt-7 px-2 text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-200/70">Workspace</p>

      <nav className="mt-3">
        <ul className="space-y-1">
          {nav.map((item) => {
            const isActive = item.section ? active === item.section : false;
            const classes = `group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/[0.06] hover:text-white'}`;
            const icon = <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-200' : 'text-white/35 group-hover:text-emerald-200'}`} />;

            return (
              <li key={item.name}>
                {item.section ? (
                  <button type="button" onClick={() => onSelect(item.section!)} className={classes}>{icon}<span>{item.name}</span></button>
                ) : (
                  <Link href={item.href!} className={classes}>{icon}<span>{item.name}</span></Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-emerald-200/70">Back to FreshPick</p>
        <div className="mt-3 grid gap-2 text-xs text-white/50">
          <Link href="/discover" className="hover:text-white">Discover food</Link>
          <Link href="/products" className="hover:text-white">Open Market</Link>
        </div>
      </div>
    </div>
  );
}
