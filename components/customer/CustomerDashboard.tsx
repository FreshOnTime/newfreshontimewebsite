'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import {
  ShoppingBag,
  Clock,
  Wallet,
  Repeat,
  Heart,
  Package,
  CalendarClock,
  ArrowRight,
} from 'lucide-react';

interface RecentOrder {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

interface UpcomingDelivery {
  type: 'order' | 'subscription';
  label: string;
  date: string;
}

interface CustomerDashboardData {
  stats: {
    totalOrders: number;
    openOrders: number;
    totalSpent: number;
    activeSubscriptions: number;
    wishlistCount: number;
    savedBags: number;
  };
  recentOrders: RecentOrder[];
  upcomingDeliveries: UpcomingDelivery[];
}

const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'delivered':
      return 'default';
    case 'cancelled':
    case 'refunded':
      return 'destructive';
    case 'shipped':
    case 'processing':
    case 'confirmed':
      return 'secondary';
    default:
      return 'outline';
  }
};

const money = (n: number) => `Rs. ${(Number(n) || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CustomerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/dashboard/customer', { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          if (active) setData(json.data);
        }
      } catch (err) {
        console.error('Failed to load customer dashboard:', err);
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
    { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: ShoppingBag, hint: `${stats?.openOrders ?? 0} in progress` },
    { label: 'Total Spent', value: money(stats?.totalSpent ?? 0), icon: Wallet, hint: 'Lifetime, excluding cancelled' },
    { label: 'Active Subscriptions', value: stats?.activeSubscriptions ?? 0, icon: Repeat, hint: 'Recurring plans' },
    { label: 'Wishlist', value: stats?.wishlistCount ?? 0, icon: Heart, hint: `${stats?.savedBags ?? 0} saved bags` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName || 'there'}</h2>
        <p className="text-muted-foreground">Here&apos;s an overview of your orders, deliveries, and saved items.</p>
      </div>

      {/* Stat tiles */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, hint }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{value}</div>
              )}
              <p className="text-xs text-muted-foreground">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your latest purchases</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/orders')}>
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </>
            ) : data && data.recentOrders.length > 0 ? (
              data.recentOrders.map((order) => (
                <button
                  key={order._id}
                  onClick={() => router.push(`/orders/${order._id}`)}
                  className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-muted p-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.itemCount} item{order.itemCount === 1 ? '' : 's'} ·{' '}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{money(order.total)}</span>
                    <Badge variant={statusVariant(order.status)} className="capitalize">
                      {order.status}
                    </Badge>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShoppingBag className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => router.push('/products')}>
                  Start shopping
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming deliveries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" /> Upcoming Deliveries
            </CardTitle>
            <CardDescription>Recurring orders & subscriptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : data && data.upcomingDeliveries.length > 0 ? (
              data.upcomingDeliveries.map((d, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                  <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{d.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(d.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">No scheduled deliveries</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Button variant="outline" onClick={() => router.push('/products')}>
              Browse Products
            </Button>
            <Button variant="outline" onClick={() => router.push('/bags')}>
              My Bags
            </Button>
            <Button variant="outline" onClick={() => router.push('/profile/subscriptions')}>
              Subscriptions
            </Button>
            <Button variant="outline" onClick={() => router.push('/wishlist')}>
              Wishlist
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
