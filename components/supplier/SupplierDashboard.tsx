'use client';

import { useEffect, useState } from 'react';
import {
    AlertTriangle,
    ArrowUpRight,
    Boxes,
    CheckCircle2,
    Loader2,
    Package,
    ShoppingCart,
    TrendingUp,
    Upload,
    Wallet,
} from 'lucide-react';

interface SupplierStats {
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalUploads: number;
    unreadMessages: number;
    orders: number;
    unitsSold: number;
    revenue: number;
}

interface LowStockItem {
    _id: string;
    name: string;
    sku: string;
    stockQty: number;
    minStockLevel: number;
}

interface RecentUpload {
    _id: string;
    name: string;
    rows: number;
    createdAt: string;
}

interface SupplierDashboardData {
    linked: boolean;
    stats: SupplierStats;
    lowStockList: LowStockItem[];
    recentUploads: RecentUpload[];
}

const money = (n: number) =>
    `Rs. ${(Number(n) || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function SupplierDashboard() {
    const [data, setData] = useState<SupplierDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await fetch('/api/dashboard/supplier', { credentials: 'include', cache: 'no-store' });
                if (!res.ok) throw new Error('Supplier operations could not be loaded');
                const json = await res.json();
                if (active) setData(json.data);
            } catch (err) {
                console.error('Failed to load supplier dashboard:', err);
                if (active) setError(err instanceof Error ? err.message : 'Supplier operations could not be loaded');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[38vh] items-center gap-3 border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading supplier operations…
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="border border-rose-200 bg-white p-6 text-sm text-rose-700">
                {error || 'Supplier operations are unavailable.'}
            </div>
        );
    }

    const stats = data.stats;
    const availability = stats.totalProducts > 0
        ? Math.round(((stats.totalProducts - stats.outOfStockProducts) / stats.totalProducts) * 100)
        : 100;

    const metrics = [
        {
            label: 'Active catalogue',
            value: stats.activeProducts.toLocaleString(),
            detail: `${stats.totalProducts.toLocaleString()} total SKUs`,
            icon: Package,
        },
        {
            label: 'Availability',
            value: `${availability}%`,
            detail: `${stats.outOfStockProducts} out of stock`,
            icon: CheckCircle2,
        },
        {
            label: 'Units sold',
            value: stats.unitsSold.toLocaleString(),
            detail: `${stats.orders.toLocaleString()} orders`,
            icon: TrendingUp,
        },
        {
            label: 'Product revenue',
            value: money(stats.revenue),
            detail: 'Recorded from supplier products',
            icon: Wallet,
        },
    ];

    return (
        <div className="space-y-6 text-zinc-950">
            <header className="flex flex-col gap-5 border-b border-zinc-300 pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Supplier operations</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight">Catalogue and sell-through</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                        Current product availability, order activity and catalogue exceptions from your linked FreshPick supplier record.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                    <span className="border border-zinc-300 bg-white px-3 py-2">{stats.totalUploads} uploads</span>
                    <span className="border border-zinc-300 bg-white px-3 py-2">{stats.unreadMessages} unread messages</span>
                </div>
            </header>

            {!data.linked && (
                <div className="flex items-start gap-3 border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                        <p className="font-semibold">Supplier profile is not linked</p>
                        <p className="mt-1 leading-6 text-amber-800">Complete supplier setup before relying on catalogue and sales metrics.</p>
                    </div>
                </div>
            )}

            <section className="grid gap-px border border-zinc-300 bg-zinc-300 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map(({ label, value, detail, icon: Icon }) => (
                    <article key={label} className="bg-white p-5">
                        <div className="flex items-center justify-between gap-4 text-zinc-400">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">{label}</span>
                            <Icon className="h-4 w-4" />
                        </div>
                        <div className="mt-4 break-words text-3xl font-semibold tabular-nums text-zinc-950">{value}</div>
                        <p className="mt-2 text-xs text-zinc-400">{detail}</p>
                    </article>
                ))}
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="border border-zinc-200 bg-white">
                    <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4">
                        <div>
                            <h3 className="font-semibold text-zinc-950">Stock exceptions</h3>
                            <p className="mt-1 text-xs text-zinc-400">Products at or below their configured minimum level</p>
                        </div>
                        <AlertTriangle className="h-4 w-4 text-zinc-400" />
                    </div>

                    {data.lowStockList.length === 0 ? (
                        <div className="flex items-center gap-3 px-5 py-8 text-sm text-zinc-500">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> No low-stock exceptions right now.
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-100">
                            {data.lowStockList.map((product) => {
                                const deficit = Math.max(0, product.minStockLevel - product.stockQty);
                                return (
                                    <div key={product._id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900">{product.name}</p>
                                            <p className="mt-1 text-xs text-zinc-400">{product.sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-semibold tabular-nums ${product.stockQty <= 0 ? 'text-rose-700' : 'text-amber-700'}`}>{product.stockQty}</p>
                                            <p className="text-[10px] text-zinc-400">on hand</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold tabular-nums text-zinc-800">{product.minStockLevel}</p>
                                            <p className="text-[10px] text-zinc-400">minimum{deficit > 0 ? ` · ${deficit} short` : ''}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="border border-zinc-200 bg-white">
                    <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4">
                        <div>
                            <h3 className="font-semibold text-zinc-950">Catalogue uploads</h3>
                            <p className="mt-1 text-xs text-zinc-400">Most recent supplier product-list submissions</p>
                        </div>
                        <Upload className="h-4 w-4 text-zinc-400" />
                    </div>

                    {data.recentUploads.length === 0 ? (
                        <div className="flex items-center gap-3 px-5 py-8 text-sm text-zinc-500">
                            <Boxes className="h-4 w-4" /> No catalogue uploads yet.
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-100">
                            {data.recentUploads.map((upload) => (
                                <div key={upload._id} className="flex items-center justify-between gap-4 px-5 py-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <ShoppingCart className="h-4 w-4 shrink-0 text-zinc-400" />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-zinc-900">{upload.name}</p>
                                            <p className="mt-1 text-xs text-zinc-400">{new Date(upload.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
                                        {upload.rows} rows <ArrowUpRight className="h-3.5 w-3.5 text-zinc-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
