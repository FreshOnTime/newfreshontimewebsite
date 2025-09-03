"use client";

import { useEffect, useRef, useState } from "react";
import { PageContainer } from "@/components/templates/PageContainer";
import { notFound, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

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
      if (res.ok && data?.success) setOrder(data.data);
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
      if (res.ok && data?.success) setOrder(data.data);
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
      if (res.ok && data?.success) setOrder(data.data);
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
      if (res.ok && data?.success) setOrder(data.data);
    } finally { setSaving(false); }
  };

  return (
    <PageContainer>
      {loading || !order ? (
        <div className="p-6">Loading...</div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
              <div className="text-sm text-gray-600">Placed on {new Date(order.createdAt).toLocaleString()}</div>
              {order.bagName && (
                <div className="text-sm text-gray-600">From bag: <span className="font-medium">{order.bagName}</span></div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm px-2 py-1 rounded ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{order.status}</span>
              {user && (order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing') && (
                <button className="text-sm px-3 py-1 rounded border hover:bg-gray-50" onClick={cancelOrder} disabled={saving}>Cancel</button>
              )}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {order.items.map((it: ApiOrderItem, idx: number) => (
                <div key={`${it.name || it.productId?._id || idx}`} className="flex items-center justify-between border rounded p-4">
                  <div>
                    <div className="font-medium">{it.name || it.productId?.name || 'Item'}</div>
                    <div className="text-sm text-gray-600">{it.qty} × Rs. {Number(it.price ?? 0).toFixed(2)}</div>
                  </div>
                  <div className="font-semibold">Rs. {Number(it.total ?? (it.qty * it.price)).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Summary</h3>
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>Rs. {Number(order.subtotal ?? 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Shipping</span><span>Rs. {Number(order.shipping ?? 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Tax</span><span>Rs. {Number(order.tax ?? 0).toFixed(2)}</span></div>
                <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>Rs. {Number(order.total ?? 0).toFixed(2)}</span></div>
              </div>
              {(order.isRecurring || order.nextDeliveryAt || order.scheduleStatus || order.recurrence) && (
                <div className="border rounded p-4">
                  <h3 className="font-semibold mb-2">Recurring schedule</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">Recurring</span>
                    <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-gray-50 text-gray-700 border border-gray-200">{order.scheduleStatus || 'active'}</span>
                    {order.scheduleStatus !== 'ended' && (
                      <div className="ml-auto flex gap-2">
                        {order.scheduleStatus === 'active' ? (
                          <button className="text-xs px-2 py-1 rounded border" onClick={() => doRecurringAction('pause')} disabled={saving}>Pause</button>
                        ) : (
                          <button className="text-xs px-2 py-1 rounded border" onClick={() => doRecurringAction('resume')} disabled={saving}>Resume</button>
                        )}
                        <button className="text-xs px-2 py-1 rounded border" onClick={() => doRecurringAction('end')} disabled={saving}>End</button>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 mb-1">Next delivery: <span className="font-medium">{order.nextDeliveryAt ? new Date(order.nextDeliveryAt).toLocaleDateString() : '—'}</span></div>
                  {order.recurrence && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Start: {order.recurrence.startDate ? new Date(order.recurrence.startDate).toLocaleDateString() : '—'}</div>
                      <div>End: {order.recurrence.endDate ? new Date(order.recurrence.endDate).toLocaleDateString() : '—'}</div>
                      <div>Days: {Array.isArray(order.recurrence.daysOfWeek) && order.recurrence.daysOfWeek.length ? order.recurrence.daysOfWeek.join(', ') : '—'}</div>
                      <div>Includes: {order.recurrence.includeDates?.length || 0}</div>
                      <div>Excludes: {order.recurrence.excludeDates?.length || 0}</div>
                      {order.recurrence.notes && <div className="mt-1">Notes: {order.recurrence.notes}</div>}
                    </div>
                  )}

                  {/* Recurrence edit form for customers */}
                  <form className="mt-3 space-y-2" onSubmit={saveRecurrence}>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Start date</label>
                        <input type="date" name="recurrence_start" className="w-full border p-2 rounded text-sm" defaultValue={formatDateInput(order.recurrence?.startDate)} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">End date</label>
                        <input type="date" name="recurrence_end" className="w-full border p-2 rounded text-sm" defaultValue={formatDateInput(order.recurrence?.endDate)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Days of week</label>
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
                      <label className="block text-xs text-gray-600 mb-1">Include dates (YYYY-MM-DD, comma-separated)</label>
                      <textarea name="recurrence_include" className="w-full border p-2 rounded text-sm" rows={2} defaultValue={formatDateList(order.recurrence?.includeDates)} placeholder="2025-09-10, 2025-10-01"></textarea>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Exclude dates (YYYY-MM-DD, comma-separated)</label>
                      <textarea name="recurrence_exclude" className="w-full border p-2 rounded text-sm" rows={2} defaultValue={formatDateList(order.recurrence?.excludeDates)} placeholder="2025-09-17"></textarea>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Notes</label>
                      <textarea name="recurrence_notes" className="w-full border p-2 rounded text-sm" rows={2} defaultValue={order.recurrence?.notes || ''}></textarea>
                    </div>
                    <button className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-60" disabled={saving} type="submit">Save schedule</button>
                    {order.scheduleStatus === 'ended' && (
                      <button type="button" className="ml-2 px-3 py-2 rounded border disabled:opacity-60" onClick={() => doRecurringAction('resume')} disabled={saving}>Activate</button>
                    )}
                  </form>
                </div>
              )}
              {order.shippingAddress && (
                <div className="border rounded p-4">
                  <h3 className="font-semibold mb-2">Delivery Address</h3>
                  <form className="space-y-2" onSubmit={saveAddress}>
                    <input className="w-full border p-2 rounded" name="name" defaultValue={order.shippingAddress.name || ''} placeholder="Name" />
                    <input className="w-full border p-2 rounded" name="street" defaultValue={order.shippingAddress.street || ''} placeholder="Street" />
                    <div className="grid grid-cols-2 gap-2">
                      <input className="border p-2 rounded" name="city" defaultValue={order.shippingAddress.city || ''} placeholder="City" />
                      <input className="border p-2 rounded" name="state" defaultValue={order.shippingAddress.state || ''} placeholder="State" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input className="border p-2 rounded" name="zip" defaultValue={order.shippingAddress.zipCode || ''} placeholder="Postal code" />
                      <input className="border p-2 rounded" name="country" defaultValue={(order.shippingAddress as unknown as { country?: string })?.country || 'LK'} placeholder="Country" />
                    </div>
                    <input className="w-full border p-2 rounded" name="phone" defaultValue={(order.shippingAddress as unknown as { phone?: string })?.phone || ''} placeholder="Phone" />
                    <button className="px-3 py-2 rounded bg-green-600 text-white disabled:opacity-60" disabled={saving} type="submit">Save address</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
}
