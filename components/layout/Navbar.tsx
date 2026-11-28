"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Menu, Search, UserRound, X, Heart, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { MARKET_NAVIGATION,isMarketRouteActive,isJournalRoute } from "@/lib/navigation";
import Wordmark from "@/components/brand/Wordmark";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const contactLink = {label:"Contact",href:"/contact"};
const cultureLinks=[{label:'Food guides & comparisons',href:'/guides'},{label:'Food Atlas',href:'/food-atlas'},{label:'Food traditions',href:'/traditions'},{label:'Food events & experiences',href:'/experiences'}];
type HeaderDropdown = "journal" | "account";
const headerDropdownClass = "z-[60] max-h-[var(--radix-dropdown-menu-content-available-height)] max-w-[calc(100vw-24px)] overflow-y-auto overscroll-contain rounded-xl border-[#d5d6c7] bg-[#F8F5EE] p-2 text-[#191c19] shadow-lg";
const headerItemClass = "min-h-11 cursor-pointer rounded-lg px-3 py-2 text-[#191c19] focus:bg-[#e8eadf] focus:text-[#173e2b]";
const iconButton = "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-brand-green transition-colors hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState<HeaderDropdown | null>(null);
  const navigatingDropdown = useRef<HeaderDropdown | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const maker = user?.role === "supplier";
  const account = (user?.role === "admin"||user?.secondaryRoles?.includes("admin")) ? "/admin" : "/dashboard";
  const links = [...MARKET_NAVIGATION, {label:maker ? "Business studio" : "For businesses", href:maker ? "/dashboard" : "/for-businesses"}, contactLink];

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); setOpenDropdown(null); }, [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeMenus = () => { setMenuOpen(false); setSearchOpen(false); setOpenDropdown(null); };
    desktop.addEventListener("change", closeMenus);
    return () => desktop.removeEventListener("change", closeMenus);
  }, []);
  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); setSearchOpen(false); } };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menuOpen, searchOpen]);

  function changeDropdown(name: HeaderDropdown, open: boolean) {
    if (open) {
      navigatingDropdown.current = null;
      setMenuOpen(false);
      setSearchOpen(false);
    }
    setOpenDropdown(current => open ? name : current === name ? null : current);
  }
  function closeForNavigation(name: HeaderDropdown) {
    navigatingDropdown.current = name;
    setOpenDropdown(current => current === name ? null : current);
  }
  function restoreFocus(name: HeaderDropdown, event: Event) {
    // Do not focus a sticky trigger while Next is changing routes. Escape still restores focus.
    if (navigatingDropdown.current === name) {
      event.preventDefault();
      navigatingDropdown.current = null;
    }
  }

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
            {links.map((link) => { if(link.href==="/stories")return <DropdownMenu key={link.href} modal={false} open={openDropdown === "journal"} onOpenChange={open => changeDropdown("journal", open)}><DropdownMenuTrigger asChild><button type="button" className={`inline-flex min-h-11 items-center gap-1 whitespace-nowrap border-b text-[13px] font-medium ${isJournalRoute(pathname)?"border-brand-green text-brand-green":"border-transparent text-foreground hover:border-brand-green"}`} aria-label="Journal and food culture">Journal <ChevronDown aria-hidden="true" size={14} className={`shrink-0 transition-transform ${openDropdown === "journal" ? "rotate-180" : ""}`}/></button></DropdownMenuTrigger><DropdownMenuContent align="start" sideOffset={8} collisionPadding={12} onCloseAutoFocus={event => restoreFocus("journal", event)} className={`${headerDropdownClass} w-64`}>{[{label:"Journal",href:"/stories"},...cultureLinks].map(item=><DropdownMenuItem key={item.href} asChild onSelect={() => closeForNavigation("journal")}><Link href={item.href} className={headerItemClass} aria-current={pathname === item.href || pathname.startsWith(item.href + "/") ? "page" : undefined}>{item.label}</Link></DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>; const active = isMarketRouteActive(pathname,link.href); return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`inline-flex min-h-11 items-center whitespace-nowrap border-b text-[13px] font-medium tracking-normal transition-colors ${active ? "border-brand-green text-brand-green" : "border-transparent text-foreground hover:border-brand-green"}`}>{link.label}</Link>; })}
          </nav>
          <div className="flex shrink-0 items-center gap-0 sm:gap-1">
            <button type="button" aria-label={searchOpen ? "Close search" : "Open search"} aria-expanded={searchOpen} aria-controls="header-search" onClick={() => { setSearchOpen((open) => !open); setMenuOpen(false); setOpenDropdown(null); }} className={iconButton}><Search strokeWidth={1.5} aria-hidden="true" className="h-5 w-5" /></button>
            <DropdownMenu modal={false} open={openDropdown === "account"} onOpenChange={open => changeDropdown("account", open)}>
              <DropdownMenuTrigger asChild><button type="button" aria-label="Open account menu" className={`${iconButton} ${user?"fp-signed-in-account":""}`}>{user?<span aria-hidden="true" className="text-sm font-bold">{(user.firstName?.trim().slice(0,1)||"A").toUpperCase()}</span>:<UserRound strokeWidth={1.5} aria-hidden="true" className="h-5 w-5" />}</button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} collisionPadding={12} onCloseAutoFocus={event => restoreFocus("account", event)} className={`${headerDropdownClass} w-56`}>
                {user ? <>
                  <div className="fp-account-menu-heading mb-2"><p className="text-xs font-medium">Signed in</p><p className="font-semibold text-sm">{user.firstName||'Your account'}</p><p className="text-xs mt-1">{account==='/admin'?'Administrator':maker?'Business account':'Member account'}</p></div>
                  {[[user.role==='admin'||user.secondaryRoles?.includes('admin')?'Admin dashboard':maker ? 'Business studio' : 'Your account',account],['Profile','/profile'],['Saved picks','/saved']].map(([label,href]) => <DropdownMenuItem key={href} asChild onSelect={() => closeForNavigation("account")}><Link href={href} className={headerItemClass}>{label}</Link></DropdownMenuItem>)}
                  <DropdownMenuSeparator /><DropdownMenuItem onSelect={() => { closeForNavigation("account"); void signOut(); }} className="min-h-11 cursor-pointer text-destructive">Sign out</DropdownMenuItem>
                </> : <><DropdownMenuItem asChild onSelect={() => closeForNavigation("account")}><Link href="/auth/login" className={headerItemClass}>Sign in</Link></DropdownMenuItem><DropdownMenuItem asChild onSelect={() => closeForNavigation("account")}><Link href="/auth/signup" className={headerItemClass}>Create account</Link></DropdownMenuItem></>}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/saved" aria-label="Saved picks" aria-current={pathname === '/saved' ? 'page' : undefined} className={`${iconButton} fp-header-saved`}><Heart strokeWidth={1.5} aria-hidden="true" className={`h-5 w-5 ${pathname === '/saved' ? 'fill-brand-green/15' : ''}`} /></Link>
            <button type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="heritage-mobile-menu" onClick={() => { setMenuOpen((open) => !open); setSearchOpen(false); setOpenDropdown(null); }} className={`${iconButton} xl:hidden`}>{menuOpen ? <X strokeWidth={1.5} aria-hidden="true" className="h-5 w-5" /> : <Menu strokeWidth={1.5} aria-hidden="true" className="h-5 w-5" />}</button>
          </div>
      </div>
      {searchOpen && <div id="header-search" className="border-t border-border"><form onSubmit={search} role="search" className="fp-header-search-form editorial-wrap flex items-center gap-4 py-5"><label htmlFor="nav-search" className="sr-only">Search FreshPick</label><input id="nav-search" type="search" maxLength={100} autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search places, products or articles" className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-white px-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-green" /><button type="submit" className="fp26-action">Search</button></form></div>}
      {menuOpen && <div id="heritage-mobile-menu" className="absolute inset-x-0 top-full max-h-[calc(100dvh-76px)] overflow-y-auto overscroll-contain border-t border-brand-green/10 bg-brand-cream/95 shadow-xl backdrop-blur-xl xl:hidden">
        <nav aria-label="Mobile discovery navigation" className="editorial-wrap grid gap-4 py-4">
          {[
            { title: "Discover", items: [...links.filter(link => link.href !== "/stories" && link.href !== "/contact" && link.href !== "/for-businesses" && link.href !== "/dashboard"), {label:"Food departments",href:"/explore"},{label:"Explore by country",href:"/countries"},{label:"Food in Colombo",href:"/locations/colombo"},{label:"Products",href:"/food-products"},{label:"Food gifts",href:"/gifting"},{label:"FreshPick Live",href:"/live"}] },
            { title: "Journal & food culture", items: [{label:"Journal",href:"/stories"},...cultureLinks,{label:"Food calculators",href:"/food-tools"},{label:"Editorial archive",href:"/blog"}] },
            { title: "Business & support", items: [{label:"For businesses",href:"/for-businesses"},{label:"List your business",href:"/join"},...(maker?[{label:"Business studio",href:"/dashboard"}]:[]),{label:"About FreshPick",href:"/about"},{label:"How it works",href:"/how-it-works"},{label:"Help",href:"/help"},contactLink] },
            { title: "Your account", items: [{label:"Saved picks",href:"/saved"},...(user?[{label:"Your account",href:account},{label:"Profile",href:"/profile"}]:[{label:"Sign in",href:"/auth/login"},{label:"Create account",href:"/auth/signup"}])] }
          ].map(group => (
            <details key={group.title}  className="group rounded-xl border border-border bg-background">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold text-brand-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-green [&::-webkit-details-marker]:hidden">{group.title}<ChevronDown aria-hidden="true" size={18} className="shrink-0 transition-transform group-open:rotate-180"/></summary>
              <div className="grid gap-1 border-t border-border px-3 py-2 sm:grid-cols-2">
                {group.items.map(link => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} aria-current={pathname === link.href ? "page" : undefined} className={`flex min-h-12 items-center rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-green ${pathname === link.href ? "bg-secondary text-brand-green" : "text-foreground hover:bg-secondary"}`}>{link.label}</Link>)}
              </div>
            </details>
          ))}
          {user && <button type="button" onClick={() => { setMenuOpen(false); void signOut(); }} className="min-h-12 rounded-xl border border-border text-sm font-semibold text-destructive">Sign out</button>}
        </nav>
      </div>}
    </header>
  );
}
