'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Eye,
  ArrowRight,
  UserPlus,
  Package2,
  CreditCard,
  Clock,
} from 'lucide-react';interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  pendingOrders: number;
  activeRecurring?: number;
  recurringRevenue?: number;
  upcomingRecurring?: Array<{ orderNumber: string; nextDeliveryAt?: string; total?: number; customerId?: string }>;
}

interface RecentCustomer {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  totalOrders?: number;
  totalSpent?: number;
}

interface RecentActivity {
  _id: string;
  type: 'customer_registered' | 'order_created' | 'order_updated' | 'product_created' | 'product_updated';
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  orderId?: string;
  orderNumber?: string;
  productId?: string;
  productName?: string;
}

export function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
  const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/analytics/overview', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentCustomers = async () => {
      try {
        const response = await fetch('/api/admin/customers?limit=5&sort=createdAt-desc', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setRecentCustomers(data.customers || data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch recent customers:', error);
      }
    };

    const fetchRecentActivities = async () => {
      try {
        const response = await fetch('/api/admin/activities?limit=5', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setRecentActivities(data.activities || []);
        } else {
          // Fallback to mock data if API doesn't exist yet
          setRecentActivities([
            {
              _id: '1',
              type: 'customer_registered',
              description: 'New customer registered',
              timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
              userName: 'John Doe'
            },
            {
              _id: '2',
              type: 'order_created',
              description: 'New order created',
              timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
              orderNumber: 'ORD-001'
            },
            {
              _id: '3',
              type: 'order_updated',
              description: 'Order status updated to shipped',
              timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
              orderNumber: 'ORD-002'
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch recent activities:', error);
        // Fallback to mock data
        setRecentActivities([
          {
            _id: '1',
            type: 'customer_registered',
            description: 'New customer registered',
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            userName: 'John Doe'
          },
          {
            _id: '2',
            type: 'order_created',
            description: 'New order created',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            orderNumber: 'ORD-001'
          },
          {
            _id: '3',
            type: 'order_updated',
            description: 'Order status updated to shipped',
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            orderNumber: 'ORD-002'
          }
        ]);
      }
    };

    fetchStats();
    fetchRecentCustomers();
    fetchRecentActivities();

    // Lightweight polling so dashboard reflects recent order cancellations/updates
    const interval = setInterval(() => {
      fetchStats();
    }, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: Users,
      description: 'Registered customers',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/admin/customers',
      viewText: 'View Customers'
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      description: 'Active products',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/admin/products',
      viewText: 'View Products'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      description: 'All time orders',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/admin/orders',
      viewText: 'View Orders'
    },
    {
      title: 'Total Revenue',
      value: `Rs. ${(Number(stats?.totalRevenue || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: 'All time revenue',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      href: '/admin/analytics',
      viewText: 'View Analytics'
    },
    {
      title: 'Low Stock Products',
      value: stats?.lowStockProducts || 0,
      icon: AlertTriangle,
      description: 'Need restocking',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      alert: (stats?.lowStockProducts || 0) > 0,
      href: '/admin/products?filter=low-stock',
      viewText: 'View Low Stock'
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      description: 'Awaiting processing',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      alert: (stats?.pendingOrders || 0) > 0,
      href: '/admin/orders?status=pending',
      viewText: 'View Pending'
    },
    {
      title: 'Active Recurring',
      value: stats?.activeRecurring || 0,
      icon: CreditCard,
      description: 'Schedules currently active',
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      href: '/admin/orders?type=recurring',
      viewText: 'View Recurring'
    },
    {
      title: 'Recurring Revenue',
      value: `Rs. ${(Number(stats?.recurringRevenue || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      description: 'Revenue from recurring orders',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      href: '/admin/analytics?type=recurring',
      viewText: 'View Analytics'
    },
    {
      title: 'Supplier Uploads',
      value: '',
      icon: Package2,
      description: 'Files uploaded by suppliers',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      href: '/admin/supplier-uploads',
      viewText: 'View Uploads'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="relative hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                {stat.alert && (
                  <Badge variant="destructive" className="absolute top-2 right-2">
                    Alert
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mb-3">
                  {stat.description}
                </p>
                <Link href={stat.href}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-3 w-3 mr-1" />
                    {stat.viewText}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                Recent Customers
              </CardTitle>
              <CardDescription>
                Latest customer registrations
              </CardDescription>
            </div>
            <Link href="/admin/customers">
              <Button variant="outline" size="sm">
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCustomers.length === 0 ? (
                <p className="text-sm text-gray-600">No recent customers</p>
              ) : (
                recentCustomers.slice(0, 5).map((customer) => (
                  <div key={customer._id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{customer.name}</p>
                      <p className="text-xs text-gray-500 truncate">{customer.email}</p>
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

        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package2 className="h-5 w-5 text-green-600" />
                Recent Activities
              </CardTitle>
              <CardDescription>
                Latest actions in your admin dashboard
              </CardDescription>
            </div>
            <Link href="/admin/audit-logs">
              <Button variant="outline" size="sm">
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity._id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'customer_registered' ? 'bg-blue-500' :
                    activity.type === 'order_created' ? 'bg-green-500' :
                    activity.type === 'order_updated' ? 'bg-yellow-500' :
                    'bg-purple-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Recurring Deliveries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Upcoming Deliveries
              </CardTitle>
              <CardDescription>
                Next scheduled recurring deliveries
              </CardDescription>
            </div>
            <Link href="/admin/orders?type=recurring">
              <Button variant="outline" size="sm">
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.upcomingRecurring || []).length === 0 && (
                <p className="text-sm text-gray-600">No upcoming recurring deliveries in the next 14 days.</p>
              )}
              {(stats?.upcomingRecurring || []).slice(0, 5).map((u, idx) => (
                <div key={`${u.orderNumber}-${idx}`} className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="text-sm font-medium">{u.orderNumber}</div>
                    <div className="text-xs text-gray-600">
                      {u.nextDeliveryAt ? new Date(u.nextDeliveryAt).toLocaleDateString() : '—'}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    Rs. {Number(u.total || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
