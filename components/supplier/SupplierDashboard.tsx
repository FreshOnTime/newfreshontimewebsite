'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import UploadProducts from './UploadProducts';
import MessageList from './MessageList';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard,
    Package,
    Mail,
    User as UserIcon,
    AlertTriangle,
    TrendingUp,
    Wallet,
    Upload,
    ShoppingCart,
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
    const { user } = useAuth();
    const [data, setData] = useState<SupplierDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await fetch('/api/dashboard/supplier', { credentials: 'include' });
                if (res.ok) {
                    const json = await res.json();
                    if (active) setData(json.data);
                }
            } catch (err) {
                console.error('Failed to load supplier dashboard:', err);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    const stats = data?.stats;

    const statCards = [
        {
            label: 'Total Products',
            value: stats?.totalProducts ?? 0,
            icon: Package,
            hint: `${stats?.activeProducts ?? 0} active in catalog`,
        },
        {
            label: 'Low Stock',
            value: stats?.lowStockProducts ?? 0,
            icon: AlertTriangle,
            hint: `${stats?.outOfStockProducts ?? 0} out of stock`,
        },
        {
            label: 'Units Sold',
            value: stats?.unitsSold ?? 0,
            icon: TrendingUp,
            hint: `across ${stats?.orders ?? 0} orders`,
        },
        {
            label: 'Revenue',
            value: money(stats?.revenue ?? 0),
            icon: Wallet,
            hint: 'from your products',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Supplier Dashboard</h2>
                <p className="text-muted-foreground">Manage your products, messages, and profile.</p>
            </div>

            {data && !data.linked && (
                <Card className="border-amber-300 bg-amber-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-800">
                            <AlertTriangle className="h-4 w-4" /> Supplier profile not linked
                        </CardTitle>
                        <CardDescription className="text-amber-700">
                            Your account isn&apos;t connected to a supplier record yet. Upload a product list or contact
                            support to complete setup and start seeing your catalog stats.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="products" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Products
                    </TabsTrigger>
                    <TabsTrigger value="messages" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Messages
                        {(stats?.unreadMessages ?? 0) > 0 && (
                            <Badge variant="destructive" className="ml-1">
                                {stats?.unreadMessages}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {statCards.map(({ label, value, icon: Icon, hint }) => (
                            <Card key={label}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{label}</CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <Skeleton className="h-8 w-20" />
                                    ) : (
                                        <div className="text-2xl font-bold">{value}</div>
                                    )}
                                    <p className="text-xs text-muted-foreground">{hint}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        {/* Low stock */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" /> Low Stock Alerts
                                </CardTitle>
                                <CardDescription>Products at or below their minimum level</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {loading ? (
                                    <>
                                        <Skeleton className="h-12 w-full" />
                                        <Skeleton className="h-12 w-full" />
                                    </>
                                ) : data && data.lowStockList.length > 0 ? (
                                    data.lowStockList.map((p) => (
                                        <div
                                            key={p._id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">{p.name}</p>
                                                <p className="text-xs text-muted-foreground">{p.sku}</p>
                                            </div>
                                            <Badge variant={p.stockQty <= 0 ? 'destructive' : 'secondary'}>
                                                {p.stockQty} left
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-sm text-muted-foreground">
                                        All products are well stocked
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent uploads */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="h-4 w-4" /> Recent Uploads
                                </CardTitle>
                                <CardDescription>Your latest product list submissions</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {loading ? (
                                    <>
                                        <Skeleton className="h-12 w-full" />
                                        <Skeleton className="h-12 w-full" />
                                    </>
                                ) : data && data.recentUploads.length > 0 ? (
                                    data.recentUploads.map((u) => (
                                        <div
                                            key={u._id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">{u.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {u.rows} row{u.rows === 1 ? '' : 's'} ·{' '}
                                                        {new Date(u.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-sm text-muted-foreground">
                                        No uploads yet
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="products">
                    <UploadProducts />
                </TabsContent>

                <TabsContent value="messages">
                    <MessageList />
                </TabsContent>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p>
                                <strong>Name:</strong> {user?.firstName} {user?.lastName}
                            </p>
                            <p>
                                <strong>Email:</strong> {user?.email}
                            </p>
                            <p>
                                <strong>Phone:</strong> {user?.phoneNumber}
                            </p>
                            <p>
                                <strong>Role:</strong> {user?.role}
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
