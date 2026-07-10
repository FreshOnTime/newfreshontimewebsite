"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Search, LayoutGrid, ShoppingBag, CircleUserRound } from "lucide-react";
import { useBag } from "@/contexts/BagContext";

const navItems = [
    { href: "/", icon: House, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/categories", icon: LayoutGrid, label: "Categories" },
    { href: "/bags", icon: ShoppingBag, label: "Cart", showBadge: true },
    { href: "/profile", icon: CircleUserRound, label: "Profile" },
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
        <nav
            aria-label="Mobile navigation"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(24,24,27,0.08)] backdrop-blur-xl md:hidden"
        >
            <div className="mx-auto grid h-[4.5rem] max-w-lg grid-cols-5 items-center px-2">
                {navItems.map(({ href, icon: Icon, label, showBadge }) => {
                    const isActive = pathname === href ||
                        (href !== "/" && pathname.startsWith(href));

                    return (
                        <Link
                            key={href}
                            href={href}
                            aria-current={isActive ? "page" : undefined}
                            className={`group relative flex h-full min-w-0 flex-col items-center justify-center gap-1 px-1 transition-colors ${isActive
                                ? "text-emerald-800"
                                : "text-zinc-400 hover:text-zinc-700"
                                }`}
                        >
                            <div
                                className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-200 ${isActive
                                    ? "bg-emerald-50 shadow-sm ring-1 ring-emerald-100"
                                    : "group-hover:bg-zinc-100"
                                    }`}
                            >
                                <Icon
                                    className="h-5 w-5 transition-transform duration-200 group-active:scale-90"
                                    strokeWidth={isActive ? 2.2 : 1.8}
                                />
                                {showBadge && itemCount > 0 && (
                                    <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-emerald-600 px-1 text-[10px] font-bold text-white shadow-sm">
                                        {itemCount > 99 ? "99+" : itemCount}
                                    </span>
                                )}
                            </div>
                            <span
                                className={`max-w-full truncate text-[10px] tracking-wide ${isActive ? "font-semibold" : "font-medium"
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
