"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, Search, ShoppingBag, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useBag } from "@/contexts/BagContext";
import { scheduleIdleTask } from "@/lib/utils/idleCallback";

interface NavCategory {
  name: string;
  slug: string;
}

const NAV_CATEGORIES_CACHE_KEY = "freshpick_nav_categories_v2";
const NAV_CATEGORIES_CACHE_TTL = 60 * 60 * 1000;

const primaryLinks = [
  { label: "Discover", href: "/discover" },
  { label: "Recipes", href: "/recipes" },
  { label: "Market", href: "/products" },
  { label: "Makers", href: "/homemade" },
  { label: "Meals", href: "/meals" },
  { label: "Weekly basket", href: "/subscriptions" },
];

const secondaryLinks = [
  { label: "Creators", href: "/creators" },
  { label: "Partner with us", href: "/b2b" },
  { label: "Journal", href: "/blog" },
  { label: "Our story", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function readCachedCategories(): NavCategory[] | null {
  try {
    const raw = localStorage.getItem(NAV_CATEGORIES_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { timestamp?: unknown; categories?: unknown };
    if (
      typeof cached.timestamp !== "number" ||
      Date.now() - cached.timestamp > NAV_CATEGORIES_CACHE_TTL ||
      !Array.isArray(cached.categories)
    ) {
      localStorage.removeItem(NAV_CATEGORIES_CACHE_KEY);
      return null;
    }
    return cached.categories.filter(
      (category): category is NavCategory =>
        Boolean(category) &&
        typeof category.name === "string" &&
        typeof category.slug === "string"
    );
  } catch {
    return null;
  }
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [navCategories, setNavCategories] = useState<NavCategory[]>([]);
  const [hasRequestedCategories, setHasRequestedCategories] = useState(false);
  const { user, logout } = useAuth();
  const { bags } = useBag();
  const bagCount = bags?.length || 0;
  const router = useRouter();
  const pathname = usePathname();
  const prefetchedRoutes = useRef(new Set<string>());

  const prefetchRoute = useCallback((href: string) => {
    if (prefetchedRoutes.current.has(href)) return;
    prefetchedRoutes.current.add(href);
    router.prefetch(href);
  }, [router]);

  useEffect(() => {
    const task = scheduleIdleTask(() => {
      ["/discover", "/recipes", "/products", "/subscriptions"].forEach(prefetchRoute);
    }, { timeout: 2500, fallbackDelayMs: 1800 });

    return () => task.cancel();
  }, [prefetchRoute]);


  useEffect(() => {
    setIsMenuOpen(false);
    setIsAccountOpen(false);
  }, [pathname]);

  const loadCategories = async () => {
    if (hasRequestedCategories) return;
    setHasRequestedCategories(true);

    const cached = readCachedCategories();
    if (cached) {
      setNavCategories(cached);
      return;
    }

    try {
      const res = await fetch("/api/categories");
      if (!res.ok) return;
      const json = await res.json();
      const items: unknown[] = Array.isArray(json?.data) ? json.data : [];
      const categories = items
        .map((c) => {
          if (typeof c === "object" && c && "name" in c && "slug" in c) {
            const cc = c as { name?: unknown; slug?: unknown };
            return { name: String(cc.name ?? ""), slug: String(cc.slug ?? "") };
          }
          return { name: "", slug: "" };
        })
        .filter((c) => Boolean(c.name) && Boolean(c.slug));
      setNavCategories(categories);
      localStorage.setItem(
        NAV_CATEGORIES_CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), categories })
      );
    } catch {
      // Navigation data should never block page rendering.
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = async () => {
    try {
      setIsAccountOpen(false);
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const textColor = "text-white/90";
  const activeColor = "text-white";
  const iconColor = "text-white";

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <>
      <div className="h-[76px]" aria-hidden="true" />

      <div className="fixed inset-x-0 top-0 z-50">
        <header
          className="w-full border-b transition-all duration-500 border-brand-green bg-brand-green py-2.5"
        >
          <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-4 px-5 md:px-8 xl:px-12">
            <div className="flex min-w-0 items-center gap-8 xl:gap-11">
              <Link href="/" className="relative z-50 shrink-0" aria-label="FreshPick home">
                <div className="flex flex-col leading-none">
                  <span className="font-serif text-[1.7rem] font-bold tracking-[-0.035em] md:text-[1.9rem] text-white">
                    Fresh<span className="text-brand-cream">Pick</span>
                  </span>
                  <span className="mt-1 text-xs font-medium text-white/80">
                    Colombo
                  </span>
                </div>
              </Link>

              <nav aria-label="Main navigation" className="hidden items-center gap-1 xl:flex">
                {primaryLinks.map((item) => (
                  <Link
                    key={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    prefetch={false}
                    href={item.href}
                    onMouseEnter={() => prefetchRoute(item.href)}
                    onFocus={() => prefetchRoute(item.href)}
                    className={`relative rounded-full px-3 py-2 text-[13px] font-medium tracking-[-0.01em] transition-colors xl:px-3.5 ${
                      isActive(item.href) ? activeColor : `${textColor} hover:text-white`
                    }`}
                  >
                    {item.label}
                    {isActive(item.href) && (
                      <span className="absolute inset-x-3 -bottom-0.5 h-px bg-brand-amber" />
                    )}
                  </Link>
                ))}

                <div
                  className="group relative"
                  onMouseEnter={() => {
                    loadCategories();
                    prefetchRoute("/categories");
                  }}
                  onFocus={() => {
                    loadCategories();
                    prefetchRoute("/categories");
                  }}
                >
                  <button className={`flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-medium ${textColor} transition-colors hover:opacity-100`}>
                    Browse <ChevronDown className="h-3.5 w-3.5 opacity-55" />
                  </button>
                  <div className="invisible absolute left-0 top-full w-[290px] translate-y-2 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-card p-3 shadow-sm ">
                      <div className="px-3 pb-3 pt-2">
                        <p className="text-xs font-semibold text-emerald-700">Browse FreshPick</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">Fresh food and household essentials by category.</p>
                      </div>
                      <div className="border-t border-zinc-100 pt-2">
                        {navCategories.slice(0, 6).map((cat) => (
                          <Link
                            key={cat.slug}
                            href={`/categories/${cat.slug}`}
                            prefetch={false}
                            className="block rounded-xl px-3 py-2.5 text-sm text-zinc-600 transition-colors hover:bg-secondary hover:text-emerald-900"
                          >
                            {cat.name}
                          </Link>
                        ))}
                        <Link href="/categories" prefetch={false} className="mt-1 block rounded-xl border-t border-zinc-100 px-3 py-3 text-sm font-semibold text-emerald-800">
                          All categories
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </nav>
            </div>

            <div className="flex shrink-0 items-center gap-2 md:gap-3">
              <form onSubmit={handleSearch} className="hidden md:block">
                <div className="flex h-10 items-center rounded-full border px-3.5 transition-all lg:w-[170px] xl:w-[215px] 2xl:w-[250px] border-brand-cream bg-brand-cream text-foreground focus-within:border-brand-amber">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    type="text"
                    aria-label="Search FreshPick"
                    placeholder="Search food..."
                    className="ml-2.5 min-w-0 flex-1 bg-transparent text-sm font-light outline-none placeholder:text-muted-foreground"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>

              <div className="relative hidden xl:block">
                <button
                  type="button"
                  aria-expanded={isAccountOpen}
                  aria-haspopup="menu"
                  onClick={() => setIsAccountOpen((open) => !open)}
                  className="rounded-full px-3 py-2 text-[13px] font-medium transition-colors text-white/90 hover:text-white"
                >
                  {user ? <span className="max-w-[95px] truncate">{user.firstName}</span> : "Sign in"}
                </button>

                {isAccountOpen && (
                  <div role="menu" className="absolute right-0 mt-3 w-60 rounded-xl border border-zinc-200 bg-card p-2.5 shadow-sm ">
                    {!user ? (
                      <>
                        <Link href="/auth/login" className="block rounded-xl px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-50">Sign in</Link>
                        <Link href="/auth/signup" className="block rounded-xl px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-50">Create an account</Link>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-3">
                          <p className="text-xs font-semibold text-muted-foreground">Your FreshPick</p>
                          <p className="mt-1 truncate text-sm font-medium text-zinc-900">{user.firstName}</p>
                        </div>
                        <div className="border-t border-zinc-100 pt-2">
                          <Link href="/for-you" className="block rounded-xl px-4 py-2.5 text-sm text-zinc-600 hover:bg-secondary">For You</Link>
                          <Link href="/profile" className="block rounded-xl px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50">Profile</Link>
                          <Link href="/dashboard" className="block rounded-xl px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50">Account home</Link>
                          <Link href="/orders" className="block rounded-xl px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50">Orders</Link>
                          <Link href="/bags" className="block rounded-xl px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50">Shopping bags</Link>
                        </div>
                        <div className="mt-2 border-t border-zinc-100 pt-2">
                          <button type="button" onClick={handleLogout} className="block w-full rounded-xl px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50">Sign out</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Link prefetch={false} href="/bags" aria-label="Shopping bags" className="relative">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors border-white/40 bg-brand-green text-white hover:bg-white/10">
                  <ShoppingBag className="h-[18px] w-[18px]" />
                </span>
                {bagCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-amber px-1 text-xs font-bold text-accent-foreground ring-2 ring-brand-green">
                    {bagCount}
                  </span>
                )}
              </Link>

              <button
                type="button"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                className={`flex h-10 w-10 items-center justify-center rounded-full xl:hidden ${iconColor}`}
                onClick={() => setIsMenuOpen((open) => !open)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>
      </div>

      {isMenuOpen && (
        <div id="mobile-menu" className="fixed inset-0 z-40 overflow-y-auto bg-background px-5 pb-28 pt-28 xl:hidden">
          <div className="mx-auto max-w-xl">
            <form onSubmit={handleSearch} className="mb-8">
              <div className="flex h-12 items-center rounded-full border border-zinc-200 bg-card px-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search FreshPick on mobile"
                  placeholder="Search food, recipes, products..."
                  className="ml-3 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </form>

            <nav className="grid gap-2 sm:grid-cols-2">
              {primaryLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-zinc-200 bg-card px-5 py-4 font-serif text-2xl font-normal text-zinc-950"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-7 border-t border-zinc-300 pt-6">
              <p className="mb-4 text-xs font-semibold text-emerald-700">More FreshPick</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {secondaryLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="text-sm text-zinc-600">{item.label}</Link>
                ))}
                <Link href="/categories" className="text-sm text-zinc-600">All categories</Link>
              </div>
            </div>

            <div className="mt-8 rounded-xl bg-brand-green p-5 text-white">
              {user ? (
                <>
                  <p className="text-xs font-semibold text-emerald-200">Your account</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/70">
                    <Link href="/for-you">For You</Link>
                    <Link href="/profile">Profile</Link>
                    <Link href="/orders">Orders</Link>
                    <Link href="/bags">Shopping bags</Link>
                  </div>
                  <button className="mt-6 text-sm font-medium text-rose-200" onClick={handleLogout}>Sign out</button>
                </>
              ) : (
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <p className="text-xs font-semibold text-emerald-200">Make it yours</p>
                    <p className="mt-2 text-sm text-white/85">Sign in for saved bags, repeat reminders and personal picks.</p>
                  </div>
                  <Link href="/auth/login" className="shrink-0 rounded-full bg-card px-5 py-2.5 text-sm font-semibold text-zinc-950">Sign in</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
