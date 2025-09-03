"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MultiDateSelector } from "@/components/ui/multi-date";
import { useBag } from "@/contexts/BagContext";
import { useAuth } from "@/contexts/AuthContext";

export default function CheckoutPage() {
  const params = useSearchParams();
  const bagId = params.get("bagId");
  const { bags, currentBag } = useBag();
  const { user } = useAuth();
  const bag = useMemo(() => {
    if (bagId) return bags.find(b => b.id === bagId) || null;
    return currentBag;
  }, [bags, bagId, currentBag]);
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [includeDates, setIncludeDates] = useState<string[]>([]);
  const [excludeDates, setExcludeDates] = useState<string[]>([]);
  const [recurrenceNotes, setRecurrenceNotes] = useState<string>("");
  const [nextPreview, setNextPreview] = useState<string | null>(null);
  const [useAccountAddress, setUseAccountAddress] = useState<boolean>(!!user?.registrationAddress);
  const [shipName, setShipName] = useState<string>(user?.registrationAddress?.recipientName || `${user?.firstName || ''}`.trim());
  const [shipPhone, setShipPhone] = useState<string>(user?.registrationAddress?.phoneNumber || user?.phoneNumber || '');
  const [shipStreet, setShipStreet] = useState<string>('');
  const [shipCity, setShipCity] = useState<string>('');
  const [shipState, setShipState] = useState<string>('');
  const [shipZip, setShipZip] = useState<string>('');
  const [shipCountry, setShipCountry] = useState<string>('LK');

  // When user info loads/changes, default to their account address
  useEffect(() => {
    if (user?.registrationAddress) {
      setUseAccountAddress(true);
      setShipName(user.registrationAddress.recipientName || `${user.firstName || ''}`.trim());
      setShipPhone(user.registrationAddress.phoneNumber || user.phoneNumber || '');
    }
  }, [user]);

  const total = useMemo(() => (
    bag?.items.reduce((sum, it) => sum + it.product.price * it.quantity, 0) || 0
  ), [bag]);
  const itemCount = useMemo(() => (
    bag?.items.reduce((sum, it) => sum + it.quantity, 0) || 0
  ), [bag]);

  const placeOrder = async () => {
    if (!bag || !user) {
      setError("Missing bag or user");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
    const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
      items: bag.items.map(it => ({ productId: it.product.id, quantity: it.quantity })),
          paymentMethod: "cash_on_delivery",
          bagId: bag.id,
          bagName: bag.name,
          useRegisteredAddress: useAccountAddress,
          shippingAddress: !useAccountAddress ? {
            name: shipName || undefined,
            street: shipStreet || undefined,
            city: shipCity || undefined,
            state: shipState || undefined,
            zipCode: shipZip || undefined,
            country: shipCountry || undefined,
            phone: shipPhone || undefined,
          } : undefined,
          isRecurring,
          recurrence: isRecurring ? {
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            daysOfWeek: daysOfWeek,
            includeDates,
            excludeDates,
            notes: recurrenceNotes || undefined,
          } : undefined,
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Order failed");
      }
      // Redirect to order detail page (backend returns populated order with _id)
      const orderId = data.data?._id || data.data?.id;
      if (orderId) {
        router.replace(`/orders/${orderId}`);
      } else {
        router.replace(`/orders`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!bag) {
    return <div className="max-w-3xl mx-auto p-6">No bag selected.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Checkout</h1>
        {bag?.name && (
          <p className="text-gray-600 mt-1">Bag: <span className="font-medium">{bag.name}</span>{typeof itemCount === 'number' && itemCount > 0 ? ` • ${itemCount} item${itemCount > 1 ? 's' : ''}` : ''}</p>
        )}
      </div>
      <div className="bg-white border rounded p-4 space-y-2">
        {bag?.name && (
          <div className="pb-2 mb-2 border-b">
            <h2 className="text-sm font-medium text-gray-700">Items in {bag.name}</h2>
          </div>
        )}
        {bag.items.map((it, idx) => (
          <div key={`${bag.id}-${it.product.id}-${idx}`} className="flex justify-between text-sm">
            <span>{it.product.name} x {it.quantity}</span>
            <span>Rs. {(it.product.price * it.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-2 border-t font-semibold">
          <span>Total</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>
      </div>
      {/* Recurring schedule */}
      <div className="bg-white border rounded p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-700">Recurring order</h2>
            <p className="text-xs text-gray-500">Enable to schedule recurring deliveries with rules or selected dates.</p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
            Enable
          </label>
        </div>

        {isRecurring && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start date</label>
              <input type="date" className="w-full border rounded px-2 py-1"
                value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End date (optional)</label>
              <input type="date" className="w-full border rounded px-2 py-1"
                value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Days of week</label>
              <div className="flex flex-wrap gap-2 text-sm">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d, idx) => (
                  <label key={d} className={`px-2 py-1 rounded border cursor-pointer ${daysOfWeek.includes(idx) ? 'bg-green-50 border-green-500 text-green-700' : ''}`}>
                    <input type="checkbox" className="mr-1"
                      checked={daysOfWeek.includes(idx)}
                      onChange={(e) => setDaysOfWeek(prev => e.target.checked ? [...prev, idx] : prev.filter(v => v !== idx))} />
                    {d}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <MultiDateSelector
                label="Include dates"
                helperText="Pick one or more specific dates to include."
                values={includeDates}
                onChange={setIncludeDates}
              />
            </div>
            <div>
              <MultiDateSelector
                label="Exclude dates"
                helperText="Pick dates to skip deliveries."
                values={excludeDates}
                onChange={setExcludeDates}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Notes (optional)</label>
              <textarea className="w-full border rounded px-2 py-1" rows={3}
                value={recurrenceNotes} onChange={(e) => setRecurrenceNotes(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <button type="button" className="text-xs underline" onClick={() => {
                // compute a quick client-side preview using same logic as API
                try {
                  const now = new Date();
                  const start = startDate ? new Date(startDate) : now;
                  const includes = (includeDates || []).map(d => new Date(d));
                  const excludesKey = new Set((excludeDates || []).map(d => new Date(d).toDateString()));
                  const candidates: Date[] = [];
                  for (const d of includes) {
                    if (d >= start && !excludesKey.has(d.toDateString())) candidates.push(d);
                  }
                  if (!candidates.length && (daysOfWeek || []).length) {
                    for (let i = 0; i < 28; i++) {
                      const d = new Date(start);
                      d.setDate(d.getDate() + i);
                      if ((daysOfWeek || []).includes(d.getDay()) && !excludesKey.has(d.toDateString())) { candidates.push(d); break; }
                    }
                  }
                  const next = candidates.sort((a,b)=>+a-+b)[0];
                  setNextPreview(next ? next.toISOString() : null);
                } catch { setNextPreview(null); }
              }}>Preview next delivery date</button>
              {nextPreview && (
                <div className="text-xs text-gray-600">Next delivery preview: <span className="font-medium">{new Date(nextPreview).toLocaleDateString()}</span></div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delivery address */}
      <div className="bg-white border rounded p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-700">Delivery address</h2>
            <p className="text-xs text-gray-500">Use account address or enter a different shipping address.</p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={useAccountAddress} onChange={(e)=>setUseAccountAddress(e.target.checked)} />
            Use account address
          </label>
        </div>
        {!useAccountAddress && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Recipient name</label>
              <input type="text" className="w-full border rounded px-2 py-1" value={shipName} onChange={e=>setShipName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Phone</label>
              <input type="text" className="w-full border rounded px-2 py-1" value={shipPhone} onChange={e=>setShipPhone(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Street</label>
              <input type="text" className="w-full border rounded px-2 py-1" value={shipStreet} onChange={e=>setShipStreet(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">City</label>
              <input type="text" className="w-full border rounded px-2 py-1" value={shipCity} onChange={e=>setShipCity(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">State</label>
              <input type="text" className="w-full border rounded px-2 py-1" value={shipState} onChange={e=>setShipState(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Postal Code</label>
              <input type="text" className="w-full border rounded px-2 py-1" value={shipZip} onChange={e=>setShipZip(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Country</label>
              <input type="text" className="w-full border rounded px-2 py-1" value={shipCountry} onChange={e=>setShipCountry(e.target.value)} />
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-red-600">{error}</p>}
  <button onClick={placeOrder} disabled={submitting || (!useAccountAddress && (!shipName || !shipStreet || !shipCity || !shipZip))} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">
        {submitting ? "Placing..." : "Place Order"}
      </button>
    </div>
  );
}
