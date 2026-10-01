"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from 'sonner';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';
import { AccountPage, AccountState, AccountLoading, accountSecondaryButton } from '@/components/account/AccountPage';
import { CheckCircle2, Clock, Package, Truck, ArrowLeft, MapPin, CreditCard, XCircle, RotateCcw } from "lucide-react";

type ApiOrderItem = {
  productId?: { _id: string; name: string } | null;
  qty: number;
  price: number;
  total?: number;
  name?: string;
};

type ApiOrder = {
  _id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  bagName?: string;
  items: ApiOrderItem[];
  subtotal?: number;
  tax?: number;
  shipping?: number;
  total?: number;
  shippingAddress?: { name?: string; street?: string; city?: string; state?: string; zipCode?: string; country?: string };
  isRecurring?: boolean;
  scheduleStatus?: 'active' | 'paused' | 'ended';
  nextDeliveryAt?: string;
  recurrence?: {
    startDate?: string;
    endDate?: string;
    daysOfWeek?: number[];
    includeDates?: string[];
    excludeDates?: string[];
    selectedDates?: string[];
    notes?: string;
  };
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
  const [notFoundError, setNotFoundError] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!id || authLoading) return;
    setOrder(null);
    setNotFoundError(false);
    setLoadError(null);
    setActionError(null);
    setAddressSaved(false);
    if (!user?._id) { router.replace(`/auth/login?redirect=/orders/${id}`); setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true);
    const load = async () => {
      try {
        const res = await authenticatedApiFetch(`/api/orders/${id}`, { cache: 'no-store', signal: controller.signal });
        if (res.status === 401) { router.replace(`/auth/login?redirect=/orders/${id}`); return; }
        if (res.status === 404) { if (!controller.signal.aborted) setNotFoundError(true); return; }
        const data = await res.json();
        if (!res.ok || !data?.success) throw new Error(data.error || 'Please try again in a moment.');
        if (!controller.signal.aborted) setOrder(data.data);
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : 'Please try again in a moment.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [id, user?._id, authLoading, router, retryCount]);

  const doRecurringAction = async (action: 'pause' | 'resume' | 'end') => {
    if (!order?._id || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      const res = await authenticatedApiFetch(`/api/orders/recurring/${order._id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
      const data = await res.json();
      if (res.ok && data?.success) {
        setOrder(data.data);
      } else {
        const msg = (data && (data.error || data.message)) || 'Failed to update schedule';
        setActionError(msg);
      }
    } catch {
      setActionError('Couldn’t save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const cancelOrder = async () => {
    if (!order?._id || saving) return;
    if (!confirm('Cancel this order?')) return;
    setSaving(true);
    setActionError(null);
    try {
      const res = await authenticatedApiFetch(`/api/orders/${order._id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel' }) });
      const data = await res.json();
      if (res.ok && data?.success) {
        setOrder(data.data);
      } else {
        const msg = (data && (data.error || data.message)) || 'Failed to cancel order';
        setActionError(msg);
      }
    } catch {
      setActionError('Couldn’t save your changes. Please try again.');
    } finally { setSaving(false); }
  };

  const formatDateInput = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const saveRecurrence = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!order?._id || saving) return;
    const fd = new FormData(e.currentTarget);
    const startDate = String(fd.get('recurrence_start') || '');
    const endDate = String(fd.get('recurrence_end') || '');
    const notes = String(fd.get('recurrence_notes') || '');
    const dows = fd.getAll('recurrence_dow').map(v => Number(v)).filter(v => !Number.isNaN(v));
    const includeCSV = String(fd.get('recurrence_include') || '').trim();
    const excludeCSV = String(fd.get('recurrence_exclude') || '').trim();
    const toList = (csv: string) => csv.split(',').map(s => s.trim()).filter(Boolean);
    const includeDates = toList(includeCSV);
    const excludeDates = toList(excludeCSV);

    const body: { recurrence: { startDate?: string; endDate?: string; daysOfWeek?: number[]; includeDates?: string[]; excludeDates?: string[]; notes?: string } } = {
      recurrence: {
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(dows.length ? { daysOfWeek: dows } : {}),
        ...(includeDates.length ? { includeDates } : {}),
        ...(excludeDates.length ? { excludeDates } : {}),
        ...(notes ? { notes } : {}),
      },
    };

    setSaving(true);
    setActionError(null);
    try {
      const res = await authenticatedApiFetch(`/api/orders/recurring/${order._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        setOrder(data.data);
      } else {
        const msg = (data && (data.error || data.message)) || 'Failed to save schedule';
        setActionError(msg);
      }
    } catch {
      setActionError('Couldn’t save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const saveAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!order?._id || saving) return;
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const shippingAddress = {
      name: String(fd.get('name') || ''),
      street: String(fd.get('street') || ''),
      city: String(fd.get('city') || ''),
      state: String(fd.get('state') || ''),
      zipCode: String(fd.get('zip') || ''),
      country: String(fd.get('country') || 'LK'),
      phone: String(fd.get('phone') || ''),
    };
    setSaving(true);
    setActionError(null);
    try {
      const res = await authenticatedApiFetch(`/api/orders/${order._id}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shippingAddress }) });
      const data = await res.json();
      if (res.ok && data?.success) {
        setOrder(data.data);
        setAddressSaved(true);
        toast.success('Delivery address updated');
      } else {
        const msg = (data && (data.error || data.message)) || 'Failed to save address';
        setActionError(msg);
      }
    } catch {
      setActionError('Couldn’t save your changes. Please try again.');
    } finally { setSaving(false); }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'confirmed' || s === 'processing') return 'bg-secondary text-brand-green border-border';
    if (s === 'shipped') return 'bg-secondary text-brand-green border-border';
    if (s === 'cancelled' || s === 'canceled' || s === 'refunded') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (authLoading || loading || loadError || notFoundError || !order) {
    return <AccountPage title="Order details" description="Delivery updates and purchased items." action={<Link href="/orders" className={accountSecondaryButton}><ArrowLeft className="h-4 w-4" />All orders</Link>}>
      {authLoading || loading ? <AccountLoading label="Loading your order…" /> : loadError ?
        <AccountState error title="Couldn’t load this order" description={loadError} action={<button type="button" className={accountSecondaryButton} onClick={() => setRetryCount((count) => count + 1)}>Try again</button>} /> : notFoundError ?
        <AccountState title="Order not found" description="This order is unavailable for your account." action={<Link href="/orders" className={accountSecondaryButton}>View your orders</Link>} /> : null}
    </AccountPage>;
  }

  const addressEditable = !['cancelled', 'canceled', 'shipped', 'delivered', 'refunded'].includes(order.status.toLowerCase());

  return (
    <AccountPage title={`Order #${order.orderNumber}`} description={`${new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}${order.bagName ? ` · ${order.bagName}` : ''}`} action={<Link href="/orders" className={accountSecondaryButton}><ArrowLeft className="h-4 w-4" />All orders</Link>}>
        {actionError && <p role="alert" className="mb-6 rounded-lg border border-rose-200 px-4 py-3 text-sm text-rose-700">{actionError}</p>}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-brand-green">Delivery status</h2>
          <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusBadge(order.status)}`}>{order.status}</span>
        </div>
        {/* Status Stepper */}
        <Card className="shadow-none border-border bg-background mb-8 overflow-hidden">
          <CardContent className="p-0">
            <Stepper status={order.status} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <Card className="shadow-none border-border bg-background overflow-hidden">
              <div className="bg-background px-6 py-4 border-b border-border">
                <h2 className="text-lg font-medium text-brand-green flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-500" />
                  Items
                  <span className="ml-auto text-sm font-normal text-gray-500">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                </h2>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {order.items.map((it: ApiOrderItem, idx: number) => (
                    <div key={`${it.name || it.productId?._id || idx}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-border py-4 last:border-0">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground break-words">{it.name || it.productId?.name || 'Item'}</h3>
                        <p className="text-sm text-gray-500">{it.qty} × Rs. {Number(it.price).toFixed(2)}</p>
                      </div>
                      <div className="text-right text-sm tabular-nums">
                        <span className="font-medium text-foreground">Rs. {Number(it.total ?? (it.qty * it.price)).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recurring delivery */}
            {(order.isRecurring || order.nextDeliveryAt || order.scheduleStatus || order.recurrence) && (
              <Card className="shadow-none border-border bg-background overflow-hidden">
                <div className="bg-background px-6 py-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-brand-green flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 text-brand-green" />
                      Recurring delivery
                    </h2>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${order.scheduleStatus === 'active' ? 'bg-green-100 text-green-700' :
                      order.scheduleStatus === 'paused' ? 'bg-amber-100 text-amber-700' :
                        'bg-background text-gray-700'
                      } `}>
                      {order.scheduleStatus || 'active'}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    {order.scheduleStatus !== 'ended' && (
                      <div className="flex gap-2">
                        {order.scheduleStatus === 'active' ? (
                          <Button variant="outline" size="sm" onClick={() => doRecurringAction('pause')} disabled={saving}>Pause</Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => doRecurringAction('resume')} disabled={saving}>Resume</Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => doRecurringAction('end')} disabled={saving} className="text-red-600 border-red-200 hover:bg-red-50">End</Button>
                      </div>
                    )}
                  </div>

                  <div className="mb-6 border-b border-border pb-5">
                    <p className="text-sm text-emerald-800">
                      <span className="font-semibold">Next delivery:</span>{' '}
                      {order.nextDeliveryAt ? new Date(order.nextDeliveryAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                    </p>
                  </div>

                  {order.recurrence && (
                    <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                      <div className="bg-background rounded-lg p-3">
                        <span className="text-gray-500">Start Date</span>
                        <p className="font-medium">{order.recurrence.startDate ? new Date(order.recurrence.startDate).toLocaleDateString() : '—'}</p>
                      </div>
                      <div className="bg-background rounded-lg p-3">
                        <span className="text-gray-500">End Date</span>
                        <p className="font-medium">{order.recurrence.endDate ? new Date(order.recurrence.endDate).toLocaleDateString() : '—'}</p>
                      </div>
                      <div className="bg-background rounded-lg p-3">
                        <span className="text-gray-500">Days</span>
                        <p className="font-medium">{Array.isArray(order.recurrence.daysOfWeek) && order.recurrence.daysOfWeek.length ? order.recurrence.daysOfWeek.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ') : '—'}</p>
                      </div>
                      <div className="bg-background rounded-lg p-3">
                        <span className="text-gray-500">Excludes</span>
                        <p className="font-medium">{order.recurrence.excludeDates?.length || 0} dates</p>
                      </div>
                    </div>
                  )}

                  {/* Recurrence edit form */}
                  <details className="border-t border-border pt-5">
                    <summary className="cursor-pointer text-sm font-medium text-brand-green">Edit schedule</summary>
                    <form className="space-y-4 pt-5" onSubmit={saveRecurrence}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block" htmlFor="order-recurrence_start">Start date</Label>
                        <Input type="date" id="order-recurrence_start" name="recurrence_start" disabled={saving} defaultValue={formatDateInput(order.recurrence?.startDate)} className="h-11" />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block" htmlFor="order-recurrence_end">End date</Label>
                        <Input type="date" id="order-recurrence_end" name="recurrence_end" disabled={saving} defaultValue={formatDateInput(order.recurrence?.endDate)} className="h-11" />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600 mb-3 block">Days of week</Label>
                      <div className="flex flex-wrap gap-2">
                        {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                          <label key={d} className="inline-flex items-center gap-2 bg-background border rounded-lg px-4 py-2.5 cursor-pointer hover:bg-background transition-colors has-[:checked]:bg-emerald-50 has-[:checked]:border-emerald-300 has-[:checked]:text-emerald-700">
                            <input disabled={saving} type="checkbox" name="recurrence_dow" value={d} defaultChecked={order.recurrence?.daysOfWeek?.includes(d)} className="rounded text-emerald-600" />
                            <span className="font-medium text-sm">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="order-notes" className="text-sm text-gray-600 mb-2 block">Notes</Label>
                      <textarea id="order-notes" disabled={saving} name="recurrence_notes" className="w-full bg-background border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" rows={2} defaultValue={order.recurrence?.notes || ''} placeholder="Any special instructions..."></textarea>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button type="submit" disabled={saving} className="bg-brand-amber text-accent-foreground hover:bg-brand-amber/85">Save Schedule</Button>
                      {order.scheduleStatus === 'ended' && (
                        <Button type="button" variant="outline" onClick={() => doRecurringAction('resume')} disabled={saving}>Reactivate</Button>
                      )}
                    </div>
                    </form>
                  </details>
                </CardContent>
              </Card>
            )}

            {/* Delivery address */}
            {order.shippingAddress && (
              <Card className="shadow-none border-border bg-background overflow-hidden">
                <div className="bg-background px-6 py-4 border-b border-border">
                  <h2 className="text-lg font-medium text-brand-green flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    Delivery address
                  </h2>
                </div>
                <CardContent className="p-6">
                  <address className="text-sm not-italic leading-6 text-muted-foreground">
                    <p className="font-medium text-foreground">{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.street}</p>
                    <p>{[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zipCode].filter(Boolean).join(', ')}</p>
                    <p>{order.shippingAddress.country}</p>
                  </address>
                  {addressEditable ? <details className="mt-5 border-t border-border pt-5">
                    <summary className="cursor-pointer text-sm font-medium text-brand-green">Edit delivery address</summary>
                    <form className="space-y-4 pt-5" onSubmit={saveAddress} onChange={() => { if (addressSaved) setAddressSaved(false); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block" htmlFor="order-name">Name</Label>
                        <Input id="order-name" name="name" disabled={saving} defaultValue={order.shippingAddress.name || ''} placeholder="Recipient name" className="h-11" />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block" htmlFor="order-phone">Phone</Label>
                        <Input id="order-phone" name="phone" disabled={saving} defaultValue={(order.shippingAddress as unknown as { phone?: string })?.phone || ''} placeholder="+94 77 123 4567" className="h-11" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block" htmlFor="order-street">Street Address</Label>
                        <Input id="order-street" name="street" disabled={saving} defaultValue={order.shippingAddress.street || ''} placeholder="123 Main St, Apt 4B" className="h-11" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block" htmlFor="order-city">City</Label>
                        <Input id="order-city" name="city" disabled={saving} defaultValue={order.shippingAddress.city || ''} className="h-11" />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block" htmlFor="order-state">State</Label>
                        <Input id="order-state" name="state" disabled={saving} defaultValue={order.shippingAddress.state || ''} className="h-11" />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block" htmlFor="order-zip">Postal Code</Label>
                        <Input id="order-zip" name="zip" disabled={saving} defaultValue={order.shippingAddress.zipCode || ''} className="h-11" />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block" htmlFor="order-country">Country</Label>
                        <Input id="order-country" name="country" disabled={saving} defaultValue={(order.shippingAddress as unknown as { country?: string })?.country || 'LK'} className="h-11" />
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={
                          saving ||
                          addressSaved ||
                          ['cancelled', 'canceled', 'shipped', 'delivered'].includes((order.status || '').toLowerCase())
                        }
                        className="bg-brand-amber text-accent-foreground hover:bg-brand-amber/85"
                      >
                        {addressSaved ? 'Address Saved ✓' : 'Save Address'}
                      </Button>
                      {['cancelled', 'canceled', 'shipped', 'delivered'].includes((order.status || '').toLowerCase()) && (
                        <p className="text-xs text-gray-500 mt-2">Address cannot be modified for {order.status} orders.</p>
                      )}
                    </div>
                    </form>
                  </details> : <p className="mt-4 text-xs text-muted-foreground">Address cannot be modified for {order.status} orders.</p>}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right summary column */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 space-y-6">
              <Card className="shadow-none border-border bg-background overflow-hidden">
                <div className="border-b border-border px-6 py-4">
                  <h3 className="text-lg font-medium text-brand-green flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Order summary
                  </h3>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium text-gray-900">Rs. {Number(order.subtotal ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="font-medium text-emerald-600">
                        {Number(order.shipping ?? 0) === 0 ? 'Free' : `Rs. ${Number(order.shipping ?? 0).toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span className="font-medium text-gray-900">Rs. {Number(order.tax ?? 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-dashed pt-4 mb-6">
                    <span className="text-gray-600">Total</span>
                    <span className="text-2xl font-medium text-foreground">Rs. {Number(order.total ?? 0).toFixed(2)}</span>
                  </div>

                  {user && ['pending', 'confirmed', 'processing'].includes((order.status || '').toLowerCase()) && (
                    <Button
                      variant="ghost"
                      onClick={cancelOrder}
                      disabled={saving}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel This Order
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Need Help Card */}
              <Card className="shadow-none border-border bg-background overflow-hidden">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-500 mb-3">Need help with your order?</p>
                  <Link href="/help">
                    <Button variant="outline" size="sm" className="w-full">Contact Support</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
    </AccountPage>
  );
}

const stages = [
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { value: 'processing', label: 'Packing', icon: Package },
  { value: 'shipped', label: 'Shipped', icon: Truck },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

function Stepper({ status }: { status: string }) {
  const index = stages.findIndex((stage) => stage.value === status.toLowerCase());
  if (index < 0) return <p className="px-6 py-6 text-sm capitalize text-muted-foreground">Order {status}</p>;
  return (
    <ol aria-label="Delivery progress" className="grid grid-cols-5 gap-1 px-3 py-6 md:px-6">
      {stages.map(({ value, label, icon: Icon }, position) => (
        <li key={value} aria-current={position === index ? 'step' : undefined} className="flex min-w-0 flex-col items-center gap-3">
          <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${position <= index ? 'border-brand-green bg-brand-green text-white' : 'border-border text-muted-foreground'}`}><Icon className="h-4 w-4" aria-hidden="true" /></span>
          <span className={`text-[10px] sm:text-xs ${position <= index ? 'font-medium text-brand-green' : 'text-muted-foreground'}`}>{label}</span>
        </li>
      ))}
    </ol>
  );
}
