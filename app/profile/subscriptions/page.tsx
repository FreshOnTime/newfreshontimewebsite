'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, CalendarDays, Loader2, MapPin, Pause, Play, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

interface Subscription {
  _id: string;
  plan: { name: string; icon: string; price: number; frequency: string };
  status: 'active' | 'paused' | 'cancelled';
  nextDeliveryDate: string;
  deliveryAddress: { fullName: string; addressLine1: string; city: string };
  deliverySlot: { day: string; timeSlot: string };
  totalDeliveries: number;
}

function statusClass(status: Subscription['status']) {
  if (status === 'active') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (status === 'paused') return 'border-amber-200 bg-amber-50 text-amber-800';
  return 'border-zinc-200 bg-zinc-100 text-zinc-500';
}

export default function MySubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch('/api/subscriptions', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setSubscriptions(data.subscriptions || []);
    } catch (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void fetchSubscriptions(); }, []);

  const handleAction = async (id: string, action: 'pause' | 'resume' | 'cancel' | 'skip') => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        await fetchSubscriptions();
      } else {
        toast.error(data.message || 'Unable to update subscription');
      }
    } catch {
      toast.error('Failed to update subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (value: string) => new Date(value).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  if (isLoading) {
    return <main className="min-h-[70vh] bg-[#f4f5f1] px-5 py-32"><div className="mx-auto flex max-w-6xl items-center gap-3 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading recurring routines…</div></main>;
  }

  return (
    <main className="min-h-screen bg-[#f4f5f1] pb-24 text-zinc-950">
      <section className="border-b border-zinc-200 bg-white px-5 pb-12 pt-28 md:px-8 md:pb-14 md:pt-32">
        <div className="mx-auto flex max-w-5xl flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-700">Smart Basket</span>
            <h1 className="mt-4 font-serif text-5xl font-normal leading-none tracking-[-0.03em] md:text-7xl">Your recurring rhythm.</h1>
            <p className="mt-5 max-w-xl text-sm font-light leading-7 text-zinc-500">Pause, skip or resume recurring plans without rebuilding the same household routine from scratch.</p>
          </div>
          <Link href="/subscriptions" className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-zinc-950 px-5 text-xs font-semibold text-white hover:bg-emerald-950">Explore plans <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 pt-10 md:px-8 md:pt-14">
        {subscriptions.length === 0 ? (
          <section className="rounded-[2rem] border border-zinc-200 bg-white p-10 text-center md:p-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-900"><RefreshCw className="h-5 w-5" /></div>
            <h2 className="mt-6 font-serif text-4xl font-normal">Nothing on repeat yet.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm font-light leading-7 text-zinc-500">Choose a recurring plan if there are household essentials you would rather not remember every week.</p>
            <Link href="/subscriptions" className="mt-7 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-xs font-semibold text-white hover:bg-emerald-950">See Smart Basket plans</Link>
          </section>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <article key={sub._id} className="overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.035)]">
                <div className="flex flex-wrap items-start justify-between gap-5 border-b border-zinc-100 px-6 py-6 md:px-8">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f4f5f1] text-2xl">{sub.plan.icon}</span>
                    <div>
                      <h2 className="font-serif text-3xl font-normal text-zinc-950">{sub.plan.name}</h2>
                      <p className="mt-1 text-sm font-light text-zinc-500">Rs. {sub.plan.price.toLocaleString('en-LK')} · {sub.plan.frequency}</p>
                    </div>
                  </div>
                  <span className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold capitalize ${statusClass(sub.status)}`}>{sub.status}</span>
                </div>

                <div className="grid gap-px bg-zinc-100 sm:grid-cols-3">
                  <Info icon={CalendarDays} label="Next delivery" value={sub.status === 'active' ? formatDate(sub.nextDeliveryDate) : 'Not scheduled'} />
                  <Info icon={MapPin} label="Delivery to" value={`${sub.deliveryAddress.addressLine1}, ${sub.deliveryAddress.city}`} />
                  <Info icon={RefreshCw} label="Completed" value={`${sub.totalDeliveries} deliver${sub.totalDeliveries === 1 ? 'y' : 'ies'}`} />
                </div>

                <div className="flex flex-wrap items-center gap-2 px-6 py-5 md:px-8">
                  {sub.status === 'active' && (
                    <>
                      <Action disabled={actionLoading === sub._id} onClick={() => void handleAction(sub._id, 'skip')}>Skip next</Action>
                      <Action disabled={actionLoading === sub._id} onClick={() => void handleAction(sub._id, 'pause')} icon={Pause}>Pause</Action>
                    </>
                  )}
                  {sub.status === 'paused' && <Action disabled={actionLoading === sub._id} onClick={() => void handleAction(sub._id, 'resume')} icon={Play}>Resume</Action>}
                  {sub.status !== 'cancelled' ? (
                    <button disabled={actionLoading === sub._id} onClick={() => void handleAction(sub._id, 'cancel')} className="ml-auto inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"><X className="h-3.5 w-3.5" /> Cancel plan</button>
                  ) : (
                    <div className="ml-auto inline-flex items-center gap-2 text-xs text-zinc-400"><AlertCircle className="h-3.5 w-3.5" /> This plan is cancelled</div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return <div className="bg-white px-6 py-5 md:px-8"><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400"><Icon className="h-3.5 w-3.5 text-emerald-700" /> {label}</div><p className="mt-2 truncate text-sm font-medium text-zinc-800">{value}</p></div>;
}

function Action({ children, onClick, disabled, icon: Icon }: { children: React.ReactNode; onClick: () => void; disabled: boolean; icon?: typeof Pause }) {
  return <button disabled={disabled} onClick={onClick} className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-50">{Icon ? <Icon className="h-3.5 w-3.5" /> : null}{children}</button>;
}
