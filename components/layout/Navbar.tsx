"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Menu, Search, UserRound, X, Heart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { MARKET_NAVIGATION } from "@/lib/navigation";
import Wordmark from "@/components/brand/Wordmark";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const moreLinks = [{ label: 'Contact', href: '/contact' }];
const iconButton = "flex h-11 w-9 max-[359px]:w-8 sm:w-11 items-center justify-center rounded-[3px] text-brand-green transition-colors hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const maker = user?.role === "supplier";
  const account = user?.role === "admin" ? "/admin" : "/dashboard";
  const links = [...MARKET_NAVIGATION, {label:maker ? "Maker studio" : "For businesses", href:maker ? "/dashboard" : "/for-businesses"}];

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [pathname]);
  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); setSearchOpen(false); } };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menuOpen, searchOpen]);

  function search(event: FormEvent) {
    event.preventDefault();
    if (query.trim()) { setSearchOpen(false); router.push(`/discover?q=${encodeURIComponent(query.trim())}`); }
  }
  async function signOut() {
    try { await logout(); router.push("/"); }
    catch (error) { console.error("Sign out failed:", error); }
  }

  return (
    <header className="heritage-header sticky top-0 z-50 border-b border-brand-green/10 bg-[#fffefa]">
      <div className="editorial-wrap max-[359px]:px-3 flex h-[72px] items-center justify-between gap-2 sm:gap-5 lg:h-[76px]">
        <Link href="/" aria-label="FreshPick home" className="shrink-0"><Wordmark className="text-[26px] max-[359px]:text-[22px] sm:text-[30px] lg:text-[30px]" /></Link>
          <nav aria-label="Discover FreshPick" className="hidden h-full items-center gap-4 2xl:gap-6 xl:flex">
            {links.map((link) => { const active = pathname === link.href || pathname.startsWith(`${link.href}/`); return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`inline-flex min-h-11 items-center border-b text-[13px] font-medium tracking-normal transition-colors ${active ? "border-brand-green text-brand-green" : "border-transparent text-foreground hover:border-brand-green"}`}>{link.label}</Link>; })}
          </nav>
          <div className="flex shrink-0 items-center gap-0 sm:gap-1">
            <button type="button" aria-label={searchOpen ? "Close search" : "Open search"} aria-expanded={searchOpen} aria-controls="header-search" onClick={() => { setSearchOpen((open) => !open); setMenuOpen(false); }} className={iconButton}><Search strokeWidth={1.5} aria-hidden="true" className="h-5 w-5" /></button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><button type="button" aria-label="Open account menu" className={iconButton}><UserRound strokeWidth={1.5} aria-hidden="true" className="h-5 w-5" /></button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-border bg-background p-2 shadow-sm">
                {user ? <>
                  {[[maker ? 'Maker studio' : 'Your account',account],['Profile','/profile'],['Saved picks','/saved']].map(([label,href]) => <DropdownMenuItem key={href} asChild><Link href={href} className="min-h-11">{label}</Link></DropdownMenuItem>)}
                  <DropdownMenuSeparator /><DropdownMenuItem onSelect={() => void signOut()} className="min-h-11 text-destructive">Sign out</DropdownMenuItem>
                </> : <><DropdownMenuItem asChild><Link href="/auth/login" className="min-h-11">Sign in</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/auth/signup" className="min-h-11">Create account</Link></DropdownMenuItem></>}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/saved" aria-label="Saved picks" aria-current={pathname === '/saved' ? 'page' : undefined} className={iconButton}><Heart strokeWidth={1.5} aria-hidden="true" className={`h-5 w-5 ${pathname === '/saved' ? 'fill-brand-green/15' : ''}`} /></Link>
            <button type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="heritage-mobile-menu" onClick={() => { setMenuOpen((open) => !open); setSearchOpen(false); }} className={`${iconButton} xl:hidden`}>{menuOpen ? <X strokeWidth={1.5} aria-hidden="true" className="h-5 w-5" /> : <Menu strokeWidth={1.5} aria-hidden="true" className="h-5 w-5" />}</button>
          </div>
      </div>
      {searchOpen && <div id="header-search" className="border-t border-border"><form onSubmit={search} role="search" className="editorial-wrap flex items-center gap-4 py-5"><label htmlFor="nav-search" className="sr-only">Search FreshPick</label><input id="nav-search" type="search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find food, a maker or a place" className="h-12 min-w-0 flex-1 border-0 border-b border-border bg-transparent text-base outline-none focus:border-primary" /><button type="submit" className="editorial-button">Search</button></form></div>}
      {menuOpen && <div id="heritage-mobile-menu" className="max-h-[75svh] overflow-y-auto border-t border-brand-green/10 bg-brand-cream/95 shadow-xl backdrop-blur-xl xl:hidden">
        <nav aria-label="Mobile discovery navigation" className="editorial-wrap grid gap-x-6 py-6 sm:grid-cols-2">{[...links,{label:"Saved picks",href:"/saved"},...moreLinks].map((link) => <Link key={link.href} href={link.href} aria-current={pathname === link.href || pathname.startsWith(`${link.href}/`) ? "page" : undefined} className="flex min-h-12 items-center border-b border-border py-3 text-base font-semibold text-brand-green">{link.label}</Link>)}</nav>
      </div>}
    </header>
  );
}
