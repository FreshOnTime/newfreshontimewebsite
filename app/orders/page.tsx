"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PageContainer } from "@/components/templates/PageContainer";
import SectionHeader from "@/components/home/SectionHeader";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(false);
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
        toast.success('Order cancelled');
      } else {
        toast.error(data?.error || 'Failed to cancel');
      }
    } catch {}
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

  return (
    <PageContainer>
      <SectionHeader title="My Orders" subtitle="Track your recent orders" />
      {loading ? (
        <div className="p-8 text-center text-gray-600">Loading...</div>
      ) : !hasOrders ? (
        <div className="p-12 border rounded-lg text-center bg-white">
          <div className="text-2xl font-semibold mb-2">You have no orders yet</div>
          <p className="text-gray-600 mb-6">Browse products and place your first order.</p>
          <Link href="/products" className="inline-block px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">Shop now</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((o) => (
            <Link key={o._id} href={`/orders/${o._id}`} className="border rounded-lg p-4 bg-white hover:shadow transition">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">{o.orderNumber}</div>
                <span className={`text-xs px-2 py-1 rounded ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{o.status}</span>
              </div>
              <div className="text-sm text-gray-600 mb-1">{new Date(o.createdAt).toLocaleString()}</div>
        {(o.isRecurring || o.nextDeliveryAt || o.scheduleStatus) && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">Recurring</span>
          <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-gray-50 text-gray-700 border border-gray-200">{o.scheduleStatus || 'active'}</span>
                </div>
              )}
        {(o.isRecurring || o.nextDeliveryAt || o.scheduleStatus) && (
                <div className="text-xs text-gray-600 mb-1">Next delivery: <span className="font-medium">{o.nextDeliveryAt ? new Date(o.nextDeliveryAt).toLocaleDateString() : '—'}</span></div>
              )}
              {o.bagName && (
                <div className="text-xs text-gray-600">Bag: <span className="font-medium">{o.bagName}</span></div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-semibold">Rs. {Number(o.total ?? 0).toFixed(2)}</span>
              </div>
              <div className="mt-3 flex gap-2">
                {(o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing') && (
                  <button className="text-xs px-2 py-1 rounded border" onClick={(e) => { e.preventDefault(); cancelOrder(o._id); }}>Cancel</button>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
