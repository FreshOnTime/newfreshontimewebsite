"use client";

import ReferralBanner from "@/components/ReferralBanner"; // Add import

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  MapPin,
  LogOut,
  Settings,
  ShoppingBag,
  Package,
  Heart,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useBag } from "@/contexts/BagContext";
import { useLocalStorageCache, CACHE_TTL } from "@/lib/hooks/useLocalStorageCache";

interface NavCategory {
  name: string;
  slug: string;
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { bags } = useBag();
  const bagCount = bags?.length || 0;
  const router = useRouter();
  const pathname = usePathname();

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: navCategories } = useLocalStorageCache<NavCategory[]>(
    "navbar_categories",
    async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) return [];
      const json = await res.json();
      const items: unknown[] = Array.isArray(json?.data) ? json.data : [];
      return items
        .map((c) => {
          if (typeof c === "object" && c && "name" in c && "slug" in c) {
            const cc = c as { name?: unknown; slug?: unknown };
            return {
              name: String(cc.name ?? ""),
              slug: String(cc.slug ?? ""),
            };
          }
          return { name: "", slug: "" };
        })
        .filter((c) => Boolean(c.name) && Boolean(c.slug));
    },
    { ttl: CACHE_TTL.LONG }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isHome = pathname === "/";
  const textColor = isHome && !scrolled ? "text-white" : "text-zinc-900";
  const hoverColor = isHome && !scrolled ? "hover:text-amber-200" : "hover:text-emerald-700";
  const iconColor = isHome && !scrolled ? "text-white" : "text-zinc-600";

  return (
    <>
      {/* Spacer for fixed header (only on non-home pages) */}
      {!isHome && <div className="h-20" />}

      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center">


        <header
          className={`w-full transition-all duration-500 ease-in-out ${scrolled || !isHome
            ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100 py-3"
            : "bg-transparent py-6"
            }`}
        >
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex items-center justify-between">
              {/* Logo area */}
              <div className="flex items-center gap-12">
                <Link href="/" className="relative z-50 group">
                  <div className="flex flex-col">
                    <span className={`font-serif text-2xl md:text-3xl font-bold tracking-tight transition-colors duration-300 ${isHome && !scrolled ? "text-white" : "text-emerald-950"}`}>
                      Fresh<span className="italic text-emerald-500">Pick</span>
                    </span>
                    <span className={`text-[10px] uppercase tracking-[0.3em] font-medium transition-colors duration-300 ${isHome && !scrolled ? "text-white/70" : "text-emerald-900/60"}`}>
                      Colombo
                    </span>
                  </div>
                </Link>

                {/* Desktop Navigation - Minimal & Elegant */}
                <nav className="hidden lg:flex items-center gap-8">
                  <Link href="/products" className={`text-sm font-medium tracking-wide transition-all duration-300 relative group py-2 ${textColor} ${hoverColor}`}>
                    Shop
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full opacity-50" />
                  </Link>
                  <div className="relative group">
                    <button className={`flex items-center gap-1 text-sm font-medium tracking-wide transition-all duration-300 py-2 ${textColor} ${hoverColor}`}>
                      Collections
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                    {/* Mega Menu / Dropdown */}
                    <div className="absolute top-full left-0 w-64 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-premium p-4 border border-gray-100">
                        <div className="flex flex-col gap-1">
                          {(navCategories || []).slice(0, 6).map((cat) => (
                            <Link
                              key={cat.slug}
                              href={`/categories/${cat.slug}`}
                              className="text-sm text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50 px-3 py-2 rounded-lg transition-colors"
                            >
                              {cat.name}
                            </Link>
                          ))}
                          <Link href="/categories" className="text-xs font-bold uppercase tracking-wider text-emerald-600 mt-2 px-3 py-2 border-t border-gray-100 pt-3">
                            View All Collections
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link href="/subscriptions" className={`text-sm font-medium tracking-wide transition-all duration-300 py-2 ${textColor} ${hoverColor}`}>
                    Subscriptions
                  </Link>
                  <Link href="/about" className={`text-sm font-medium tracking-wide transition-all duration-300 py-2 ${textColor} ${hoverColor}`}>
                    Our Story
                  </Link>
                </nav>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-6">
                {/* Expandable Search */}
                <div className="hidden md:flex items-center">
                  <div className={`relative flex items-center ${scrolled || !isHome ? "bg-gray-100/50" : "bg-white/10"} rounded-full px-3 py-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:bg-white w-[250px] focus-within:w-[300px]`}>
                    <Search className={`w-4 h-4 ${iconColor} opacity-70 flex-shrink-0 peer-focus:text-zinc-900`} />
                    <input
                      type="text"
                      placeholder="Search..."
                      className={`bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-gray-400 focus:text-zinc-900 focus:placeholder:text-zinc-400 ${isHome && !scrolled ? "text-white placeholder:text-white/60" : "text-gray-900"}`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                    />
                  </div>
                </div>

                {/* Account */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={`hidden md:flex items-center gap-2 text-sm font-medium transition-colors ${textColor} ${hoverColor}`}>
                      {user ? (
                        <span className="max-w-[100px] truncate">{user.firstName}</span>
                      ) : (
                        "Sign In"
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-gray-100 shadow-premium">
                    {!user ? (
                      <>
                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                          <Link href="/auth/login">Access Account</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                          <Link href="/auth/signup">Create Account</Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                          <Link href="/profile">My Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                          <Link href="/orders">Orders</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 rounded-lg cursor-pointer">
                          Sign Out
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Cart */}
                <Link href="/bags" className="relative group">
                  <div className={`p-2 rounded-full transition-colors ${isHome && !scrolled ? "bg-white/10 hover:bg-white/20 text-white" : "bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-900"}`}>
                    <ShoppingBag className="w-5 h-5" />
                    {bagCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-amber-950">
                        {bagCount}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Mobile Menu Toggle */}
                <button
                  className={`md:hidden p-2 ${iconColor}`}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Luxury Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl pt-24 px-6 animate-in fade-in slide-in-from-top-10 duration-300">
          <nav className="flex flex-col gap-6 text-center">
            <Link href="/products" className="text-2xl font-serif font-medium text-gray-900" onClick={() => setIsMenuOpen(false)}>Shop</Link>
            <Link href="/categories" className="text-2xl font-serif font-medium text-gray-900" onClick={() => setIsMenuOpen(false)}>Collections</Link>
            <Link href="/subscriptions" className="text-2xl font-serif font-medium text-gray-900" onClick={() => setIsMenuOpen(false)}>Subscriptions</Link>
            <div className="h-px bg-gray-100 w-24 mx-auto my-2" />
            {user ? (
              <>
                <Link href="/profile" className="text-lg text-gray-600" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
                <Link href="/orders" className="text-lg text-gray-600" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
                <button
                  className="text-lg text-red-600 font-medium"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="text-lg text-gray-600" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}