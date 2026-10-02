'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CalendarDays, MapPin, Pause, Play, RefreshCw, ShoppingBag, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';
import { AccountPage, AccountState, AccountLoading, accountButton, accountSecondaryButton } from '@/components/account/AccountPage';

import { ConfirmAction } from '@/components/account/ConfirmAction';

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

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [confirmAction, setConfirmAction] = useState<{ sub: Subscription; action: 'skip' | 'cancel' } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const lock = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    setSubscriptions([]);
    setError(null);
    if (!user?._id) {
      setIsLoading(false);
      router.replace('/auth/login?redirect=/profile/subscriptions');
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);
    const load = async () => {
      try {
        const res = await authenticatedApiFetch('/api/subscriptions', { cache: 'no-store', signal: controller.signal });
        if (res.status === 401) { router.replace('/auth/login?redirect=/profile/subscriptions'); return; }
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Please try again in a moment.');
        if (!controller.signal.aborted) setSubscriptions(data.subscriptions || []);
      } catch (loadError) {
        if (!controller.signal.aborted) setError(loadError instanceof Error ? loadError.message : 'Please try again in a moment.');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [user?._id, authLoading, router, retryCount]);

  const handleAction = async (id: string, action: 'pause' | 'resume' | 'cancel' | 'skip') => {
    if (lock.current) return;
    lock.current = true;
    setActionError(null);
    setActionLoading(id);
    try {
      const res = await authenticatedApiFetch(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.subscription) {
        setSubscriptions((current) => current.map((sub) => sub._id === id ? data.subscription : sub));
        setConfirmAction(null);
        toast.success(action === 'skip' ? 'Next delivery skipped' : action === 'pause' ? 'Subscription paused' : action === 'resume' ? 'Subscription resumed' : 'Subscription cancelled');
      } else {
        setActionError(data.message || 'Unable to update subscription');
      }
    } catch {
      setActionError('Couldn’t update your subscription. Please try again.');
    } finally {
      lock.current = false;
      setActionLoading(null);
    }
  };

  const formatDate = (value: string) => new Date(value).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <AccountPage title="Subscriptions" description="Manage your regular deliveries." action={<Link href="/subscriptions" className={accountSecondaryButton}>Explore plans</Link>}>
        <ConfirmAction open={confirmAction !== null} onOpenChange={(open) => { if (!open) setConfirmAction(null); }} title={confirmAction?.action === 'skip' ? 'Skip the next delivery?' : 'Cancel this subscription?'} description={confirmAction?.action === 'skip' ? `Skip the delivery on ${formatDate(confirmAction.sub.nextDeliveryDate)}. Your following delivery stays on the plan’s regular schedule.` : 'This ends future deliveries for this plan. You can choose a new plan anytime.'} label={confirmAction?.action === 'skip' ? 'Skip delivery' : 'Cancel subscription'} busy={actionLoading !== null} error={actionError} onConfirm={() => { if (confirmAction) void handleAction(confirmAction.sub._id, confirmAction.action); }} />
        {actionError && !confirmAction && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200 p-4 text-sm text-rose-700"><p>{actionError}</p><button type="button" className={accountSecondaryButton} disabled={actionLoading !== null} onClick={() => { setActionError(null); setRetryCount((count) => count + 1); }}>Refresh subscriptions</button></div>}
        {authLoading || isLoading ? <AccountLoading label="Loading your subscriptions…" /> : error ? (
          <AccountState error title="Couldn’t load your subscriptions" description={error} action={<button type="button" className={accountSecondaryButton} onClick={() => setRetryCount((count) => count + 1)}>Try again</button>} />
        ) : subscriptions.length === 0 ? (
          <AccountState title="No subscriptions yet" description="Choose a plan to have your essentials delivered regularly." action={<Link href="/subscriptions" className={accountButton}>Explore plans</Link>} />
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <article key={sub._id} className="overflow-hidden rounded-lg border border-zinc-200 bg-background">
                <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border px-6 py-6 md:px-8">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-brand-green"><ShoppingBag aria-hidden="true" strokeWidth={1.75} className="h-5 w-5" /></span>
                    <div className="min-w-0">
                      <h2 className="break-words text-xl font-medium text-brand-green">{sub.plan.name}</h2>
                      <p className="mt-1 text-sm font-normal text-zinc-500">Rs. {sub.plan.price.toLocaleString('en-LK')} · {sub.plan.frequency}</p>
                    </div>
                  </div>
                  <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${statusClass(sub.status)} `}>{sub.status}</span>
                </div>

                <div className="grid gap-px bg-background sm:grid-cols-3">
                  <Info icon={CalendarDays} label={sub.status === 'active' ? `Next delivery · ${sub.deliverySlot.day}` : 'Next delivery'} value={sub.status === 'active' ? formatDate(sub.nextDeliveryDate) : 'Not scheduled'} />
                  <Info icon={MapPin} label="Delivery to" value={[sub.deliveryAddress?.addressLine1, sub.deliveryAddress?.city].filter(Boolean).join(', ') || 'Not recorded'} />
                  <Info icon={RefreshCw} label="Completed" value={`${sub.totalDeliveries} deliver${sub.totalDeliveries === 1 ? 'y' : 'ies'}`} />
                </div>

                <div className="flex flex-wrap items-center gap-2 px-6 py-5 md:px-8">
                  {sub.status === 'active' && (
                    <>
                      <Action disabled={actionLoading !== null} onClick={() => { setActionError(null); setConfirmAction({ sub, action: 'skip' }); }}>Skip next</Action>
                      <Action disabled={actionLoading !== null} onClick={() => void handleAction(sub._id, 'pause')} icon={Pause}>Pause</Action>
                    </>
                  )}
                  {sub.status === 'paused' && <Action disabled={actionLoading !== null} onClick={() => void handleAction(sub._id, 'resume')} icon={Play}>Resume</Action>}
                  {sub.status !== 'cancelled' ? (
                    <button type="button" disabled={actionLoading !== null} onClick={() => { setActionError(null); setConfirmAction({ sub, action: 'cancel' }); }} className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"><X aria-hidden="true" strokeWidth={1.75} className="h-3.5 w-3.5" /> Cancel plan</button>
                  ) : (
                    <div className="ml-auto inline-flex items-center gap-2 text-xs text-muted-foreground"><AlertCircle className="h-3.5 w-3.5" /> This plan is cancelled</div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
    </AccountPage>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return <div className="bg-background px-6 py-5 md:px-8"><div className="flex items-center gap-2 text-xs font-bold normal-case text-muted-foreground"><Icon aria-hidden="true" strokeWidth={1.75} className="h-3.5 w-3.5 text-emerald-700" /> {label}</div><p className="mt-2 break-words text-sm font-medium text-zinc-800">{value}</p></div>;
}

function Action({ children, onClick, disabled, icon: Icon }: { children: React.ReactNode; onClick: () => void; disabled: boolean; icon?: typeof Pause }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-50">{Icon ? <Icon aria-hidden="true" strokeWidth={1.75} className="h-3.5 w-3.5" /> : null}{children}</button>;
}
