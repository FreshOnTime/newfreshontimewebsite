"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Package,
  Calendar,
  RotateCcw,
  ChevronRight,
  ShoppingBag,
  XCircle,
  Clock,
  CheckCircle2,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type OrderSummary = {
  _id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  status: string;
  bagName?: string;
  isRecurring?: boolean;
  scheduleStatus?: 'active' | 'paused' | 'ended';
  nextDeliveryAt?: string;
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const didFetch = useRef(false);
  const hasOrders = useMemo(() => orders.length > 0, [orders]);

  const cancelOrder = async (id: string) => {
    try {
      let res = await fetch(`/api/orders/${id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel' }) });
      if (res.status === 401) {
        await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
        res = await fetch(`/api/orders/${id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel' }) });
      }
      const data = await res.json();
      if (res.ok && data?.success) {
        setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: 'cancelled' } : o)));
        toast.success('Order cancelled successfully');
      } else {
        toast.error(data?.error || 'Failed to cancel order');
      }
    } catch {
      toast.error('Network error');
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!user?._id) return;
      setLoading(true);
      try {
        let res = await fetch(`/api/orders?limit=50`, { credentials: 'include', cache: 'no-store' });
        if (res.status === 401) {
          await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
          res = await fetch(`/api/orders?limit=50`, { credentials: 'include', cache: 'no-store' });
        }
        if (res.status === 401) {
          router.push(`/auth/login?redirect=/orders`);
          return;
        }
        const data = await res.json();
        if (res.ok && data.success) setOrders(data.data.orders);
      } finally {
        setLoading(false);
      }
    };
    if (!didFetch.current) {
      didFetch.current = true;
      load();
    }
  }, [user?._id, router]);

  const getStatusIcon = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return <CheckCircle2 className="w-4 h-4" />;
    if (s === 'shipped') return <Truck className="w-4 h-4" />;
    if (s === 'processing' || s === 'confirmed') return <Package className="w-4 h-4" />;
    if (s === 'cancelled' || s === 'canceled') return <XCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'confirmed' || s === 'processing') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s === 'shipped') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (s === 'cancelled' || s === 'canceled' || s === 'refunded') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-2 text-lg">Track and manage your recent orders</p>
          </div>
          <Link href="/products">
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : !hasOrders ? (
          /* Empty State */
          <Card className="shadow-sm border-none ring-1 ring-black/5 overflow-hidden">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                You haven&apos;t placed any orders yet. Browse our products and place your first order today!
              </p>
              <Link href="/products">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Orders Grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((o) => (
              <Link
                key={o._id}
                href={`/orders/${o._id}`}
                className="group"
              >
                <Card className="h-full shadow-sm border-none ring-1 ring-black/5 overflow-hidden hover:shadow-lg hover:ring-emerald-200 transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                          #{o.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border flex items-center gap-1.5 ${getStatusColor(o.status)}`}>
                        {getStatusIcon(o.status)}
                        {o.status}
                      </span>
                    </div>

                    {/* Recurring Badge */}
                    {(o.isRecurring || o.nextDeliveryAt || o.scheduleStatus) && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-1">
                          <RotateCcw className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-700">Recurring Order</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ml-auto ${o.scheduleStatus === 'active' ? 'bg-green-100 text-green-700' :
                              o.scheduleStatus === 'paused' ? 'bg-amber-100 text-amber-700' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                            {o.scheduleStatus || 'active'}
                          </span>
                        </div>
                        <p className="text-xs text-blue-600">
                          Next: {o.nextDeliveryAt ? new Date(o.nextDeliveryAt).toLocaleDateString() : '—'}
                        </p>
                      </div>
                    )}

                    {/* Bag Name */}
                    {o.bagName && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Package className="w-4 h-4" />
                        <span>{o.bagName}</span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-xs text-gray-500 block">Total</span>
                        <span className="text-lg font-bold text-gray-900">Rs. {Number(o.total ?? 0).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {['pending', 'confirmed', 'processing'].includes((o.status || '').toLowerCase()) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              cancelOrder(o._id);
                            }}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
