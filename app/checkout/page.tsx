"use client";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { Product } from '@/models/product';
import { Image } from '@/models/image';
import type { Bag } from '@/models/Bag';
import { useRouter, useSearchParams } from "next/navigation";
import { MultiDateSelector } from "@/components/ui/multi-date";
import { useBag } from "@/contexts/BagContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function CheckoutPage() {
  const params = useSearchParams();
  const bagId = params.get("bagId");
  const quickSku = params.get("quickSku");
  const quickQty = Number(params.get("qty") || '1');
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
  // Transient preview bag for quick-order flow
  type PreviewItem = { product: { id: string; name: string; price: number; unit?: string; images?: Array<Partial<Image>> }, quantity: number };
  type EffectiveItem = { product: { id: string; name: string; price: number; unit?: string; images?: Array<Partial<Image>> }, quantity: number };
  const [previewBag, setPreviewBag] = useState<null | { id: string; name?: string; items: PreviewItem[] }>(null);

  // When user info loads/changes, default to their account address
  useEffect(() => {
    if (user?.registrationAddress) {
      setUseAccountAddress(true);
      setShipName(user.registrationAddress.recipientName || `${user.firstName || ''}`.trim());
      setShipPhone(user.registrationAddress.phoneNumber || user.phoneNumber || '');
    }
  }, [user]);

  // If quickSku is present and there's no bag, fetch product and set preview
  useEffect(() => {
    let mounted = true;
    async function loadQuick() {
      if (!quickSku) return;
      if (bag && bag.items && bag.items.length > 0) return; // prefer real bag
      try {
        const absolute = `/api/products/${encodeURIComponent(quickSku)}`;
        const resp = await fetch(absolute);
        if (!resp.ok) return;
    const data = await resp.json();
    const p: Product | null = data.data || null;
        if (!p) return;
        if (!mounted) return;
        const item: PreviewItem = {
          product: {
      id: p.sku || String((p as unknown as { _id?: string })._id || ''),
            name: p.name || 'Product',
            price: Number(p.pricePerBaseQuantity ?? 0),
            unit: p.measurementUnit || 'ea',
      images: p.image ? [{ url: (p.image as unknown as Partial<Image>).url || (p.image as unknown as Partial<Image>).path || '', alt: (p.image as unknown as Partial<Image>).alt || p.name }] : [],
          },
          quantity: Number.isFinite(quickQty) && quickQty > 0 ? quickQty : 1,
        };
        setPreviewBag({ id: `preview-${item.product.id}`, name: p.name || 'Quick order', items: [item] });
      } catch {
        // ignore fetching errors
      }
    }
    loadQuick();
    return () => { mounted = false; };
  }, [quickSku, quickQty, bag]);

  // Build a normalized list of items for rendering/ordering without using 'any'
  const effectiveItems: EffectiveItem[] = useMemo(() => {
    if (bag && bag.items && bag.items.length > 0) {
      return bag.items.map((it: Bag['items'][number]) => ({
        product: {
          id: it.product.id,
          name: it.product.name,
          price: Number(it.product.price || 0),
          unit: it.product.unit || undefined,
          images: it.product.images || [],
        },
        quantity: it.quantity,
      }));
    }
    if (previewBag) return previewBag.items.map((i) => ({ product: i.product, quantity: i.quantity }));
    return [];
  }, [bag, previewBag]);

  const effectiveBagId = bag?.id || previewBag?.id;
  const effectiveBagName = bag?.name || previewBag?.name;
  const hasEffectiveBag = Boolean(effectiveItems.length > 0);

  const total = useMemo(() => (
    effectiveItems.reduce((sum, it) => sum + (Number(it.product.price || 0) * it.quantity), 0)
  ), [effectiveItems]);
  const itemCount = useMemo(() => (
    effectiveItems.reduce((sum, it) => sum + it.quantity, 0)
  ), [effectiveItems]);

  const placeOrder = async () => {
  if (effectiveItems.length === 0 || !user) {
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
    items: effectiveItems.map(it => ({ productId: it.product.id, quantity: it.quantity })),
      paymentMethod: "cash_on_delivery",
      bagId: effectiveBagId || undefined,
      bagName: effectiveBagName || undefined,
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

  if (!hasEffectiveBag) {
    return <div className="max-w-3xl mx-auto p-6">No bag selected.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">Checkout</h1>
      {effectiveBagName && (
        <p className="text-gray-600 mt-1">Bag: <span className="font-medium">{effectiveBagName}</span>{typeof itemCount === 'number' && itemCount > 0 ? ` • ${itemCount} item${itemCount > 1 ? 's' : ''}` : ''}</p>
      )}
          </div>

          <Card className="shadow-lg">
            <CardContent>
              {bag?.name && (
                <div className="pb-2 mb-4 border-b">
                  <h2 className="text-sm font-medium text-gray-700">Items in {bag.name}</h2>
                </div>
              )}
              <div className="space-y-3">
                {effectiveItems.map((it, idx) => (
                  <div key={`${effectiveBagId || 'bag'}-${it.product.id}-${idx}`} className="flex items-center justify-between text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">Img</div>
                      <div>
                        <div className="font-medium">{it.product.name}</div>
                        <div className="text-xs text-gray-500">Qty: {it.quantity}</div>
                      </div>
                    </div>
                    <div className="font-semibold">Rs. {(Number(it.product.price || 0) * it.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-4 border-t mt-4 font-semibold text-lg">
                <span>Total</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recurring schedule */}
          <Card className="shadow">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium text-gray-700">Recurring order</h2>
                  <p className="text-xs text-gray-500">Schedule recurring deliveries with flexible rules.</p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
                  Enable
                </label>
              </div>

              {isRecurring && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start date</label>
                    <Input type="date" value={startDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)} className="w-full" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End date (optional)</label>
                    <Input type="date" value={endDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)} className="w-full" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Days of week</label>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d, idx) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDaysOfWeek(prev => prev.includes(idx) ? prev.filter(v=>v!==idx) : [...prev, idx])}
                          className={`px-3 py-1 rounded-full border transition-colors text-sm ${daysOfWeek.includes(idx) ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-700'}`}>
                          {d}
                        </button>
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
                    <textarea className="w-full border rounded px-3 py-2 text-sm" rows={3}
                      value={recurrenceNotes} onChange={(e) => setRecurrenceNotes(e.target.value)} />
                  </div>

                  <div className="md:col-span-2">
                    <button type="button" className="text-xs underline" onClick={() => {
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
                      <div className="text-xs text-gray-600 mt-2">Next delivery preview: <span className="font-medium">{new Date(nextPreview).toLocaleDateString()}</span></div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery address */}
          <Card className="shadow">
            <CardContent>
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
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Recipient name</label>
                    <Input type="text" value={shipName} onChange={(e: ChangeEvent<HTMLInputElement>)=>setShipName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Phone</label>
                    <Input type="text" value={shipPhone} onChange={(e: ChangeEvent<HTMLInputElement>)=>setShipPhone(e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Street</label>
                    <Input type="text" value={shipStreet} onChange={(e: ChangeEvent<HTMLInputElement>)=>setShipStreet(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">City</label>
                    <Input type="text" value={shipCity} onChange={(e: ChangeEvent<HTMLInputElement>)=>setShipCity(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">State</label>
                    <Input type="text" value={shipState} onChange={(e: ChangeEvent<HTMLInputElement>)=>setShipState(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Postal Code</label>
                    <Input type="text" value={shipZip} onChange={(e: ChangeEvent<HTMLInputElement>)=>setShipZip(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Country</label>
                    <Input type="text" value={shipCountry} onChange={(e: ChangeEvent<HTMLInputElement>)=>setShipCountry(e.target.value)} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {error && <p className="text-red-600">{error}</p>}
        </div>

        {/* Right summary column */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <Card className="shadow-lg">
              <CardContent>
                <h3 className="text-lg font-medium mb-2">Order Summary</h3>
                <div className="space-y-2 mb-4">
                  {effectiveItems.map((it, idx) => (
                    <div key={`sum-${idx}`} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{it.product.name} x {it.quantity}</span>
                      <span className="font-medium">Rs. {(Number(it.product.price || 0) * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center border-t pt-3 mb-4">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="text-lg font-semibold">Rs. {total.toFixed(2)}</span>
                </div>

                <Button variant="ghost" onClick={placeOrder} disabled={submitting || (!useAccountAddress && (!shipName || !shipStreet || !shipCity || !shipZip))} className="w-full">
                  {submitting ? "Placing..." : "Pay on delivery"}
                </Button>
              </CardContent>
            </Card>
            <div className="text-xs text-gray-500 mt-3">
              By placing an order you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
