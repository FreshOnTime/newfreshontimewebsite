"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Package, RefreshCw, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';
import { AccountPage, AccountState, AccountLoading, accountButton, accountSecondaryButton } from '@/components/account/AccountPage';

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
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const router = useRouter();


  const cancelOrder = async (id: string) => {
    try {
      setCancellingId(id);
      const res = await authenticatedApiFetch(`/api/orders/${id}`, {
        method: 'PATCH', body: JSON.stringify({ action: 'cancel' }),
      });
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
    setOrders([]);
    setError(null);
    if (!user?._id) {
      setLoading(false);
      router.replace('/auth/login?redirect=/orders');
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const load = async () => {
      try {
        const res = await authenticatedApiFetch('/api/orders?limit=20&summary=1', { signal: controller.signal });
        if (res.status === 401) {
          router.replace('/auth/login?redirect=/orders');
          return;
        }
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Please try again in a moment.');
        if (!controller.signal.aborted) setOrders(data.data.orders || []);
      } catch (loadError) {
        if (!controller.signal.aborted) setError(loadError instanceof Error ? loadError.message : 'Please try again in a moment.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [user?._id, authLoading, router, retryCount]);

  return (
    <AccountPage title="Orders" description="Track deliveries and revisit recent purchases." action={<Link href="/products" className={accountSecondaryButton}>Shop the market</Link>}>
        {authLoading || loading ? <AccountLoading label="Loading your orders…" /> : error ? (
          <AccountState error title="Couldn’t load your orders" description={error} action={<button type="button" className={accountSecondaryButton} onClick={() => setRetryCount((count) => count + 1)}>Try again</button>} />
        ) : orders.length === 0 ? (
          <AccountState title="No orders yet" description="Your purchases and delivery updates will appear here." action={<Link href="/products" className={accountButton}>Shop the market</Link>} />
        ) : (
          <section className="overflow-hidden rounded-lg border border-zinc-200 bg-background">
            <div className="flex items-end justify-between gap-5 border-b border-border px-6 py-5 md:px-6">
              <div>
                <h2 className="text-base font-medium text-brand-green">Recent orders</h2>
                <p className="mt-1 text-sm font-normal text-muted-foreground">{orders.length} recent order{orders.length === 1 ? '' : 's'}</p>
              </div>
              <Link href="/bags" className="text-xs font-semibold text-emerald-800">Saved bags</Link>
            </div>

            <div className="divide-y divide-border">
              {orders.map((order) => {
                const cancellable = ['pending', 'confirmed', 'processing'].includes((order.status || '').toLowerCase());
                return (
                  <article key={order._id} className="group px-5 py-5 transition-colors hover:bg-background md:px-6">
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                      <Link href={`/orders/${order._id}`} className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-lg font-medium text-brand-green">#{order.orderNumber}</span>
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(order.status)} `}><StatusIcon status={order.status} /> {order.status}</span>
                          {(order.isRecurring || order.nextDeliveryAt || order.scheduleStatus) && <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"><RefreshCw className="h-3 w-3" /> Recurring</span>}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-normal text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          {order.bagName && <span>{order.bagName}</span>}
                          {order.nextDeliveryAt && <span>Next delivery {new Date(order.nextDeliveryAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
                        </div>
                      </Link>

                      <div className="flex items-center justify-between gap-6 lg:justify-end">
                        <div className="text-right">
                          <p className="text-xs font-semibold normal-case text-muted-foreground">Total</p>
                          <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-950">Rs. {Number(order.total ?? 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        {cancellable && (
                          <button
                            type="button"
                            disabled={cancellingId !== null}
                            onClick={() => void cancelOrder(order._id)}
                            className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                          >
                            {cancellingId === order._id ? 'Cancelling…' : 'Cancel'}
                          </button>
                        )}
                        <Link href={`/orders/${order._id}`} aria-label={`Open order ${order.orderNumber}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-zinc-500 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-800"><ArrowRight className="h-4 w-4" /></Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
    </AccountPage>
  );
}
