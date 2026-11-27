"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Menu, Search, UserRound, X, Heart, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { MARKET_NAVIGATION,isMarketRouteActive,isJournalRoute } from "@/lib/navigation";
import Wordmark from "@/components/brand/Wordmark";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const cultureLinks=[{label:'Food guides & comparisons',href:'/guides'},{label:'Food Atlas',href:'/food-atlas'},{label:'Food traditions',href:'/traditions'},{label:'Food experiences',href:'/experiences'}];
const iconButton = "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-brand-green transition-colors hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const maker = user?.role === "supplier";
  const account = user?.role === "admin" ? "/admin" : "/dashboard";
  const links = [...MARKET_NAVIGATION, {label:maker ? "Business studio" : "For businesses", href:maker ? "/dashboard" : "/for-businesses"}, {label:"Contact",href:"/contact"}];

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [pathname]);
  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); setSearchOpen(false); } };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menuOpen, searchOpen]);

  function search(event: FormEvent) {
    event.preventDefault();
    setSearchOpen(false); router.push(query.trim() ? `/discover?q=${encodeURIComponent(query.trim().slice(0,100))}` : "/discover");
  }
  async function signOut() {
    try { await logout(); router.push("/"); }
    catch (error) { console.error("Sign out failed:", error); }
  }

  return (
    <header className="heritage-header sticky top-0 z-50 border-b border-brand-green/10 bg-[#F8F5EE]">
      <div className="fp-header-inner editorial-wrap flex h-[72px] items-center justify-between gap-2 sm:gap-5 lg:h-[76px]">
        <Link href="/" aria-label="FreshPick home" className="shrink-0"><Wordmark className="text-[26px] sm:text-[30px] lg:text-[30px]" /></Link>
          <nav aria-label="Discover FreshPick" className="hidden h-full items-center gap-3 2xl:gap-5 xl:flex">
            {links.map((link) => { if(link.href==="/stories")return <DropdownMenu key={link.href}><DropdownMenuTrigger asChild><button type="button" className={`inline-flex min-h-11 items-center gap-1 whitespace-nowrap border-b text-[13px] font-medium ${isJournalRoute(pathname)?"border-brand-green text-brand-green":"border-transparent text-foreground hover:border-brand-green"}`} aria-label="Journal and food culture">Journal <ChevronDown size={14}/></button></DropdownMenuTrigger><DropdownMenuContent align="start" className="w-64 max-w-[calc(100vw-24px)] rounded-xl border-border bg-background p-2 shadow-lg">{[{label:"Journal",href:"/stories"},...cultureLinks].map(item=><DropdownMenuItem key={item.href} asChild><Link href={item.href} className="min-h-11">{item.label}</Link></DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>; const active = isMarketRouteActive(pathname,link.href); return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`inline-flex min-h-11 items-center whitespace-nowrap border-b text-[13px] font-medium tracking-normal transition-colors ${active ? "border-brand-green text-brand-green" : "border-transparent text-foreground hover:border-brand-green"}`}>{link.label}</Link>; })}
          </nav>
          <div className="flex shrink-0 items-center gap-0 sm:gap-1">
            <button type="button" aria-label={searchOpen ? "Close search" : "Open search"} aria-expanded={searchOpen} aria-controls="header-search" onClick={() => { setSearchOpen((open) => !open); setMenuOpen(false); }} className={iconButton}><Search strokeWidth={1.5} aria-hidden="true" className="h-5 w-5" /></button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><button type="button" aria-label="Open account menu" className={iconButton}><UserRound strokeWidth={1.5} aria-hidden="true" className="h-5 w-5" /></button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-border bg-background p-2 shadow-sm">
                {user ? <>
                  {[[maker ? 'Business studio' : 'Your account',account],['Profile','/profile'],['Saved picks','/saved']].map(([label,href]) => <DropdownMenuItem key={href} asChild><Link href={href} className="min-h-11">{label}</Link></DropdownMenuItem>)}
                  <DropdownMenuSeparator /><DropdownMenuItem onSelect={() => void signOut()} className="min-h-11 text-destructive">Sign out</DropdownMenuItem>
                </> : <><DropdownMenuItem asChild><Link href="/auth/login" className="min-h-11">Sign in</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/auth/signup" className="min-h-11">Create account</Link></DropdownMenuItem></>}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/saved" aria-label="Saved picks" aria-current={pathname === '/saved' ? 'page' : undefined} className={`${iconButton} fp-header-saved`}><Heart strokeWidth={1.5} aria-hidden="true" className={`h-5 w-5 ${pathname === '/saved' ? 'fill-brand-green/15' : ''}`} /></Link>
            <button type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="heritage-mobile-menu" onClick={() => { setMenuOpen((open) => !open); setSearchOpen(false); }} className={`${iconButton} xl:hidden`}>{menuOpen ? <X strokeWidth={1.5} aria-hidden="true" className="h-5 w-5" /> : <Menu strokeWidth={1.5} aria-hidden="true" className="h-5 w-5" />}</button>
          </div>
      </div>
      {searchOpen && <div id="header-search" className="border-t border-border"><form onSubmit={search} role="search" className="fp-header-search-form editorial-wrap flex items-center gap-4 py-5"><label htmlFor="nav-search" className="sr-only">Search FreshPick</label><input id="nav-search" type="search" maxLength={100} autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search places, products or articles" className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-white px-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-green" /><button type="submit" className="fp26-action">Search</button></form></div>}
      {menuOpen && <div id="heritage-mobile-menu" className="max-h-[75svh] overflow-y-auto border-t border-brand-green/10 bg-brand-cream/95 shadow-xl backdrop-blur-xl xl:hidden">
        <nav aria-label="Mobile discovery navigation" className="fp-mobile-links editorial-wrap grid gap-x-6 py-6 sm:grid-cols-2">{[...links,...cultureLinks,{label:"Saved picks",href:"/saved"}].map((link) => <Link key={link.href} href={link.href} aria-current={isMarketRouteActive(pathname,link.href) ? "page" : undefined} className="flex min-h-12 items-center border-b border-border py-3 text-base font-semibold text-brand-green">{link.label}</Link>)}</nav>
      </div>}
    </header>
  );
}
