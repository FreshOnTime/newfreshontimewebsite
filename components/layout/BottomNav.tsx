"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Search, LayoutGrid, ShoppingBag, CircleUserRound, LayoutDashboard } from "lucide-react";
import { useBag } from "@/contexts/BagContext";
import { useAuth } from "@/contexts/AuthContext";

const publicNavItems = [
    { href: "/", icon: House, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/categories", icon: LayoutGrid, label: "Categories" },
    { href: "/bags", icon: ShoppingBag, label: "Cart", showBadge: true },
    { href: "/profile", icon: CircleUserRound, label: "Profile" },
];

export default function BottomNav() {
    const pathname = usePathname();
    const { bags } = useBag();
    const { user } = useAuth();
    const hasDashboard = ["customer", "supplier"].includes(user?.role?.toLowerCase() ?? "");
    const navItems = hasDashboard
        ? [
            ...publicNavItems.slice(0, 4),
            { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
            publicNavItems[4],
        ]
        : publicNavItems;
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
            className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
        >
            <div className={`mx-auto grid h-[4.5rem] max-w-lg items-center px-2 ${hasDashboard ? "grid-cols-6" : "grid-cols-5"} `}>
                {navItems.map(({ href, icon: Icon, label, showBadge }) => {
                    const isActive = pathname === href ||
                        (href !== "/" && pathname.startsWith(href));

                    return (
                        <Link
                            key={href}
                            href={href}
                            aria-current={isActive ? "page" : undefined}
                            className={`group relative flex h-full min-w-0 flex-col items-center justify-center gap-1 px-1 transition-colors ${isActive
                                ? "text-brand-green"
                                : "text-muted-foreground hover:text-brand-green"
                                } `}
                        >
                            <div
                                className={`relative flex h-10 w-10 items-center justify-center transition-colors duration-200 ${isActive
                                    ? "border-t-2 border-primary"
                                    : "group-hover:bg-background"
                                    } `}
                            >
                                <Icon
                                    className="h-5 w-5 transition-transform duration-200 group-active:scale-90"
                                    strokeWidth={1.5}
                                />
                                {showBadge && itemCount > 0 && (
                                    <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-primary px-1 text-xs font-bold text-accent-foreground shadow-sm">
                                        {itemCount > 99 ? "99+" : itemCount}
                                    </span>
                                )}
                            </div>
                            <span
                                className={`max-w-full truncate text-xs tracking-wide ${isActive ? "font-semibold" : "font-medium"
                                    } `}
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
