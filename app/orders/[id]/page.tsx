"use client";

import { useEffect, useRef, useState } from "react";
import { PageContainer } from "@/components/templates/PageContainer";
import { notFound, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
  const router = useRouter();
  const didFetch = useRef(false);
  const { user } = useAuth();

  useEffect(() => {
    if (didFetch.current) return; // Avoid double-run in React Strict Mode
    didFetch.current = true;
    const load = async () => {
      try {
        // First attempt
        let res = await fetch(`/api/orders/${id}`, { credentials: 'include', cache: 'no-store' });

        // If unauthorized, try refresh once then retry
        if (res.status === 401) {
          await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
          res = await fetch(`/api/orders/${id}`, { credentials: 'include', cache: 'no-store' });
        }

        if (res.status === 401) {
          // Still unauthorized -> send user to login with redirect back
          router.push(`/auth/login?redirect=/orders/${id}`);
          return;
        }

        if (res.status === 404) {
          setOrder(null);
          return;
        }

        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.success) setOrder(data.data);
        else setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, router]);

  if (!loading && !order) return notFound();

  const doRecurringAction = async (action: 'pause'|'resume'|'end') => {
    if (!order?._id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/recurring/${order._id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
      if (res.status === 401) {
        await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
        return doRecurringAction(action);
      }
      const data = await res.json();
      if (res.ok && data?.success) {
        setOrder(data.data);
      } else {
        const msg = (data && (data.error || data.message)) || 'Failed to update schedule';
        alert(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const cancelOrder = async () => {
    if (!order?._id) return;
    if (!confirm('Cancel this order?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order._id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel' }) });
      const data = await res.json();
      if (res.ok && data?.success) {
        setOrder(data.data);
      } else {
        const msg = (data && (data.error || data.message)) || 'Failed to cancel order';
        alert(msg);
      }
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

  const formatDateList = (isos?: string[]) => {
    if (!Array.isArray(isos) || !isos.length) return '';
    const toYmd = (s: string) => {
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) return '';
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    return isos.map(toYmd).filter(Boolean).join(', ');
  };

  const saveRecurrence = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!order?._id) return;
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
    try {
      const res = await fetch(`/api/orders/recurring/${order._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
        return saveRecurrence(e);
      }
      const data = await res.json();
      if (res.ok && data?.success) {
        setOrder(data.data);
      } else {
        const msg = (data && (data.error || data.message)) || 'Failed to save schedule';
        alert(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const saveAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!order?._id) return;
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const shippingAddress = {
      name: String(fd.get('name')||''),
      street: String(fd.get('street')||''),
      city: String(fd.get('city')||''),
      state: String(fd.get('state')||''),
      zipCode: String(fd.get('zip')||''),
      country: String(fd.get('country')||'LK'),
      phone: String(fd.get('phone')||''),
    };
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order._id}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shippingAddress }) });
      const data = await res.json();
      if (res.ok && data?.success) {
        setOrder(data.data);
        setAddressSaved(true);
        alert('Address saved');
      } else {
        const msg = (data && (data.error || data.message)) || 'Failed to save address';
        alert(msg);
      }
    } finally { setSaving(false); }
  };

  return (
    <PageContainer>
      {loading || !order ? (
        <div className="max-w-6xl mx-auto p-6">Loading...</div>
      ) : (
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold">Order {order.orderNumber}</h1>
              <div className="text-sm text-gray-600">Placed on {new Date(order.createdAt).toLocaleString()}</div>
              {order.bagName && (
                <div className="text-sm text-gray-600">From bag: <span className="font-medium">{order.bagName}</span></div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{order.status}</span>
              {user && (order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing') && (
                <Button variant="outline" size="sm" onClick={cancelOrder} disabled={saving}>Cancel</Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.items.map((it: ApiOrderItem, idx: number) => (
                      <div key={`${it.name || it.productId?._id || idx}`} className="flex items-center justify-between text-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">Img</div>
                          <div>
                            <div className="font-medium">{it.name || it.productId?.name || 'Item'}</div>
                            <div className="text-xs text-gray-500">Qty: {it.qty}</div>
                          </div>
                        </div>
                        <div className="font-semibold">Rs. {Number(it.total ?? (it.qty * it.price)).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {(order.isRecurring || order.nextDeliveryAt || order.scheduleStatus || order.recurrence) && (
                <Card className="shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Recurring schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">Recurring</span>
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-gray-50 text-gray-700 border border-gray-200">{order.scheduleStatus || 'active'}</span>
                      {order.scheduleStatus !== 'ended' && (
                        <div className="ml-auto flex gap-2">
                          {order.scheduleStatus === 'active' ? (
                            <Button variant="outline" size="sm" onClick={() => doRecurringAction('pause')} disabled={saving}>Pause</Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => doRecurringAction('resume')} disabled={saving}>Resume</Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => doRecurringAction('end')} disabled={saving}>End</Button>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-700 mb-2">Next delivery: <span className="font-medium">{order.nextDeliveryAt ? new Date(order.nextDeliveryAt).toLocaleDateString() : '—'}</span></div>
                    {order.recurrence && (
                      <div className="text-xs text-gray-600 space-y-1 mb-3">
                        <div>Start: {order.recurrence.startDate ? new Date(order.recurrence.startDate).toLocaleDateString() : '—'}</div>
                        <div>End: {order.recurrence.endDate ? new Date(order.recurrence.endDate).toLocaleDateString() : '—'}</div>
                        <div>Days: {Array.isArray(order.recurrence.daysOfWeek) && order.recurrence.daysOfWeek.length ? order.recurrence.daysOfWeek.join(', ') : '—'}</div>
                        <div>Includes: {order.recurrence.includeDates?.length || 0}</div>
                        <div>Excludes: {order.recurrence.excludeDates?.length || 0}</div>
                        {order.recurrence.notes && <div className="mt-1">Notes: {order.recurrence.notes}</div>}
                      </div>
                    )}

                    {/* Recurrence edit form */}
                    <form className="space-y-3" onSubmit={saveRecurrence}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600">Start date</Label>
                          <Input type="date" name="recurrence_start" defaultValue={formatDateInput(order.recurrence?.startDate)} />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">End date</Label>
                          <Input type="date" name="recurrence_end" defaultValue={formatDateInput(order.recurrence?.endDate)} />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-1">Days of week</Label>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {[0,1,2,3,4,5,6].map((d) => (
                            <label key={d} className="inline-flex items-center gap-1 border rounded px-2 py-1">
                              <input type="checkbox" name="recurrence_dow" value={d} defaultChecked={order.recurrence?.daysOfWeek?.includes(d)} />
                              <span>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-1">Include dates (YYYY-MM-DD, comma-separated)</Label>
                        <textarea name="recurrence_include" className="w-full border rounded px-3 py-2 text-sm" rows={2} defaultValue={formatDateList(order.recurrence?.includeDates)} placeholder="2025-09-10, 2025-10-01"></textarea>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-1">Exclude dates (YYYY-MM-DD, comma-separated)</Label>
                        <textarea name="recurrence_exclude" className="w-full border rounded px-3 py-2 text-sm" rows={2} defaultValue={formatDateList(order.recurrence?.excludeDates)} placeholder="2025-09-17"></textarea>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-1">Notes</Label>
                        <textarea name="recurrence_notes" className="w-full border rounded px-3 py-2 text-sm" rows={2} defaultValue={order.recurrence?.notes || ''}></textarea>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button type="submit" disabled={saving}>Save schedule</Button>
                        {order.scheduleStatus === 'ended' && (
                          <Button type="button" variant="outline" onClick={() => doRecurringAction('resume')} disabled={saving}>Activate</Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {order.shippingAddress && (
                <Card className="shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Delivery address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-3" onSubmit={saveAddress} onChange={() => { if (addressSaved) setAddressSaved(false); }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600">Name</Label>
                          <Input name="name" defaultValue={order.shippingAddress.name || ''} placeholder="Name" />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Phone</Label>
                          <Input name="phone" defaultValue={(order.shippingAddress as unknown as { phone?: string })?.phone || ''} placeholder="Phone" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Street</Label>
                        <Input name="street" defaultValue={order.shippingAddress.street || ''} placeholder="Street" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600">City</Label>
                          <Input name="city" defaultValue={order.shippingAddress.city || ''} placeholder="City" />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">State</Label>
                          <Input name="state" defaultValue={order.shippingAddress.state || ''} placeholder="State" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600">Postal code</Label>
                          <Input name="zip" defaultValue={order.shippingAddress.zipCode || ''} placeholder="Postal code" />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Country</Label>
                          <Input name="country" defaultValue={(order.shippingAddress as unknown as { country?: string })?.country || 'LK'} placeholder="Country" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button type="submit" disabled={saving || addressSaved}>Save address</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right summary column */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-3">
                <Card className="shadow-lg">
                  <CardContent>
                    <h3 className="text-lg font-medium mb-2">Order Summary</h3>
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between"><span>Subtotal</span><span>Rs. {Number(order.subtotal ?? 0).toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Shipping</span><span>Rs. {Number(order.shipping ?? 0).toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Tax</span><span>Rs. {Number(order.tax ?? 0).toFixed(2)}</span></div>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3 mb-4">
                      <span className="text-sm text-gray-600">Total</span>
                      <span className="text-lg font-semibold">Rs. {Number(order.total ?? 0).toFixed(2)}</span>
                    </div>
                    {user && (order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing') && (
                      <Button variant="ghost" onClick={cancelOrder} disabled={saving} className="w-full">Cancel order</Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
