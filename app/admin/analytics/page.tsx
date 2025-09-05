'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, DollarSign, Package, ShoppingCart, Users } from 'lucide-react';

interface OverviewStats {
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

export default function AnalyticsPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/analytics/overview', { credentials: 'include', signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStats(data.stats || null);
      } catch (e) {
        if ((e as { name?: string } | undefined)?.name === 'AbortError') return;
        setError('Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-600">Key store metrics and insights.</p>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[{title:'Customers',value:stats?.totalCustomers||0,icon:Users,color:'text-blue-600',bg:'bg-blue-50'},
          {title:'Products',value:stats?.totalProducts||0,icon:Package,color:'text-green-600',bg:'bg-green-50'},
          {title:'Orders',value:stats?.totalOrders||0,icon:ShoppingCart,color:'text-purple-600',bg:'bg-purple-50'},
          {title:'Revenue',value:`Rs ${(stats?.totalRevenue||0).toLocaleString()}`,icon:DollarSign,color:'text-emerald-600',bg:'bg-emerald-50'}]
        .map((c) => {
          const Icon: React.ComponentType<{ className?: string }> = c.icon as unknown as React.ComponentType<{ className?: string }>;
          return (
            <Card key={c.title}>
              <CardHeader className="flex items-center justify-between flex-row pb-2">
                <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
                <div className={`p-2 rounded-lg ${c.bg}`}><Icon className={`h-4 w-4 ${c.color}`} /></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{c.value}</div>
                <CardDescription>
                  {loading ? 'Loading...' : 'Updated just now'}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recurring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4"/> Recurring performance</CardTitle>
          <CardDescription>Active schedules and recent upcoming deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Active Recurring</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeRecurring || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Recurring Revenue</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rs {(stats?.recurringRevenue || 0).toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Upcoming recurring deliveries</div>
            <div className="border rounded overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Next delivery</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(stats?.upcomingRecurring || []).length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-sm text-gray-600">No upcoming deliveries in 14 days</TableCell></TableRow>
                  ) : (
                    (stats?.upcomingRecurring || []).map((u) => (
                      <TableRow key={u.orderNumber}>
                        <TableCell>{u.orderNumber}</TableCell>
                        <TableCell>{u.nextDeliveryAt ? new Date(u.nextDeliveryAt).toLocaleDateString() : '—'}</TableCell>
                        <TableCell className="text-right">Rs {Number(u.total || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
