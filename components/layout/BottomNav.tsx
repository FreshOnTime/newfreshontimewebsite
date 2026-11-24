'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Compass, BookOpen, Bookmark } from 'lucide-react';

const links = [
  { href: '/', label: 'Home', icon: House }, { href: '/makers', label: 'Explore', icon: Compass },
  { href: '/stories', label: 'Stories', icon: BookOpen }, { href: '/saved', label: 'Saved', icon: Bookmark },
];

export default function BottomNav() {
  const path = usePathname();
  return <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
    {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={(href === '/' ? path === '/' : path.startsWith(href)) ? 'page' : undefined} className="mast-link flex min-h-16 flex-col items-center justify-center gap-1 text-xs">
      <Icon size={19} />{label}
    </Link>)}
  </nav>;
}
