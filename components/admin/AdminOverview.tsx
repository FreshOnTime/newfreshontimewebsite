'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  Package,
  Package2,
  ShoppingCart,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  pendingOrders: number;
  activeRecurring?: number;
  recurringRevenue?: number;
  upcomingRecurring?: Array<{
    orderNumber: string;
    nextDeliveryAt?: string;
    total?: number;
    customerId?: string;
  }>;
}

interface RecentCustomer {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface RecentActivity {
  _id: string;
  type: 'customer_registered' | 'order_created' | 'order_updated' | 'product_created' | 'product_updated';
  description: string;
  timestamp: string;
}

export function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [activityError, setActivityError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/analytics/overview', { credentials: 'include' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (active) setStats(data.stats ?? null);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        if (active) setStats(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    const fetchRecentCustomers = async () => {
      try {
        const response = await fetch('/api/admin/customers?limit=5&sort=createdAt-desc', {
          credentials: 'include',
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (active) setRecentCustomers(data.customers ?? data.data ?? []);
      } catch (error) {
        console.error('Failed to fetch recent customers:', error);
        if (active) setRecentCustomers([]);
      }
    };

    const fetchRecentActivities = async () => {
      try {
        const response = await fetch('/api/admin/activities?limit=5', { credentials: 'include' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (active) {
          setRecentActivities(Array.isArray(data.activities) ? data.activities : []);
          setActivityError(null);
        }
      } catch (error) {
        console.error('Failed to fetch recent activities:', error);
        if (active) {
          setRecentActivities([]);
          setActivityError('Recent activity is temporarily unavailable.');
        }
      }
    };

    void Promise.all([fetchStats(), fetchRecentCustomers(), fetchRecentActivities()]);

    const interval = window.setInterval(() => {
      void fetchStats();
    }, 30_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-1/2 rounded bg-gray-200" />
              <div className="h-8 w-3/4 rounded bg-gray-200" />
            </CardHeader>
            <CardContent>
              <div className="h-4 w-1/3 rounded bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      description: 'Registered customers',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/admin/customers',
      viewText: 'View Customers',
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts ?? 0,
      icon: Package,
      description: 'Active products',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/admin/products',
      viewText: 'View Products',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      description: 'All-time orders',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/admin/orders',
      viewText: 'View Orders',
    },
    {
      title: 'Total Revenue',
      value: `Rs. ${Number(stats?.totalRevenue ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      description: 'All-time revenue',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      href: '/admin/analytics',
      viewText: 'View Analytics',
    },
    {
      title: 'Low Stock Products',
      value: stats?.lowStockProducts ?? 0,
      icon: AlertTriangle,
      description: 'Need restocking',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      alert: (stats?.lowStockProducts ?? 0) > 0,
      href: '/admin/products?filter=low-stock',
      viewText: 'View Low Stock',
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      description: 'Awaiting processing',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      alert: (stats?.pendingOrders ?? 0) > 0,
      href: '/admin/orders?status=pending',
      viewText: 'View Pending',
    },
    {
      title: 'Active Recurring',
      value: stats?.activeRecurring ?? 0,
      icon: CreditCard,
      description: 'Schedules currently active',
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      href: '/admin/orders?type=recurring',
      viewText: 'View Recurring',
    },
    {
      title: 'Recurring Revenue',
      value: `Rs. ${Number(stats?.recurringRevenue ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: TrendingUp,
      description: 'Revenue from recurring orders',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      href: '/admin/analytics?type=recurring',
      viewText: 'View Analytics',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">Live operational data from FreshPick.</p>
      </div>

      {!stats && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Dashboard metrics could not be loaded. Values below default to zero until the analytics service responds.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="relative transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                {stat.alert && (
                  <Badge variant="destructive" className="absolute right-2 top-2">
                    Alert
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="mb-3 text-xs text-muted-foreground">{stat.description}</p>
                <Link href={stat.href}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="mr-1 h-3 w-3" />
                    {stat.viewText}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                Recent Customers
              </CardTitle>
              <CardDescription>Latest customer registrations</CardDescription>
            </div>
            <Link href="/admin/customers">
              <Button variant="outline" size="sm" aria-label="View customers">
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCustomers.length === 0 ? (
                <p className="text-sm text-gray-600">No recent customers.</p>
              ) : (
                recentCustomers.slice(0, 5).map((customer) => (
                  <div key={customer._id} className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{customer.name}</p>
                      <p className="truncate text-xs text-gray-500">{customer.email}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package2 className="h-5 w-5 text-green-600" />
                Recent Activities
              </CardTitle>
              <CardDescription>Recorded admin and store activity</CardDescription>
            </div>
            <Link href="/admin/audit-logs">
              <Button variant="outline" size="sm" aria-label="View audit logs">
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityError ? (
                <p className="text-sm text-amber-700">{activityError}</p>
              ) : recentActivities.length === 0 ? (
                <p className="text-sm text-gray-600">No recent activity.</p>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity._id} className="flex items-start space-x-3">
                    <div
                      className={`mt-2 h-2 w-2 rounded-full ${
                        activity.type === 'customer_registered'
                          ? 'bg-blue-500'
                          : activity.type === 'order_created'
                            ? 'bg-green-500'
                            : activity.type === 'order_updated'
                              ? 'bg-yellow-500'
                              : 'bg-purple-500'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Upcoming Deliveries
              </CardTitle>
              <CardDescription>Next scheduled recurring deliveries</CardDescription>
            </div>
            <Link href="/admin/orders?type=recurring">
              <Button variant="outline" size="sm" aria-label="View recurring orders">
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.upcomingRecurring ?? []).length === 0 ? (
                <p className="text-sm text-gray-600">No upcoming recurring deliveries in the next 14 days.</p>
              ) : (
                (stats?.upcomingRecurring ?? []).slice(0, 5).map((delivery, index) => (
                  <div
                    key={`${delivery.orderNumber}-${index}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
                  >
                    <div>
                      <div className="text-sm font-medium">{delivery.orderNumber}</div>
                      <div className="text-xs text-gray-600">
                        {delivery.nextDeliveryAt
                          ? new Date(delivery.nextDeliveryAt).toLocaleDateString()
                          : 'Date not set'}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-green-600">
                      Rs. {Number(delivery.total ?? 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
