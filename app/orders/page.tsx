"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Package, RefreshCw, ShoppingBag, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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

function statusStyle(status: string) {
  const value = (status || '').toLowerCase();
  if (value === 'delivered') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (value === 'shipped') return 'border-sky-200 bg-sky-50 text-sky-800';
  if (value === 'cancelled' || value === 'canceled' || value === 'refunded') return 'border-rose-200 bg-rose-50 text-rose-700';
  if (value === 'confirmed' || value === 'processing') return 'border-amber-200 bg-amber-50 text-amber-800';
  return 'border-zinc-200 bg-zinc-50 text-zinc-600';
}

function StatusIcon({ status }: { status: string }) {
  const value = (status || '').toLowerCase();
  if (value === 'delivered') return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (value === 'shipped') return <Truck className="h-3.5 w-3.5" />;
  if (value === 'cancelled' || value === 'canceled' || value === 'refunded') return <XCircle className="h-3.5 w-3.5" />;
  if (value === 'confirmed' || value === 'processing') return <Package className="h-3.5 w-3.5" />;
  return <Clock3 className="h-3.5 w-3.5" />;
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const router = useRouter();
  const hasOrders = useMemo(() => orders.length > 0, [orders]);

  const cancelOrder = async (id: string) => {
    try {
      setCancellingId(id);
      let res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      if (res.status === 401) {
        await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
        res = await fetch(`/api/orders/${id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'cancel' }),
        });
      }
      const data = await res.json();
      if (res.ok && data?.success) {
        setOrders((current) => current.map((order) => order._id === id ? { ...order, status: 'cancelled' } : order));
        toast.success('Order cancelled');
      } else {
        toast.error(data?.error || 'Failed to cancel order');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user?._id) {
      setLoading(false);
      router.push('/auth/login?redirect=/orders');
      return;
    }
    if (hasFetched) return;

    const load = async () => {
      setLoading(true);
      try {
        let res = await fetch('/api/orders?limit=20&summary=1', { credentials: 'include' });
        if (res.status === 401) {
          await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
          res = await fetch('/api/orders?limit=20&summary=1', { credentials: 'include' });
        }
        if (res.status === 401) {
          router.push('/auth/login?redirect=/orders');
          return;
        }
        const data = await res.json();
        if (res.ok && data.success) setOrders(data.data.orders || []);
        setHasFetched(true);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user?._id, authLoading, router, hasFetched]);

  return (
    <main className="min-h-screen bg-[#f4f5f1] pb-24 text-zinc-950">
      <section className="border-b border-zinc-200 bg-white px-5 pb-12 pt-28 md:px-8 md:pb-14 md:pt-32">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-700">Your FreshPick</span>
            <h1 className="mt-4 font-serif text-5xl font-normal leading-none tracking-[-0.03em] md:text-7xl">Orders.</h1>
            <p className="mt-5 max-w-xl text-sm font-light leading-7 text-zinc-500">Track what is on the way, revisit past purchases and manage recurring orders without losing the thread.</p>
          </div>
          <Link href="/discover" className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-zinc-950 px-5 text-xs font-semibold text-white transition-colors hover:bg-emerald-950">Find something next <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pt-10 md:px-8 md:pt-14">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-[1.5rem] border border-zinc-200 bg-white" />)}
          </div>
        ) : !hasOrders ? (
          <section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.04)] md:p-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-900"><ShoppingBag className="h-5 w-5" /></div>
            <h2 className="mt-6 font-serif text-4xl font-normal text-zinc-950">Your first order can start with a meal.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm font-light leading-7 text-zinc-500">Browse the market directly, or begin in Discover if you would rather choose what to eat before choosing products.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/discover" className="rounded-full bg-zinc-950 px-6 py-3 text-xs font-semibold text-white hover:bg-emerald-950">Open Discover</Link>
              <Link href="/products" className="rounded-full border border-zinc-300 bg-white px-6 py-3 text-xs font-semibold text-zinc-700">Browse Market</Link>
            </div>
          </section>
        ) : (
          <section className="overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.035)]">
            <div className="flex items-end justify-between gap-5 border-b border-zinc-100 px-6 py-5 md:px-8">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-700">Order history</p>
                <p className="mt-1 text-sm font-light text-zinc-400">{orders.length} recent order{orders.length === 1 ? '' : 's'}</p>
              </div>
              <Link href="/bags" className="text-xs font-semibold text-emerald-800">Saved bags</Link>
            </div>

            <div className="divide-y divide-zinc-100">
              {orders.map((order) => {
                const cancellable = ['pending', 'confirmed', 'processing'].includes((order.status || '').toLowerCase());
                return (
                  <article key={order._id} className="group px-6 py-6 transition-colors hover:bg-[#fbfcfa] md:px-8">
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                      <Link href={`/orders/${order._id}`} className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-serif text-2xl font-normal text-zinc-950">#{order.orderNumber}</span>
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${statusStyle(order.status)}`}><StatusIcon status={order.status} /> {order.status}</span>
                          {(order.isRecurring || order.nextDeliveryAt || order.scheduleStatus) && <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800"><RefreshCw className="h-3 w-3" /> Recurring</span>}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-light text-zinc-400">
                          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          {order.bagName && <span>{order.bagName}</span>}
                          {order.nextDeliveryAt && <span>Next delivery {new Date(order.nextDeliveryAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
                        </div>
                      </Link>

                      <div className="flex items-center justify-between gap-6 lg:justify-end">
                        <div className="text-right">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-400">Total</p>
                          <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-950">Rs. {Number(order.total ?? 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        {cancellable && (
                          <button
                            type="button"
                            disabled={cancellingId === order._id}
                            onClick={() => void cancelOrder(order._id)}
                            className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                          >
                            {cancellingId === order._id ? 'Cancelling…' : 'Cancel'}
                          </button>
                        )}
                        <Link href={`/orders/${order._id}`} aria-label={`Open order ${order.orderNumber}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f5f1] text-zinc-500 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-800"><ArrowRight className="h-4 w-4" /></Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
