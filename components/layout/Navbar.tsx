"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useBag } from "@/contexts/BagContext";

const links = [
  { label: "Shop all", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Recipes", href: "/recipes" },
  { label: "Ready meals", href: "/meals" },
  { label: "Local makers", href: "/homemade" },
  { label: "Weekly baskets", href: "/subscriptions" },
  { label: "For you", href: "/for-you" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { bags } = useBag();
  const itemCount = bags.reduce((total, bag) => total + bag.items.reduce((sum, item) => sum + item.quantity, 0), 0);

  useEffect(() => { setMenuOpen(false); setAccountOpen(false); }, [pathname]);
  useEffect(() => {
    if (!menuOpen && !accountOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); setAccountOpen(false); } };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menuOpen, accountOpen]);

  function search(event: FormEvent) {
    event.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  async function signOut() {
    try { await logout(); setAccountOpen(false); router.push("/"); }
    catch (error) { console.error("Sign out failed:", error); }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border">
      <div className="bg-brand-green text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-5 md:h-[72px] md:px-8">
          <Link href="/" aria-label="FreshPick home" className="shrink-0 text-2xl font-bold tracking-tight">FreshPick<span className="text-brand-amber">.</span></Link>
          <form onSubmit={search} role="search" className="hidden h-11 w-full max-w-xl items-center rounded-lg bg-background px-3 text-foreground md:flex">
            <label htmlFor="nav-search" className="sr-only">Search FreshPick</label>
            <input id="nav-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the market" className="min-w-0 flex-1 border-none bg-transparent text-sm outline-none focus:ring-0" />
            <button type="submit" aria-label="Submit search" className="flex h-9 w-9 items-center justify-center rounded-md text-brand-green hover:bg-secondary"><Search strokeWidth={1.75} aria-hidden="true" className="h-4 w-4" /></button>
          </form>
          <div className="flex shrink-0 items-center gap-2 md:gap-4">
            <div className="relative">
              <button type="button" aria-label="Open account menu" aria-expanded={accountOpen} aria-controls="account-navigation" onClick={() => { setAccountOpen((open) => !open); setMenuOpen(false); }} className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm hover:bg-white/10"><UserRound strokeWidth={1.75} aria-hidden="true" className="h-5 w-5" /><span className="hidden max-w-24 truncate sm:block">{user?.firstName || "Account"}</span></button>
              {accountOpen && <nav id="account-navigation" aria-label="Account navigation" className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-background p-2 text-foreground shadow-sm">
                {user ? <>
                  {[['Your account','/dashboard'],['Profile','/profile'],['Orders','/orders'],['Saved bags','/bags'],['Saved products','/wishlist']].map(([label,href]) => <Link key={href} href={href} className="block rounded-lg px-3 py-2.5 text-sm hover:bg-secondary">{label}</Link>)}
                  <button type="button" onClick={() => void signOut()} className="mt-1 w-full border-t border-border px-3 py-3 text-left text-sm text-destructive">Sign out</button>
                </> : <><Link href="/auth/login" className="block rounded-lg px-3 py-2.5 text-sm hover:bg-secondary">Sign in</Link><Link href="/auth/signup" className="block rounded-lg px-3 py-2.5 text-sm hover:bg-secondary">Create account</Link></>}
              </nav>}
            </div>
            <Link href="/bags" aria-label={`Shopping bags, ${itemCount} items`} className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm hover:bg-white/10"><ShoppingBag strokeWidth={1.75} aria-hidden="true" className="h-5 w-5" /><span className="hidden sm:block">Bag</span>{itemCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-amber px-1 text-xs font-semibold text-accent-foreground">{itemCount > 99 ? "99+" : itemCount}</span>}</Link>
            <button type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => { setMenuOpen((open) => !open); setAccountOpen(false); }} className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10 md:hidden">{menuOpen ? <X strokeWidth={1.75} aria-hidden="true" className="h-5 w-5" /> : <Menu strokeWidth={1.75} aria-hidden="true" className="h-5 w-5" />}</button>
          </div>
        </div>
      </div>
      <nav aria-label="Shop navigation" className="hidden bg-background md:block">
        <div className="mx-auto flex h-12 max-w-7xl items-center gap-7 overflow-x-auto px-8">
          {links.map((link) => { const active = pathname === link.href || pathname.startsWith(`${link.href}/`); return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`flex h-full shrink-0 items-center border-b-2 text-sm transition-colors ${active ? "border-brand-green font-semibold text-brand-green" : "border-transparent text-muted-foreground hover:text-brand-green"} `}>{link.label}</Link>; })}
        </div>
      </nav>
      {menuOpen && <div id="mobile-navigation" className="max-h-[70svh] overflow-y-auto border-t border-border bg-background p-5 md:hidden">
        <form onSubmit={search} role="search" className="mb-4 flex h-12 items-center gap-3 rounded-lg border border-border px-3"><label htmlFor="mobile-search" className="sr-only">Search FreshPick on mobile</label><input id="mobile-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the market" className="min-w-0 flex-1 border-none bg-transparent text-sm outline-none focus:ring-0" /><button type="submit" aria-label="Submit mobile search" className="flex h-10 w-10 items-center justify-center text-brand-green"><Search strokeWidth={1.75} aria-hidden="true" className="h-4 w-4" /></button></form>
        <nav aria-label="Mobile shop navigation" className="grid grid-cols-2 gap-1">{[...links,{label:'Our story',href:'/about'},{label:'Partner with us',href:'/b2b'},{label:'Help',href:'/contact'}].map((link) => <Link key={link.href} href={link.href} className="rounded-lg px-3 py-3 text-sm text-brand-green hover:bg-secondary">{link.label}</Link>)}</nav>
      </div>}
    </header>
  );
}
