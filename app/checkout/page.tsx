"use client";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { Product } from '@/models/product';
import { Image as ImageModel } from '@/models/image';
import type { Bag } from '@/models/Bag';
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { MultiDateSelector } from "@/components/ui/multi-date";
import { useBag } from "@/contexts/BagContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import { RRule, Frequency } from 'rrule';

import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import { ArrowLeft, MapPin, CreditCard, Calendar, Truck, ShoppingBasket, ArrowRight } from "lucide-react";

// ... other imports

export default function CheckoutPage() {
  const params = useSearchParams();
  const bagId = params.get("bagId");
  const quickSku = params.get("quickSku");
  const quickQty = Number(params.get("qty") || '1');
  const { bags, currentBag, removeFromBag, updateBagItem } = useBag();
  const { user } = useAuth(); // Restore usage

  const bag = useMemo(() => {
    if (bagId) return bags.find(b => b.id === bagId) || null;
    return currentBag;
  }, [bags, bagId, currentBag]);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recurring State
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFreq, setRecurrenceFreq] = useState<Frequency>(RRule.WEEKLY);
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(1);
  const [recurrenceByWeekday, setRecurrenceByWeekday] = useState<number[]>([]);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Legacy / Hybrid UI state
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
  type PreviewItem = { product: { id: string; name: string; price: number; unit?: string; images?: Array<Partial<ImageModel>> }, quantity: number };
  type EffectiveItem = { product: { id: string; name: string; price: number; unit?: string; images?: Array<Partial<ImageModel>> }, quantity: number };
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
      // if (bag && bag.items && bag.items.length > 0) return; // REMOVED: Allow quick order even if bag exists
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
            images: p.image ? [{ url: (p.image as unknown as Partial<ImageModel>).url || (p.image as unknown as Partial<ImageModel>).path || '', alt: (p.image as unknown as Partial<ImageModel>).alt || p.name }] : [],
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
  }, [quickSku, quickQty]); // Removed 'bag' dependency to avoid re-triggering loop if bag changes

  // Build a normalized list of items for rendering/ordering without using 'any'
  const effectiveItems: EffectiveItem[] = useMemo(() => {
    // Priority: Preview Bag (Quick Order) > Current Bag
    if (previewBag) return previewBag.items.map((i) => ({ product: i.product, quantity: i.quantity }));

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
    return [];
  }, [bag, previewBag]);

  // If using preview bag, do NOT associate with the existing bag ID to avoid overwriting/mixing
  const effectiveBagId = previewBag ? undefined : bag?.id;
  const effectiveBagName = previewBag?.name || bag?.name;
  const hasEffectiveBag = Boolean(effectiveItems.length > 0);

  const subtotal = useMemo(() => (
    effectiveItems.reduce((sum, it) => sum + (Number(it.product.price || 0) * it.quantity), 0)
  ), [effectiveItems]);
  const itemCount = useMemo(() => (
    effectiveItems.reduce((sum, it) => sum + it.quantity, 0)
  ), [effectiveItems]);

  const handleCheckout = async () => {
    if (effectiveItems.length === 0 || !user) {
      setError("Missing bag or user");
      return;
    }
    try {
      setLoading(true);
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
            // New RRULE Logic
            rruleString: (() => {
              try {
                const rule = new RRule({
                  freq: recurrenceFreq,
                  interval: recurrenceInterval,
                  byweekday: recurrenceFreq === RRule.WEEKLY ? recurrenceByWeekday : undefined,
                  dtstart: new Date(startDate || new Date()),
                  until: endDate ? new Date(endDate) : undefined,
                });
                return rule.toString();
              } catch (e) { return undefined; }
            })(),
            startDate: startDate || undefined, // Keep redundant for legacy/easy reading
            endDate: endDate || undefined,
            daysOfWeek: recurrenceFreq === RRule.WEEKLY ? recurrenceByWeekday.map(d => (d + 1) % 7) : undefined,
            // Note: RRule 0=Mo, 1=Tu... 6=Su.  Legacy app used 0=Sun. 
            // RRule.MO.weekday=0. If Monday(0) is selected, Legacy expected 1.
            // If Sunday(6) is selected. Legacy expected 0.
            // Map: (RRuleDay + 1) % 7 ?  
            // Mo(0) -> 1 (Mon). Tu(1) -> 2. ... Sa(5) -> 6. Su(6) -> 0. Correct.

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
      setLoading(false);
    }
  };

  if (!hasEffectiveBag) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Your bag is empty</h2>
        <p className="text-gray-500 mt-2 max-w-sm">Looks like you haven't added anything to your bag yet.</p>
        <Link href="/" className="mt-6 px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <PremiumPageHeader
        title="Secure Checkout"
        subtitle="Complete your order and get fresh groceries delivered to your door."
        backgroundImage="https://images.unsplash.com/photo-1580913428706-c811d671c2d8?q=80&w=2670&auto=format&fit=crop"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <Link href="/products" className="inline-flex items-center text-sm font-medium text-white/90 hover:text-white transition-colors bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 hover:bg-black/30">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-12">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">

            {/* Order Items */}
            <Card className="shadow-premium border-none ring-1 ring-black/5 overflow-hidden">
              <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  Order Items
                </h2>
                {effectiveBagName && !previewBag && <span className="text-sm text-gray-500 font-medium">{effectiveBagName}</span>}
                {previewBag && <span className="text-sm text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">Quick Order</span>}
              </div>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {effectiveItems.map((it, idx) => (
                    <div key={`${effectiveBagId || 'bag'}-${it.product.id}-${idx}`} className="flex gap-4 group">
                      <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shadow-sm flex-shrink-0 relative group-hover:ring-2 group-hover:ring-primary/20 transition-all">
                        {it.product.images?.[0]?.url ? (
                          <img src={it.product.images[0].url} alt={it.product.images[0].alt || it.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">{it.product.name}</h3>
                          <button
                            onClick={() => {
                              if (previewBag) {
                                setPreviewBag(null);
                                // Optional: clear query param?
                              } else if (bag) {
                                removeFromBag(bag.id, it.product.id);
                              }
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Remove item"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg bg-white h-8">
                            <button
                              type="button"
                              className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors rounded-l-lg disabled:opacity-50"
                              disabled={it.quantity <= 1}
                              onClick={() => {
                                const newQty = it.quantity - 1;
                                if (previewBag) {
                                  setPreviewBag(prev => prev ? {
                                    ...prev,
                                    items: prev.items.map(pi => pi.product.id === it.product.id ? { ...pi, quantity: newQty } : pi)
                                  } : null);
                                } else if (bag) {
                                  updateBagItem(bag.id, it.product.id, newQty);
                                }
                              }}
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                            </button>
                            <input
                              type="number"
                              className="w-10 text-center text-sm font-medium text-gray-900 border-none p-0 focus:ring-0 appearance-none bg-transparent"
                              value={it.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val > 0) {
                                  if (previewBag) {
                                    setPreviewBag(prev => prev ? {
                                      ...prev,
                                      items: prev.items.map(pi => pi.product.id === it.product.id ? { ...pi, quantity: val } : pi)
                                    } : null);
                                  } else if (bag) {
                                    updateBagItem(bag.id, it.product.id, val);
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors rounded-r-lg"
                              onClick={() => {
                                const newQty = it.quantity + 1;
                                if (previewBag) {
                                  setPreviewBag(prev => prev ? {
                                    ...prev,
                                    items: prev.items.map(pi => pi.product.id === it.product.id ? { ...pi, quantity: newQty } : pi)
                                  } : null);
                                } else if (bag) {
                                  updateBagItem(bag.id, it.product.id, newQty);
                                }
                              }}
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                          </div>
                          <div className="font-semibold text-gray-900">Rs. {(Number(it.product.price || 0) * it.quantity).toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-dashed border-gray-200">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-medium text-gray-600">Subtotal</span>
                    <span className="text-xl font-bold text-gray-900">Rs. {subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recurring schedule */}
            <Card className={`shadow-premium border-none ring-1 ring-black/5 transition-all duration-300 ${isRecurring ? 'bg-white' : 'bg-gray-50/50'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Recurring Order
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Subscribe and save yourself the hassle of reordering.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${isRecurring ? 'text-primary' : 'text-gray-500'}`}>{isRecurring ? 'Enabled' : 'Disabled'}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="sr-only peer" />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <div className={`grid transition-all duration-300 ease-in-out ${isRecurring ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-50 select-none grayscale'}`}>
                  <div className="overflow-hidden">
                    <div className="space-y-8 pt-2">
                      {/* Dates */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                            className="bg-white border-gray-200 focus:border-primary focus:ring-primary h-11"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">End Date <span className="text-gray-400 font-normal">(Optional)</span></label>
                          <Input
                            type="date"
                            value={endDate}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                            className="bg-white border-gray-200 focus:border-primary focus:ring-primary h-11"
                          />
                        </div>
                      </div>

                      {/* Frequency */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Delivery Frequency</label>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { label: 'Weekly', val: RRule.WEEKLY, sub: 'Best for groceries' },
                            { label: 'Monthly', val: RRule.MONTHLY, sub: 'Best for staples' },
                            { label: 'Daily', val: RRule.DAILY, sub: 'For high usage' }
                          ].map(opt => (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() => setRecurrenceFreq(opt.val)}
                              className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${recurrenceFreq === opt.val
                                ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'}`}
                            >
                              <span className="font-semibold">{opt.label}</span>
                              <span className={`text-xs mt-1 ${recurrenceFreq === opt.val ? 'text-primary/70' : 'text-gray-400'}`}>{opt.sub}</span>
                              {recurrenceFreq === opt.val && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Interval */}
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Repeat every:</label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            min={1}
                            value={recurrenceInterval}
                            onChange={(e) => setRecurrenceInterval(Number(e.target.value))}
                            className="w-24 text-center h-10 bg-white"
                          />
                          <span className="text-sm text-gray-600 font-medium">
                            {recurrenceFreq === RRule.WEEKLY ? 'Week(s)' : recurrenceFreq === RRule.MONTHLY ? 'Month(s)' : 'Day(s)'}
                          </span>
                        </div>
                      </div>

                      {/* Frequency Specific Options */}
                      {recurrenceFreq === RRule.WEEKLY && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Deliver on these days</label>
                          <div className="flex flex-wrap gap-3">
                            {[
                              { l: 'Mon', v: RRule.MO },
                              { l: 'Tue', v: RRule.TU },
                              { l: 'Wed', v: RRule.WE },
                              { l: 'Thu', v: RRule.TH },
                              { l: 'Fri', v: RRule.FR },
                              { l: 'Sat', v: RRule.SA },
                              { l: 'Sun', v: RRule.SU },
                            ].map((d) => (
                              <button
                                key={d.l}
                                type="button"
                                onClick={() => {
                                  // types/rrule outdated
                                  const val = (d.v as any).weekday;
                                  const isSelected = recurrenceByWeekday.some(w => w === val);
                                  if (isSelected) {
                                    setRecurrenceByWeekday(prev => prev.filter(w => w !== val));
                                  } else {
                                    setRecurrenceByWeekday(prev => [...prev, val]);
                                  }
                                }}
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all ${recurrenceByWeekday.includes((d.v as any).weekday)
                                  ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105'
                                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                              >
                                {d.l}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <div>
                          <MultiDateSelector
                            label="Extra Include Dates"
                            helperText="Add specific dates for extra one-off deliveries"
                            values={includeDates}
                            onChange={setIncludeDates}
                          />
                        </div>
                        <div>
                          <MultiDateSelector
                            label="Exclude Dates"
                            helperText="Skip specific dates (holidays, vacation)"
                            values={excludeDates}
                            onChange={setExcludeDates}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                        <textarea
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-sm"
                          rows={3}
                          placeholder="Any special instructions for the recurring schedule?"
                          value={recurrenceNotes}
                          onChange={(e) => setRecurrenceNotes(e.target.value)}
                        />
                      </div>

                      {/* Preview Box */}
                      <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                            onClick={() => {
                              try {
                                const rule = new RRule({
                                  freq: recurrenceFreq,
                                  interval: recurrenceInterval,
                                  byweekday: recurrenceFreq === RRule.WEEKLY ? recurrenceByWeekday.map(d => d) : undefined,
                                  dtstart: new Date(startDate || new Date()),
                                  until: endDate ? new Date(endDate) : undefined,
                                });
                                const next = rule.after(new Date());
                                setNextPreview(next ? next.toISOString() : 'No upcoming date found');
                              } catch (e) { console.error(e); setNextPreview('Check configuration'); }
                            }}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Refresh Preview
                          </button>
                          {nextPreview && (
                            <div className="text-sm">
                              Next delivery expected: <span className="font-bold text-gray-900">{nextPreview.includes('-') ? new Date(nextPreview).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : nextPreview}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery address */}
            <Card className="shadow-premium border-none ring-1 ring-black/5 overflow-hidden transition-all duration-300 hover:shadow-premium-lg">
              <div className="bg-white px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    Delivery Address
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Where should we secure-ship your order?</p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm bg-gray-50 px-4 py-2 rounded-full border border-gray-200 cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all duration-300">
                  <input type="checkbox" checked={useAccountAddress} onChange={(e) => setUseAccountAddress(e.target.checked)} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="font-medium">Use account address</span>
                </label>
              </div>

              <CardContent className="p-8">

                {!useAccountAddress && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Recipient Name</label>
                      <Input
                        type="text"
                        value={shipName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setShipName(e.target.value)}
                        className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all rounded-xl"
                        placeholder="e.g. John Doe"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                      <Input
                        type="text"
                        value={shipPhone}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setShipPhone(e.target.value)}
                        className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all rounded-xl"
                        placeholder="+94 77 123 4567"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Street Address</label>
                      <Input
                        type="text"
                        value={shipStreet}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setShipStreet(e.target.value)}
                        className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all rounded-xl"
                        placeholder="123 Main St, Apt 4B"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">City</label>
                      <Input
                        type="text"
                        value={shipCity}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setShipCity(e.target.value)}
                        className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">State / Province</label>
                      <Input
                        type="text"
                        value={shipState}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setShipState(e.target.value)}
                        className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Postal Code</label>
                      <Input
                        type="text"
                        value={shipZip}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setShipZip(e.target.value)}
                        className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Country</label>
                      <Input
                        type="text"
                        value={shipCountry}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setShipCountry(e.target.value)}
                        className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all rounded-xl"
                      />
                    </div>
                  </div>
                )}
                {useAccountAddress && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-lg flex gap-4 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                      <p className="font-medium text-gray-900">Using Registered Address</p>
                      <p className="mt-1">{user?.registrationAddress?.recipientName || user?.firstName}</p>
                      <p>{user?.registrationAddress?.streetAddress} {user?.registrationAddress?.city}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-red-700 animate-fade-up">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="font-medium">{error}</p>
              </div>
            )}
          </div>
          {/* Order Summary Column */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <Card className="shadow-premium border-none ring-1 ring-black/5 overflow-hidden">
                <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Order Summary
                  </h2>
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                    {itemCount} Items
                  </span>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {effectiveItems.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">Your bag is empty.</p>
                    ) : (
                      effectiveItems.map((item, index) => (
                        <div key={`${item.product.id}-${index}`} className="flex gap-4 group">
                          <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 relative overflow-hidden border border-gray-100">
                            {item.product.images && item.product.images.length > 0 ? (
                              <Image
                                src={item.product.images[0].url}
                                alt={item.product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ShoppingBasket className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.product.name}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                              <p className="text-sm font-semibold text-emerald-700">Rs. {(item.product.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-gray-100 mt-6 pt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium text-gray-900">Rs. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="font-medium text-emerald-600">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tax</span>
                      <span className="font-medium text-gray-900">Rs. 0.00</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 mt-6 pt-6">
                    <div className="flex justify-between items-end mb-6">
                      <span className="text-base font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-gray-900">Rs. {subtotal.toFixed(2)}</span>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      disabled={loading || effectiveItems.length === 0}
                      className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-900/10 hover:shadow-emerald-900/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? "Processing..." : (
                        <>
                          Confirm Order
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </Button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                      <Truck className="w-3 h-3" />
                      <span>Free delivery on orders over Rs. 5000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  By placing an order you agree to our <Link href="/terms" className="underline hover:text-gray-800">Terms</Link> and <Link href="/privacy" className="underline hover:text-gray-800">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
