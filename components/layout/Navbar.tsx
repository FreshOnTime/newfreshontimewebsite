"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NotificationCenter } from "@/components/NotificationCenter";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  MapPin,
  LogOut,
  Settings,
  Cake,
  CupSoda,
  Milk,
  Apple,
  Snowflake,
  Beef,
  Archive,
  Candy,
  ShoppingBasket,
  Drumstick,
  Carrot,
  IceCream2,
  Package,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
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

const categoryIcons: Record<string, React.ElementType> = {
  bakery: Cake,
  beverages: CupSoda,
  dairy: Milk,
  "dairy-eggs": Milk,
  produce: Apple,
  "fresh-produce": Carrot,
  frozen: Snowflake,
  "frozen-foods": IceCream2,
  meat: Beef,
  "meat-poultry": Drumstick,
  "meat-seafood": Drumstick,
  pantry: Archive,
  "pantry-staples": Package,
  snacks: Candy,
};

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const cartItemCount = 0; // This would come from your cart context/state
  const { bags } = useBag();
  const bagCount = bags?.length || 0;
  const router = useRouter();

  // Use cached categories - refreshes every 15 minutes
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
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
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

  return (
    <header className="fixed top-0 w-full z-50 transition-all duration-300">
      {/* Top announcement bar - Premium Dark Emerald */}
      <div className="bg-primary text-primary-foreground py-1.5 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 flex justify-between items-center text-[10px] md:text-xs font-medium tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
            <span>Premium Delivery in Colombo</span>
          </div>
          <div className="hidden md:flex gap-4">
            <Link href="/help" className="hover:text-accent transition-colors">Concierge Support</Link>
            <span>|</span>
            <Link href="/about" className="hover:text-accent transition-colors">Our Story</Link>
          </div>
        </div>
      </div>

      {/* Main Navbar - Glassmorphism */}
      <div className="glass border-b border-white/10 shadow-premium backdrop-blur-md bg-white/85">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                {/* Replaced with a text logo if image fails or use darker filter */}
                <Image
                  src="/fresh-pick.svg"
                  alt="Fresh Pick"
                  width={160}
                  height={45}
                  className="transform transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </Link>

            {/* Search bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-12">
              <form onSubmit={handleSearch} className="w-full relative group">
                <div className="relative transform transition-all duration-300 group-hover:-translate-y-0.5">
                  <Input
                    type="text"
                    placeholder="Search for excellence..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-6 rounded-2xl border-transparent bg-secondary/50 focus:bg-white focus:border-accent/30 focus:ring-0 shadow-inner text-sm transition-all"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </form>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              <NotificationCenter />

              {/* Wishlist */}
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="relative hover:bg-secondary/50 hover:text-primary transition-colors rounded-xl">
                  <Heart className="w-5 h-5" />
                </Button>
              </Link>

              {/* Shopping cart */}
              <Link href="/bags">
                <Button variant="ghost" size="icon" className="relative hover:bg-secondary/50 hover:text-primary transition-colors rounded-xl">
                  <ShoppingCart className="w-5 h-5" />
                  {(cartItemCount > 0 || bagCount > 0) && (
                    <Badge className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] px-1.5 h-4 min-w-[16px] flex items-center justify-center border-0 shadow-sm">
                      {cartItemCount || bagCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Account dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden md:flex items-center gap-2 px-3 py-2 h-auto hover:bg-secondary/50 rounded-xl transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col items-start ml-1">
                      <span className="text-xs font-medium text-gray-500">Hello,</span>
                      <span className="text-sm font-bold text-gray-900 leading-none">{user ? user.firstName : "Login"}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-premium border-gray-100">
                  {!user ? (
                    <>
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                        <Link href="/auth/signup">Create Account</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                        <Link href="/auth/login">Sign In</Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">My Account</div>
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                        <Link href="/profile">
                          <User className="w-4 h-4 mr-2" />
                          Profile Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                        <Link href="/orders">My Orders</Link>
                      </DropdownMenuItem>
                      {(user.role === "admin" || user.role === "manager") && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                            <Link href="/dashboard">
                              <Settings className="w-4 h-4 mr-2" />
                              Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600 rounded-lg cursor-pointer hover:bg-red-50 hover:text-red-700"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Categories navigation - Desktop */}
          <div className="hidden md:block py-2">
            <nav className="flex items-center justify-center space-x-1 py-1">
              <div className="flex bg-secondary/30 p-1.5 rounded-full gap-1 overflow-x-auto no-scrollbar max-w-full">
                <Link
                  href="/products"
                  className="text-xs font-semibold whitespace-nowrap py-2 px-5 rounded-full bg-white text-foreground shadow-sm ring-1 ring-black/5 hover:bg-primary hover:text-white hover:shadow-premium transition-all duration-300"
                >
                  All Collection
                </Link>
                <Link
                  href="/deals"
                  className="text-xs font-bold whitespace-nowrap py-2 px-5 rounded-full bg-destructive text-white shadow-md hover:bg-destructive/90 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                  Hot Deals
                </Link>

                <div className="w-px h-6 bg-gray-200 mx-2 self-center"></div>

                {(navCategories || []).slice(0, 6).map((category) => {
                  const Icon = categoryIcons[category.slug?.toLowerCase()] || ShoppingBasket;
                  return (
                    <Link
                      key={category.slug}
                      href={`/categories/${category.slug}`}
                      className="group text-xs font-medium whitespace-nowrap py-2 px-4 rounded-full text-muted-foreground hover:bg-white hover:text-primary hover:shadow-md transition-all duration-300 flex items-center gap-1.5"
                    >
                      <Icon className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                      {category.name}
                    </Link>
                  );
                })}

                <Link
                  href="/categories"
                  className="text-xs font-medium whitespace-nowrap py-2 px-4 rounded-full text-muted-foreground hover:bg-white hover:text-primary transition-all duration-300"
                >
                  More...
                </Link>
              </div>
            </nav>
          </div>

          {/* Mobile search */}
          <div className="md:hidden border-t border-gray-100 py-3">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-20 border-2 border-gray-200 rounded-full focus:border-green-500 focus:ring-0"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 rounded-full"
              >
                Go
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 max-h-[calc(100vh-180px)] overflow-y-auto">
          <div className="container mx-auto px-4 py-4">
            {/* Account section */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <User className="w-6 h-6 text-gray-600" />
                <span className="font-medium">Account</span>
              </div>
              <div className="space-y-2 ml-9">
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      className="block text-gray-600 hover:text-green-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {user.firstName || "My Profile"}
                    </Link>
                    <Link
                      href="/orders"
                      className="block text-gray-600 hover:text-green-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Order History
                    </Link>
                    {(user.role === "admin" || user.role === "manager") && (
                      <Link
                        href="/dashboard"
                        className="block text-gray-600 hover:text-green-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    {user.role === "supplier" && (
                      <Link
                        href="/dashboard"
                        className="block text-gray-600 hover:text-green-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Supplier Dashboard
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        await handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block text-left text-red-600 hover:text-red-700 w-full"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/signup"
                      className="block text-gray-600 hover:text-green-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                    <Link
                      href="/auth/login"
                      className="block text-gray-600 hover:text-green-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h3 className="font-medium mb-3">Categories</h3>
              <div className="space-y-2">
                {(navCategories || []).map((category) => {
                  const Icon =
                    categoryIcons[category.slug?.toLowerCase()] ||
                    ShoppingBasket;
                  return (
                    <Link
                      key={category.slug}
                      href={`/categories/${category.slug}`}
                      className="flex items-center gap-3 text-gray-600 hover:text-green-600 py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      {category.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Help links */}
            <div className="space-y-2">
              <Link
                href="/products"
                className="block text-gray-600 hover:text-green-600"
                onClick={() => setIsMenuOpen(false)}
              >
                All Products
              </Link>
              <Link
                href="/deals"
                className="block text-red-600 hover:text-red-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Hot Deals
              </Link>
              <Link
                href="/categories"
                className="block text-gray-600 hover:text-green-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/orders"
                className="block text-gray-600 hover:text-green-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Orders
              </Link>
              <Link
                href="/blog"
                className="block text-gray-600 hover:text-green-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/help"
                className="block text-gray-600 hover:text-green-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Help & Support
              </Link>
              <Link
                href="/about"
                className="block text-gray-600 hover:text-green-600"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}