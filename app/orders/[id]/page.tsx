"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Home,
  Package,
  Truck,
  ArrowLeft,
  Calendar,
  MapPin,
  CreditCard,
  XCircle,
  RotateCcw,
  ShoppingBag
} from "lucide-react";

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
  const { user } = useAuth();

  // recurrence UI state
  const [recurrenceFreq, setRecurrenceFreq] = useState<'weekly' | 'monthly' | 'quarterly'>('weekly');
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(1);
  const [monthlyMode, setMonthlyMode] = useState<'bymonthday' | 'byweekday'>('bymonthday');
  const [monthlyDay, setMonthlyDay] = useState<number | ''>('');
  const [monthlyNth, setMonthlyNth] = useState<number>(1);
  const [monthlyWeekday, setMonthlyWeekday] = useState<number>(0);

  useEffect(() => {
    // Wait for id to be available
    if (!id) {
      return;
    }

    const load = async () => {
      setLoading(true);
      setNotFoundError(false);
      try {
        let res = await fetch(`/api/orders/${id}`, { credentials: 'include', cache: 'no-store' });

        if (res.status === 401) {
          await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
          res = await fetch(`/api/orders/${id}`, { credentials: 'include', cache: 'no-store' });
        }

        if (res.status === 401) {
          router.push(`/auth/login?redirect=/orders/${id}`);
          return;
        }

        if (res.status === 404) {
          setNotFoundError(true);
          return;
        }

        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.success) setOrder(data.data);
        else setNotFoundError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, router]);

  const stages = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

  function Stepper({ status }: { status: string }) {
    const s = (status || '').toLowerCase();
    const idx = stages.indexOf(s);
    const isKnownStage = idx >= 0;

    const icons = [
      <Clock key="pending" className="w-5 h-5" />,
      <CheckCircle2 key="confirmed" className="w-5 h-5" />,
      <Package key="processing" className="w-5 h-5" />,
      <Truck key="shipped" className="w-5 h-5" />,
      <Home key="delivered" className="w-5 h-5" />
    ];

    const labels = ["Pending", "Confirmed", "Packing", "Shipped", "Delivered"];

    return (
      <div className="w-full py-8 px-4">
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
          {/* Background Line */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full" />

          {/* Active Progress Line */}
          <div
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.max(0, (idx / (stages.length - 1)) * 100)}%` }}
          />

          {stages.map((stage, i) => {
            const isCompleted = isKnownStage && i <= idx;
            const isCurrent = isKnownStage && i === idx;

            return (
              <div key={stage} className="flex flex-col items-center gap-3 relative z-10">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-4 shadow-sm
                    ${isCompleted
                      ? 'bg-emerald-500 border-white text-white shadow-lg shadow-emerald-200'
                      : 'bg-white border-gray-100 text-gray-300'
                    }
                    ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}
                  `}
                >
                  {isCompleted ? icons[i] : <div className="w-3 h-3 rounded-full bg-gray-200" />}
                </div>
                <span className={`text-xs font-semibold transition-colors duration-300 whitespace-nowrap ${isCompleted ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {labels[i]}
                </span>
              </div>
            );
          })}
        </div>

        {!isKnownStage && s && (
          <div className="mt-6 text-center">
            <span className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium border border-red-100 inline-flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Status: {status}
            </span>
          </div>
        )}
      </div>
    );
  }

  const doRecurringAction = async (action: 'pause' | 'resume' | 'end') => {
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

  useEffect(() => {
    if (!order || !order.recurrence) return;
    if (Array.isArray(order.recurrence.daysOfWeek) && order.recurrence.daysOfWeek.length) {
      setRecurrenceFreq('weekly');
      setRecurrenceInterval(1);
    }
  }, [order]);

  // Not Found State
  if (!loading && notFoundError) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-gray-50/50">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          We couldn&apos;t find the order you&apos;re looking for. It may have been deleted or you don&apos;t have permission to view it.
        </p>
        <div className="flex gap-4">
          <Link href="/orders">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
          </Link>
          <Link href="/">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
      name: String(fd.get('name') || ''),
      street: String(fd.get('street') || ''),
      city: String(fd.get('city') || ''),
      state: String(fd.get('state') || ''),
      zipCode: String(fd.get('zip') || ''),
      country: String(fd.get('country') || 'LK'),
      phone: String(fd.get('phone') || ''),
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

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'confirmed' || s === 'processing') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s === 'shipped') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (s === 'cancelled' || s === 'canceled' || s === 'refunded') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-64 bg-gray-200 rounded-xl"></div>
              <div className="h-48 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${getStatusBadge(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(order.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                {order.bagName && (
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4" />
                    {order.bagName}
                  </span>
                )}
              </div>
            </div>

            {user && ['pending', 'confirmed', 'processing'].includes((order.status || '').toLowerCase()) && (
              <Button
                variant="outline"
                size="sm"
                onClick={cancelOrder}
                disabled={saving}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        {/* Status Stepper */}
        <Card className="shadow-sm border-none ring-1 ring-black/5 mb-8 overflow-hidden">
          <CardContent className="p-0">
            <Stepper status={order.status} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="shadow-sm border-none ring-1 ring-black/5 overflow-hidden">
              <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-500" />
                  Order Items
                  <span className="ml-auto text-sm font-normal text-gray-500">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                </h2>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {order.items.map((it: ApiOrderItem, idx: number) => (
                    <div key={`${it.name || it.productId?._id || idx}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
                        <Package className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{it.name || it.productId?.name || 'Item'}</h3>
                        <p className="text-sm text-gray-500">Quantity: {it.qty} × Rs. {Number(it.price).toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">Rs. {Number(it.total ?? (it.qty * it.price)).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recurring Schedule */}
            {(order.isRecurring || order.nextDeliveryAt || order.scheduleStatus || order.recurrence) && (
              <Card className="shadow-sm border-none ring-1 ring-black/5 overflow-hidden">
                <div className="bg-blue-50/80 px-6 py-4 border-b border-blue-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 text-blue-600" />
                      Recurring Schedule
                    </h2>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${order.scheduleStatus === 'active' ? 'bg-green-100 text-green-700' :
                      order.scheduleStatus === 'paused' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
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

                  <div className="bg-emerald-50 rounded-lg p-4 mb-6 border border-emerald-100">
                    <p className="text-sm text-emerald-800">
                      <span className="font-semibold">Next delivery:</span>{' '}
                      {order.nextDeliveryAt ? new Date(order.nextDeliveryAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                    </p>
                  </div>

                  {order.recurrence && (
                    <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-500">Start Date</span>
                        <p className="font-medium">{order.recurrence.startDate ? new Date(order.recurrence.startDate).toLocaleDateString() : '—'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-500">End Date</span>
                        <p className="font-medium">{order.recurrence.endDate ? new Date(order.recurrence.endDate).toLocaleDateString() : '—'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-500">Days</span>
                        <p className="font-medium">{Array.isArray(order.recurrence.daysOfWeek) && order.recurrence.daysOfWeek.length ? order.recurrence.daysOfWeek.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ') : '—'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-500">Excludes</span>
                        <p className="font-medium">{order.recurrence.excludeDates?.length || 0} dates</p>
                      </div>
                    </div>
                  )}

                  {/* Recurrence edit form */}
                  <form className="space-y-4 border-t pt-6" onSubmit={saveRecurrence}>
                    <h3 className="font-semibold text-gray-900 mb-4">Edit Schedule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block">Start date</Label>
                        <Input type="date" name="recurrence_start" defaultValue={formatDateInput(order.recurrence?.startDate)} className="h-11" />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block">End date</Label>
                        <Input type="date" name="recurrence_end" defaultValue={formatDateInput(order.recurrence?.endDate)} className="h-11" />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600 mb-3 block">Days of week</Label>
                      <div className="flex flex-wrap gap-2">
                        {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                          <label key={d} className="inline-flex items-center gap-2 bg-white border rounded-lg px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:bg-emerald-50 has-[:checked]:border-emerald-300 has-[:checked]:text-emerald-700">
                            <input type="checkbox" name="recurrence_dow" value={d} defaultChecked={order.recurrence?.daysOfWeek?.includes(d)} className="rounded text-emerald-600" />
                            <span className="font-medium text-sm">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Notes</Label>
                      <textarea name="recurrence_notes" className="w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" rows={2} defaultValue={order.recurrence?.notes || ''} placeholder="Any special instructions..."></textarea>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">Save Schedule</Button>
                      {order.scheduleStatus === 'ended' && (
                        <Button type="button" variant="outline" onClick={() => doRecurringAction('resume')} disabled={saving}>Reactivate</Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Delivery Address */}
            {order.shippingAddress && (
              <Card className="shadow-sm border-none ring-1 ring-black/5 overflow-hidden">
                <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    Delivery Address
                  </h2>
                </div>
                <CardContent className="p-6">
                  <form className="space-y-4" onSubmit={saveAddress} onChange={() => { if (addressSaved) setAddressSaved(false); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block">Name</Label>
                        <Input name="name" defaultValue={order.shippingAddress.name || ''} placeholder="Recipient name" className="h-11" />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block">Phone</Label>
                        <Input name="phone" defaultValue={(order.shippingAddress as unknown as { phone?: string })?.phone || ''} placeholder="+94 77 123 4567" className="h-11" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Street Address</Label>
                      <Input name="street" defaultValue={order.shippingAddress.street || ''} placeholder="123 Main St, Apt 4B" className="h-11" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block">City</Label>
                        <Input name="city" defaultValue={order.shippingAddress.city || ''} className="h-11" />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block">State</Label>
                        <Input name="state" defaultValue={order.shippingAddress.state || ''} className="h-11" />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block">Postal Code</Label>
                        <Input name="zip" defaultValue={order.shippingAddress.zipCode || ''} className="h-11" />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block">Country</Label>
                        <Input name="country" defaultValue={(order.shippingAddress as unknown as { country?: string })?.country || 'LK'} className="h-11" />
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
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {addressSaved ? 'Address Saved ✓' : 'Save Address'}
                      </Button>
                      {['cancelled', 'canceled', 'shipped', 'delivered'].includes((order.status || '').toLowerCase()) && (
                        <p className="text-xs text-gray-500 mt-2">Address cannot be modified for {order.status} orders.</p>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right summary column */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 space-y-6">
              <Card className="shadow-lg border-none ring-1 ring-black/5 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Order Summary
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
                    <span className="text-2xl font-bold text-gray-900">Rs. {Number(order.total ?? 0).toFixed(2)}</span>
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
              <Card className="shadow-sm border-none ring-1 ring-black/5 overflow-hidden">
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
      </div>
    </div>
  );
}
