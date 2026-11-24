'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Bookmark, LogOut, MapPin, Menu, Search, User, X } from 'lucide-react';
import { MARKET_NAVIGATION } from '@/lib/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function Navbar() {
  const path = usePathname() || '';
  const router = useRouter();
  const { user, logout } = useAuth();
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === path;
  const account = user?.role === 'admin' ? '/admin' : '/dashboard';
  const maker = user?.role === 'supplier';
  const makerLink = { href: maker ? '/dashboard' : '/join', label: maker ? 'Maker studio' : 'Become a maker' };
  const links = [...MARKET_NAVIGATION, makerLink, { href: '/how-it-works', label: 'How it works' }];
  const active = (href: string) => path === href || path.startsWith(href + '/');
  async function signOut() { setOpenFor(null); await logout(); router.push('/'); }
  return <header className="heritage-header bg-white shadow-sm sticky top-0 z-50">
    <div className="bg-green-50 border-b border-green-100">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 sm:gap-4 text-green-700">
            <span className="flex items-center whitespace-nowrap"><MapPin className="w-4 h-4 mr-1" aria-hidden="true"/> Sri Lanka</span>
            <span className="text-gray-600" aria-hidden="true">|</span>
            <span className="font-medium">Meet your local food makers</span>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-gray-600"><Link href="/contact">Help</Link><Link href="/about">About Us</Link></div>
        </div>
      </div>
    </div>
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-16 gap-2">
        <Link href="/" className="flex shrink-0 items-center space-x-2" aria-label="FreshPick home">
          <Image src="/fresh-pick.svg" alt="" width={40} height={40}/><span className="text-2xl font-bold text-green-700">Fresh Pick</span>
        </Link>
        <form action="/makers" className="heritage-search hidden md:flex flex-1 max-w-xl mx-4 lg:mx-8" role="search">
          <Search className="w-5 h-5" aria-hidden="true"/><input name="q" aria-label="Search makers or food" placeholder="Search makers, food and crafts..."/><button type="submit">Search</button>
        </form>
        <div className="flex items-center gap-2 sm:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><button type="button" className="hidden md:flex min-h-11 items-center gap-2 text-sm" aria-label="Account menu"><User className="w-5 h-5"/><span>{user ? user.firstName : 'Account'}</span></button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-white text-gray-900">
              {user ? <><DropdownMenuItem asChild><Link href={account}>{maker ? 'Maker studio' : 'Dashboard'}</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/profile">My profile</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/saved">Saved picks</Link></DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem onClick={() => void signOut()}><LogOut className="mr-2 w-4 h-4"/>Sign out</DropdownMenuItem></> : <><DropdownMenuItem asChild><Link href="/auth/signup">Sign up</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/auth/login">Sign in</Link></DropdownMenuItem></>}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/saved" aria-label="Saved picks" className="grid min-h-11 min-w-11 place-items-center"><Bookmark className="w-6 h-6"/></Link>
          <button type="button" className="grid min-h-11 min-w-11 place-items-center md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="heritage-mobile-menu" onClick={() => setOpenFor(open ? null : path)}>{open ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}</button>
        </div>
      </div>
      <nav aria-label="Discover FreshPick" className="hidden md:flex items-center gap-8 py-3 border-t border-gray-100 overflow-x-auto">
        {links.map(link => <Link key={link.href} href={link.href} aria-current={active(link.href) ? 'page' : undefined} className="heritage-nav-link whitespace-nowrap py-2 text-sm">{link.label}</Link>)}
      </nav>
      <div className="md:hidden border-t border-gray-100 py-3">
        <form action="/makers" className="heritage-search flex" role="search"><Search className="w-5 h-5" aria-hidden="true"/><input name="q" aria-label="Search makers or food" placeholder="Search makers or food..."/><button type="submit">Go</button></form>
      </div>
    </div>
    {open && <div id="heritage-mobile-menu" className="md:hidden bg-white border-t border-gray-200 max-h-[55dvh] overflow-y-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="border-b border-gray-200 pb-4 mb-4"><div className="flex items-center space-x-3 mb-3"><User className="w-6 h-6 text-gray-600"/><span className="font-medium">Account</span></div>
          <div className="space-y-2 ml-9 text-gray-600">
            {user ? <><Link className="block" href={account} onClick={() => setOpenFor(null)}>{maker ? 'Maker studio' : 'Dashboard'}</Link><Link className="block" href="/profile" onClick={() => setOpenFor(null)}>My profile</Link><button type="button" onClick={() => void signOut()}>Sign out</button></> : <><Link className="block" href="/auth/signup" onClick={() => setOpenFor(null)}>Sign up</Link><Link className="block" href="/auth/login" onClick={() => setOpenFor(null)}>Sign in</Link></>}
          </div>
        </div>
        <nav aria-label="Mobile discovery" className="space-y-2">{links.map(link => <Link key={link.href} href={link.href} aria-current={active(link.href) ? 'page' : undefined} className="heritage-nav-link block py-2" onClick={() => setOpenFor(null)}>{link.label}</Link>)}<Link href="/contact" className="block py-2" onClick={() => setOpenFor(null)}>Help & support</Link></nav>
      </div>
    </div>}
  </header>;
}
