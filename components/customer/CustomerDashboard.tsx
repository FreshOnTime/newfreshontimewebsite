'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarClock, Clock, Heart, Loader2, Package, Repeat, ShoppingBag } from 'lucide-react';

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
    topCategories: Array<{ key: string; label: string; normalized: number }>;
  };
  smartBasket: Array<{
    product: { _id: string; name: string };
    averageIntervalDays: number;
    dueInDays: number;
  }>;
}

const money = (n: number) => `Rs. ${(Number(n) || 0).toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function CustomerDashboard() {
  const router = useRouter();
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [intelligence, setIntelligence] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [dashboardResponse, intelligenceResponse] = await Promise.all([
          fetch('/api/dashboard/customer', { credentials: 'include', cache: 'no-store' }),
          fetch('/api/intelligence/me', { credentials: 'include', cache: 'no-store' }),
        ]);
        if (dashboardResponse.ok) {
          const json = await dashboardResponse.json();
          if (active) setData(json.data);
        }
        if (intelligenceResponse.ok) {
          const json = await intelligenceResponse.json();
          if (active) setIntelligence(json.data);
        }
      } catch (error) {
        console.error('Failed to load customer dashboard:', error);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) {
    return <div className="flex min-h-0 items-center gap-3 text-sm font-normal text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading your FreshPick…</div>;
  }

  if (!data) {
    return <div className="rounded-lg border border-border bg-background p-8 text-sm text-muted-foreground">Your FreshPick account could not be loaded right now.</div>;
  }

  const dueItems = intelligence?.smartBasket.filter((item) => item.dueInDays <= 3).slice(0, 4) || [];
  const taste = intelligence?.taste.topCategories.slice(0, 4) || [];

  return (
    <div className="space-y-8 text-foreground">
      <section aria-label="Account summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Orders', data.stats.totalOrders],
          ['Saved bags', data.stats.savedBags],
          ['Saved products', data.stats.wishlistCount],
          ['Weekly baskets', data.stats.activeSubscriptions],
        ].map(([label, value]) => <div key={label} className="rounded-lg border border-border p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <button onClick={() => router.push('/for-you')} className="group rounded-lg border border-border bg-background p-7 text-left transition-all md:p-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold normal-case text-brand-green"><Heart className="h-4 w-4" /> For You</div>
              <h3 className="mt-3 text-xl font-semibold">Recommended for you</h3>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
          {taste.length > 0 ? (
            <div className="mt-7 flex flex-wrap gap-2">
              {taste.map((item) => <span key={item.key} className="rounded-full bg-background px-3.5 py-2 text-xs text-muted-foreground">{item.label}</span>)}
            </div>
          ) : (
            <p className="mt-6 text-sm font-normal leading-6 text-muted-foreground">Your personal picks will take shape as you shop and save products.</p>
          )}
          {dueItems.length > 0 && <p className="mt-6 text-xs font-medium text-amber-700">{dueItems.length} repeat item{dueItems.length === 1 ? '' : 's'} may be worth checking again.</p>}
        </button>

        <div className="rounded-lg border border-border bg-background p-5 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-xs font-bold normal-case text-brand-green">Coming up</p><h3 className="mt-3 text-xl font-semibold">Deliveries</h3></div>
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
          </div>
          {data.upcomingDeliveries.length === 0 ? (
            <p className="mt-6 text-sm font-normal text-muted-foreground">Nothing scheduled right now.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {data.upcomingDeliveries.slice(0, 4).map((delivery, index) => (
                <div key={`${delivery.type}-${delivery.date}-${index}`} className="flex gap-3 border-t border-border pt-4 first:border-0 first:pt-0">
                  <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div><p className="text-sm font-medium text-foreground">{delivery.label}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(delivery.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-background p-7 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-6">
          <div>
            <p className="text-xs font-bold normal-case text-brand-green">Recent</p>
            <h3 className="mt-3 font-sans text-3xl md:text-2xl">Your orders</h3>
          </div>
          <button onClick={() => router.push('/orders')} className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">View all <ArrowRight className="h-4 w-4" /></button>
        </div>

        {data.recentOrders.length === 0 ? (
          <div className="py-10 text-sm font-normal text-muted-foreground">No orders yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {data.recentOrders.map((order) => (
              <button key={order._id} onClick={() => router.push(`/orders/${order._id}`)} className="grid w-full gap-3 py-5 text-left sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div className="flex items-center gap-3"><Package className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">{order.orderNumber}</p><p className="mt-1 text-xs text-muted-foreground">{order.itemCount} item{order.itemCount === 1 ? '' : 's'} · {new Date(order.createdAt).toLocaleDateString()}</p></div></div>
                <span className="text-sm font-medium">{money(order.total)}</span>
                <span className="text-xs capitalize text-muted-foreground">{order.status}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {data.stats.activeSubscriptions > 0 && <span className="inline-flex items-center gap-2"><Repeat className="h-4 w-4" /> {data.stats.activeSubscriptions} active recurring plan{data.stats.activeSubscriptions === 1 ? '' : 's'}</span>}
        {data.stats.openOrders > 0 && <span className="inline-flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> {data.stats.openOrders} order{data.stats.openOrders === 1 ? '' : 's'} in progress</span>}
      </div>
    </div>
  );
}
