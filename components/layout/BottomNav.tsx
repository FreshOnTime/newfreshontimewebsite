"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Grid3X3, ShoppingBag, User } from "lucide-react";
import { useBag } from "@/contexts/BagContext";

const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/categories", icon: Grid3X3, label: "Categories" },
    { href: "/bags", icon: ShoppingBag, label: "Cart", showBadge: true },
    { href: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
    const pathname = usePathname();
    const { bags } = useBag();
    // Sum items across all bags for the cart badge
    const itemCount = bags.reduce((total, bag) =>
        total + bag.items.reduce((sum, item) => sum + item.quantity, 0), 0);

    // Hide on admin pages
    if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
        return null;
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 md:hidden safe-area-bottom">
            <div className="flex items-center justify-around h-16">
                {navItems.map(({ href, icon: Icon, label, showBadge }) => {
                    const isActive = pathname === href ||
                        (href !== "/" && pathname.startsWith(href));

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center justify-center w-full h-full px-2 relative transition-colors ${isActive
                                ? "text-emerald-900"
                                : "text-zinc-400 hover:text-zinc-600"
                                }`}
                        >
                            <div className="relative">
                                <Icon
                                    className="w-7 h-7 transition-all duration-200"
                                    strokeWidth={isActive ? 2 : 1.5}
                                    fill={isActive ? "currentColor" : "none"}
                                />
                                {showBadge && itemCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                                        {itemCount > 99 ? "99+" : itemCount}
                                    </span>
                                )}
                            </div>
                            <span
                                className={`text-[10px] mt-1 tracking-wide ${isActive ? "font-semibold" : "font-medium"
                                    }`}
                            >
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
