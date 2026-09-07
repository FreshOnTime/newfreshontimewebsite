'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  Clock,
  Heart,
  Loader2,
  Package,
  Repeat,
  ShoppingBag,
  Wallet,
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

interface IntelligenceData {
  taste: {
    signalCount: number;
    confidence: number;
    topCategories: Array<{ key: string; label: string; normalized: number }>;
  };
  smartBasket: Array<{
    product: { _id: string; name: string };
    averageIntervalDays: number;
    dueInDays: number;
    confidence: number;
  }>;
}

const money = (n: number) =>
  `Rs. ${(Number(n) || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function orderStatusClass(status: string) {
  if (status === 'delivered') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (status === 'cancelled' || status === 'refunded') return 'text-rose-700 bg-rose-50 border-rose-200';
  if (['shipped', 'processing', 'confirmed'].includes(status)) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-zinc-600 bg-zinc-50 border-zinc-200';
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [intelligence, setIntelligence] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [dashboardResponse, intelligenceResponse] = await Promise.all([
          fetch('/api/dashboard/customer', { credentials: 'include', cache: 'no-store' }),
          fetch('/api/intelligence/me', { credentials: 'include', cache: 'no-store' }),
        ]);

        if (!dashboardResponse.ok) throw new Error('Customer dashboard could not be loaded');
        const dashboardJson = await dashboardResponse.json();
        if (active) setData(dashboardJson.data);

        if (intelligenceResponse.ok) {
          const intelligenceJson = await intelligenceResponse.json();
          if (active) setIntelligence(intelligenceJson.data);
        }
      } catch (err) {
        console.error('Failed to load customer dashboard:', err);
        if (active) setError(err instanceof Error ? err.message : 'Customer dashboard could not be loaded');
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
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your FreshPick workspace…
      </div>
    );
  }

  if (error || !data) {
    return <div className="border border-rose-200 bg-white p-6 text-sm text-rose-700">{error || 'Dashboard unavailable.'}</div>;
  }

  const stats = data.stats;
  const metrics = [
    { label: 'Orders', value: stats.totalOrders.toLocaleString(), detail: `${stats.openOrders} in progress`, icon: ShoppingBag },
    { label: 'Lifetime spend', value: money(stats.totalSpent), detail: 'Excluding cancelled orders', icon: Wallet },
    { label: 'Recurring', value: stats.activeSubscriptions.toLocaleString(), detail: 'Active subscription plans', icon: Repeat },
    { label: 'Saved', value: stats.wishlistCount.toLocaleString(), detail: `${stats.savedBags} saved baskets`, icon: Heart },
  ];

  return (
    <div className="space-y-6 text-zinc-950">
      <header className="flex flex-col gap-5 border-b border-zinc-300 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Your FreshPick workspace</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Orders, routines and what comes next</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Your account activity and personalized food signals in one operating view.</p>
        </div>
        <button onClick={() => router.push('/for-you')} className="inline-flex h-10 items-center gap-2 bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-emerald-900">
          <BrainCircuit className="h-4 w-4" /> Open For You
        </button>
      </header>

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

      <section className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="border border-zinc-200 bg-[#0b1710] p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-200">Taste Graph</p>
              <h3 className="mt-3 font-serif text-3xl font-normal">What your activity is teaching FreshPick.</h3>
            </div>
            <BrainCircuit className="h-5 w-5 text-emerald-200" />
          </div>

          {!intelligence || intelligence.taste.signalCount === 0 ? (
            <div className="mt-7 border border-white/10 p-4 text-sm leading-6 text-white/50">Your profile will form as you save products, build baskets and complete orders.</div>
          ) : (
            <>
              <div className="mt-7 flex items-center gap-2 text-xs text-white/40">
                <span>{intelligence.taste.signalCount} signals</span>
                <span>·</span>
                <span>{intelligence.taste.confidence}% confidence</span>
              </div>
              <div className="mt-6 space-y-4">
                {intelligence.taste.topCategories.slice(0, 4).map((signal) => (
                  <div key={signal.key}>
                    <div className="mb-2 flex items-center justify-between text-xs"><span className="text-white/70">{signal.label}</span><span className="text-white/35">{signal.normalized}</span></div>
                    <div className="h-1.5 bg-white/10"><div className="h-full bg-emerald-300" style={{ width: `${signal.normalized}%` }} /></div>
                  </div>
                ))}
              </div>
            </>
          )}

          <button onClick={() => router.push('/for-you')} className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-emerald-100">View full intelligence <ArrowRight className="h-3.5 w-3.5" /></button>
        </div>

        <div className="border border-zinc-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4">
            <div>
              <h3 className="font-semibold text-zinc-950">Predicted refills</h3>
              <p className="mt-1 text-xs text-zinc-400">Repeat items approaching their usual reorder interval</p>
            </div>
            <Repeat className="h-4 w-4 text-zinc-400" />
          </div>

          {!intelligence || intelligence.smartBasket.length === 0 ? (
            <div className="px-5 py-8 text-sm leading-6 text-zinc-500">No repeat products have enough delivered-order history to predict yet.</div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {intelligence.smartBasket.slice(0, 6).map((item) => (
                <div key={item.product._id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{item.product.name}</p>
                    <p className="mt-1 text-xs text-zinc-400">Typical repeat: {item.averageIntervalDays} days</p>
                  </div>
                  <span className={`text-xs font-semibold ${item.dueInDays <= 0 ? 'text-rose-700' : 'text-amber-700'}`}>{item.dueInDays <= 0 ? `${Math.abs(item.dueInDays)}d overdue` : `due in ${item.dueInDays}d`}</span>
                  <span className="text-xs text-zinc-400">{item.confidence}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="border border-zinc-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4">
            <div>
              <h3 className="font-semibold text-zinc-950">Recent orders</h3>
              <p className="mt-1 text-xs text-zinc-400">Latest recorded purchases</p>
            </div>
            <button onClick={() => router.push('/orders')} className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600">View all <ArrowRight className="h-3.5 w-3.5" /></button>
          </div>

          {data.recentOrders.length === 0 ? (
            <div className="px-5 py-8 text-sm text-zinc-500">No orders yet.</div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {data.recentOrders.map((order) => (
                <button key={order._id} onClick={() => router.push(`/orders/${order._id}`)} className="grid w-full gap-3 px-5 py-4 text-left hover:bg-zinc-50 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <Package className="h-4 w-4 shrink-0 text-zinc-400" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">{order.orderNumber}</p>
                      <p className="mt-1 text-xs text-zinc-400">{order.itemCount} item{order.itemCount === 1 ? '' : 's'} · {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-zinc-900">{money(order.total)}</span>
                  <span className={`w-fit border px-2.5 py-1 text-xs font-semibold capitalize ${orderStatusClass(order.status)}`}>{order.status}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border border-zinc-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4">
            <div>
              <h3 className="font-semibold text-zinc-950">Upcoming deliveries</h3>
              <p className="mt-1 text-xs text-zinc-400">Orders and recurring schedules</p>
            </div>
            <CalendarClock className="h-4 w-4 text-zinc-400" />
          </div>

          {data.upcomingDeliveries.length === 0 ? (
            <div className="px-5 py-8 text-sm text-zinc-500">No scheduled deliveries.</div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {data.upcomingDeliveries.map((delivery, index) => (
                <div key={`${delivery.type}-${delivery.date}-${index}`} className="flex items-start gap-3 px-5 py-4">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{delivery.label}</p>
                    <p className="mt-1 text-xs text-zinc-400">{new Date(delivery.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
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
