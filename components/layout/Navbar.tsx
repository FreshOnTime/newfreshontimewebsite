"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, UserRound, X, LockKeyhole, ArrowLeft, Heart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { MARKET_NAVIGATION } from "@/lib/navigation";
import Wordmark from "@/components/brand/Wordmark";
import { useWishlist } from "@/contexts/WishlistContext";
import { useBag } from "@/contexts/BagContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const links = MARKET_NAVIGATION;
const moreLinks = [{ label: 'Contact', href: '/contact' }];
const iconButton = "flex h-11 w-9 max-[359px]:w-8 sm:w-11 items-center justify-center rounded-lg text-brand-green transition-colors hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { bags } = useBag();
  const { wishlistItems } = useWishlist();
  const savedCount = wishlistItems.length;
  const checkout = pathname === "/checkout";
  const itemCount = bags.reduce((total, bag) => total + bag.items.reduce((sum, item) => sum + item.quantity, 0), 0);

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [pathname]);
  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); setSearchOpen(false); } };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menuOpen, searchOpen]);

  function search(event: FormEvent) {
    event.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }
  async function signOut() {
    try { await logout(); router.push("/"); }
    catch (error) { console.error("Sign out failed:", error); }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="editorial-wrap max-[359px]:px-3 flex h-[76px] items-center justify-between gap-2 sm:gap-5 lg:h-[104px]">
        <Link href="/" aria-label="FreshPick home" className="shrink-0"><Wordmark className="text-[26px] max-[359px]:text-[22px] sm:text-[30px] lg:text-[34px]" /></Link>
        {checkout ? <>
          <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><LockKeyhole strokeWidth={1.5} className="h-4 w-4" aria-hidden="true" />Secure checkout</span>
          <Link href="/bags" className="inline-flex min-h-11 items-center gap-2 text-xs text-brand-green"><ArrowLeft strokeWidth={1.5} className="h-4 w-4" aria-hidden="true" />Back to bag</Link>
        </> : <>
          <nav aria-label="Shop navigation" className="hidden h-full items-center gap-4 2xl:gap-6 xl:flex">
            {links.map((link) => { const active = pathname === link.href || pathname.startsWith(`${link.href}/`); return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`inline-flex min-h-11 items-center border-b text-[13px] font-medium tracking-normal transition-colors ${active ? "border-brand-green text-brand-green" : "border-transparent text-foreground hover:border-brand-green"}`}>{link.label}</Link>; })}
          </nav>
          <div className="flex shrink-0 items-center gap-0 sm:gap-1">
            <button type="button" aria-label={searchOpen ? "Close search" : "Open search"} aria-expanded={searchOpen} aria-controls="header-search" onClick={() => { setSearchOpen((open) => !open); setMenuOpen(false); }} className={iconButton}><Search strokeWidth={1.5} aria-hidden="true" className="h-5 w-5" /></button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><button type="button" aria-label="Open account menu" className={iconButton}><UserRound strokeWidth={1.5} aria-hidden="true" className="h-5 w-5" /></button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-border bg-background p-2 shadow-sm">
                {user ? <>
                  {[['Your account','/dashboard'],['Profile & addresses','/profile'],['Orders','/orders'],['Saved bags','/bags'],['Saved products','/wishlist']].map(([label,href]) => <DropdownMenuItem key={href} asChild><Link href={href} className="min-h-11">{label}</Link></DropdownMenuItem>)}
                  <DropdownMenuSeparator /><DropdownMenuItem onSelect={() => void signOut()} className="min-h-11 text-destructive">Sign out</DropdownMenuItem>
                </> : <><DropdownMenuItem asChild><Link href="/auth/login" className="min-h-11">Sign in</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href="/auth/signup" className="min-h-11">Create account</Link></DropdownMenuItem></>}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/wishlist" aria-label={`Saved products${savedCount ? `, ${savedCount} items` : ''}`} aria-current={pathname === '/wishlist' ? 'page' : undefined} className={`${iconButton} relative`}><Heart strokeWidth={1.5} aria-hidden="true" className={`h-5 w-5 ${pathname === '/wishlist' ? 'fill-brand-green/15' : ''}`} />{savedCount > 0 && <span aria-hidden="true" className="absolute -right-0.5 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-amber px-1 text-[9px] font-bold text-foreground">{savedCount > 99 ? '99+' : savedCount}</span>}</Link>
            <Link href="/bags" aria-label={`Shopping bags, ${itemCount} items`} className="flex min-h-11 items-center gap-1 px-0 text-brand-green sm:gap-2 sm:px-2"><ShoppingBag strokeWidth={1.5} aria-hidden="true" className="h-5 w-5" /><span className="text-xs tabular-nums">({itemCount > 99 ? "99+" : itemCount})</span></Link>
            <button type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => { setMenuOpen((open) => !open); setSearchOpen(false); }} className={`${iconButton} xl:hidden`}>{menuOpen ? <X strokeWidth={1.5} aria-hidden="true" className="h-5 w-5" /> : <Menu strokeWidth={1.5} aria-hidden="true" className="h-5 w-5" />}</button>
          </div>
        </>}
      </div>
      {searchOpen && !checkout && <div id="header-search" className="border-t border-border"><form onSubmit={search} role="search" className="editorial-wrap flex items-center gap-4 py-5"><label htmlFor="nav-search" className="sr-only">Search FreshPick</label><input id="nav-search" type="search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search food, drinks and pantry essentials" className="h-12 min-w-0 flex-1 border-0 border-b border-border bg-transparent text-base outline-none focus:border-primary" /><button type="submit" className="editorial-button">Search</button></form></div>}
      {menuOpen && !checkout && <div id="mobile-navigation" className="max-h-[75svh] overflow-y-auto border-t border-border bg-background xl:hidden">
        <nav aria-label="Mobile shop navigation" className="editorial-wrap grid gap-x-5 py-5 sm:grid-cols-2">{[...links,...moreLinks].map((link) => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} className="flex min-h-12 items-center border-b border-border py-3 text-base font-medium text-brand-green">{link.label}</Link>)}</nav>
      </div>}
    </header>
  );
}
