'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Wordmark from '@/components/brand/Wordmark';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Package, ShoppingCart, BarChart3, Building2, Tags, Menu, BookOpen, Layers, Handshake, ChefHat, ArrowUpRight, MessageSquare, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const groups = [
  { name: 'Store', items: [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Tags },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: Layers },
    { name: 'Suppliers', href: '/admin/suppliers', icon: Building2 },
  ] },
  { name: 'Publishing', items: [
    { name: 'Journal', href: '/admin/blogs', icon: BookOpen },
    { name: 'Newsletter', href: '/admin/newsletter', icon: Mail },
    { name: 'Recipes', href: '/admin/recipes', icon: ChefHat },
    { name: 'Collections', href: '/admin/collections', icon: Layers },
  ] },
  { name: 'Support', items: [
    { name: 'Enquiry inbox', href: '/admin/enquiries', icon: MessageSquare },
  ] },
  { name: 'Business', items: [
    { name: 'Business enquiries', href: '/admin/business-leads', icon: Handshake },
    { name: 'Reports', href: '/admin/analytics', icon: BarChart3 },
  ] },
];

export function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  return <>
    <aside aria-label="Administration" className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col border-r border-border bg-background px-6 overflow-y-auto">
      <SidebarContent pathname={pathname} />
    </aside>
    <div className="sticky top-0 z-40 flex items-center gap-4 border-b border-border bg-background px-4 py-3 sm:px-6 lg:hidden">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><button type="button" aria-label="Open admin navigation" className="flex h-11 w-11 items-center justify-center text-foreground"><Menu className="h-5 w-5" aria-hidden="true" /></button></DialogTrigger>
        <DialogContent className="left-0 top-0 block h-[100svh] max-h-none w-[min(320px,100vw)] max-w-none translate-x-0 translate-y-0 rounded-none border-0 px-6 py-0 sm:max-h-none sm:rounded-none [&>button]:flex [&>button]:h-11 [&>button]:w-11 [&>button]:items-center [&>button]:justify-center [&>button]:right-2 [&>button]:top-2">
          <DialogTitle className="sr-only">Admin navigation</DialogTitle>
          <DialogDescription className="sr-only">Store operations, publishing and business tools.</DialogDescription>
          <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
      <span className="text-sm font-semibold">FreshPick admin</span>
    </div>
  </>;
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return <>
    <Link href="/admin" onClick={onNavigate} className="flex h-20 shrink-0 items-center text-xl font-bold tracking-tight text-brand-green"><Wordmark /></Link>
    <nav aria-label="Admin navigation" className="space-y-7 pb-8">
      {groups.map(group => <div key={group.name}>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{group.name}</p>
        <ul className="-mx-2 space-y-1">{group.items.map(item => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/')) || (item.href === '/admin/subscriptions' && pathname === '/admin/subscription-deliveries') || (item.href === '/admin/suppliers' && ['/admin/supplier-uploads', '/admin/supplier-applications'].includes(pathname));
          return <li key={item.href}><Link href={item.href} onClick={onNavigate} aria-current={active ? 'page' : undefined} className={cn('flex min-h-11 items-center gap-3 px-2 py-2 text-sm font-medium transition-colors', active ? 'bg-secondary text-brand-green' : 'text-foreground hover:bg-secondary hover:text-brand-green')}><item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />{item.name}</Link></li>;
        })}</ul>
      </div>)}
      <Link href="/" onClick={onNavigate} className="flex min-h-11 items-center justify-between border-t border-border pt-4 text-xs font-semibold uppercase text-brand-green">View store <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
    </nav>
  </>;
}
