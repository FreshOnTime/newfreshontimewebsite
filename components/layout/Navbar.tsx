"use client";

import React, { useEffect, useState } from "react";
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
  const [navCategories, setNavCategories] = useState<NavCategory[]>([]);
  const { user, logout } = useAuth();
  const cartItemCount = 0; // This would come from your cart context/state
  const { bags } = useBag();
  const bagCount = bags?.length || 0;
  const router = useRouter();

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

  useEffect(() => {
    let ignore = false;
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) return;
        const json = await res.json();
        const items: unknown[] = Array.isArray(json?.data) ? json.data : [];
        const mapped: NavCategory[] = items
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
        if (!ignore) setNavCategories(mapped);
      } catch {
        console.warn("Failed to load categories for navbar");
      }
    }
    loadCategories();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top announcement bar */}
      <div className="bg-green-50 border-b border-green-100">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="flex items-center text-green-800 shrink-0">
                <MapPin className="w-4 h-4 mr-2" aria-hidden />
              </div>
              <div className="flex-1 truncate text-green-800 font-medium">
                <span className="block truncate">Delivering around Colombo</span>
                <span className="block text-xs text-green-700 font-normal">
                  Scheduled delivery available — choose your preferred slot at
                  checkout
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-gray-600">
              <Link href="/help" className="hover:text-green-600">
                Help
              </Link>
              <Link href="/about" className="hover:text-green-600">
                About Us
              </Link>
            </div>
            <div className="flex md:hidden items-center text-green-700 ml-4">
              <span className="text-xs font-medium">Scheduled delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/fresh-pick.svg"
              alt="Fresh Pick"
              width={180}
              height={180}
              className="text-green-600"
            />
          
          </Link>

          {/* Search bar - Desktop (improved spacing & visuals) */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full relative" aria-label="Site search">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-28 py-3 border border-gray-200 rounded-full shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden />
                <Button
                  type="submit"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 rounded-full px-4 py-2 flex items-center gap-2"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 text-white" />
                  <span className="hidden sm:inline text-sm text-white">Search</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Account dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hidden md:flex items-center space-x-2"
                >
                  <User className={`w-5 h-5 ${user ? "text-green-600" : ""}`} />
                  <span>{user ? user.firstName : "Account"}</span>
                  {user && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {user.role}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {!user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/auth/signup">Sign Up</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/auth/login">Sign In</Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders">Order History</Link>
                    </DropdownMenuItem>
                    {(user.role === "admin" || user.role === "manager") && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard">
                            <Settings className="w-4 h-4 mr-2" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {user.role === "supplier" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard">
                            <Settings className="w-4 h-4 mr-2" />
                            Supplier Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Shopping cart */}
            <Link href="/bags">
              <Button variant="ghost" className="relative">
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                    {cartItemCount}
                  </Badge>
                )}
                {bagCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded-full min-w-[18px] h-4 flex items-center justify-center">
                    {bagCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
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
        <div className="hidden md:block border-t border-gray-100">
          <nav className="flex items-center space-x-3 py-3 overflow-x-auto no-scrollbar">
            <Link
              href="/products"
              className="text-sm whitespace-nowrap py-1 px-3 rounded-full bg-white hover:bg-green-50 hover:text-green-600 transition flex items-center gap-2 shadow-sm"
            >
              <ShoppingBasket className="w-4 h-4" />
              All Products
            </Link>
            <Link
              href="/deals"
              className="text-sm whitespace-nowrap py-1 px-3 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition font-semibold"
            >
              Hot Deals
            </Link>
            <Link
              href="/categories"
              className="text-sm whitespace-nowrap py-1 px-3 rounded-full bg-white hover:bg-green-50 hover:text-green-600 transition"
            >
              Categories
            </Link>
            {navCategories.map((category) => {
              const Icon =
                categoryIcons[category.slug?.toLowerCase()] || ShoppingBasket;
              return (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="text-sm whitespace-nowrap py-1 px-3 rounded-full bg-white hover:bg-green-50 hover:text-green-600 transition duration-200 flex items-center gap-2 shadow-sm"
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </Link>
              );
            })}
            <Link
              href="/orders"
              className="text-sm whitespace-nowrap py-1 px-3 rounded-full bg-white hover:bg-green-50 hover:text-green-600 transition"
            >
              Orders
            </Link>
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

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
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
                {navCategories.map((category) => {
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