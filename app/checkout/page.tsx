"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarClock, ChevronRight, ImageIcon, LockKeyhole, MapPin, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Frequency, RRule } from "rrule";
import type { Bag } from "@/models/Bag";
import type { Product } from "@/models/product";
import type { Image } from "@/models/image";
import { useBag } from "@/contexts/BagContext";
import { useAuth } from "@/contexts/AuthContext";
import { MultiDateSelector } from "@/components/ui/multi-date";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api/client";
import { WHATSAPP_NUMBER } from "@/lib/config/site";

type CheckoutItem = {
  product: {
    id: string;
    name: string;
    price: number;
    unit?: string;
    images?: Array<Partial<Image>>;
  };
  quantity: number;
};

type PreviewBag = {
  id: string;
  name?: string;
  items: CheckoutItem[];
};

type SelectedSubscriptionPlan = {
  id: string;
  name: string;
  slug: string;
  frequency: "weekly" | "biweekly" | "monthly";
};

const WEEKDAYS = [
  { label: "Mon", value: 0 },
  { label: "Tue", value: 1 },
  { label: "Wed", value: 2 },
  { label: "Thu", value: 3 },
  { label: "Fri", value: 4 },
  { label: "Sat", value: 5 },
  { label: "Sun", value: 6 },
];

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-zinc-50">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-700" />
      <p className="text-sm text-zinc-500">{message}</p>
    </div>
  );
}

export default function CheckoutPage() {
  const params = useSearchParams();
  const router = useRouter();
  const bagId = params.get("bagId");
  const quickSku = params.get("quickSku");
  const planSlug = params.get("plan");
  const quickQty = Number(params.get("qty") || "1");

  const {
    bags,
    currentBag,
    loading: bagsLoading,
    updating: bagUpdating,
    removeFromBag,
    updateBagItem,
  } = useBag();
  const { user, loading: authLoading } = useAuth();

  const bag = useMemo(() => {
    if (bagId) return bags.find((candidate) => candidate.id === bagId) || null;
    return currentBag;
  }, [bags, bagId, currentBag]);

  const [previewBag, setPreviewBag] = useState<PreviewBag | null>(null);
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState<SelectedSubscriptionPlan | null>(null);
  const [previewLoading, setPreviewLoading] = useState(Boolean(planSlug || quickSku));
  const [submitting, setSubmitting] = useState(false);
  const [orderingViaWhatsapp, setOrderingViaWhatsapp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isRecurring, setIsRecurring] = useState(Boolean(planSlug));
  const [recurrenceFreq, setRecurrenceFreq] = useState<Frequency>(RRule.WEEKLY);
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceByWeekday, setRecurrenceByWeekday] = useState<number[]>([5]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeDates, setIncludeDates] = useState<string[]>([]);
  const [excludeDates, setExcludeDates] = useState<string[]>([]);
  const [recurrenceNotes, setRecurrenceNotes] = useState("");

  const [useAccountAddress, setUseAccountAddress] = useState(Boolean(user?.registrationAddress));
  const [shipName, setShipName] = useState(user?.registrationAddress?.recipientName || user?.firstName || "");
  const [shipPhone, setShipPhone] = useState(user?.registrationAddress?.phoneNumber || user?.phoneNumber || "");
  const [shipStreet, setShipStreet] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipState, setShipState] = useState("");
  const [shipZip, setShipZip] = useState("");
  const [shipCountry, setShipCountry] = useState("LK");

  useEffect(() => {
    if (user?.registrationAddress) {
      setUseAccountAddress(true);
      setShipName(user.registrationAddress.recipientName || user.firstName || "");
      setShipPhone(user.registrationAddress.phoneNumber || user.phoneNumber || "");
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.replace(`/auth/login?callbackUrl=${returnUrl}`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!planSlug) return;

    let cancelled = false;
    setPreviewLoading(true);

    apiFetch("/api/subscription-plans")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unable to load subscription plans")))
      .then((data) => {
        if (cancelled) return;
        const plan = Array.isArray(data?.plans)
          ? data.plans.find((candidate: { slug?: string }) => candidate.slug === planSlug)
          : null;

        if (!plan?._id) {
          setError("This subscription plan is no longer active.");
          setPreviewBag(null);
          return;
        }

        const frequency = plan.frequency === "monthly"
          ? "monthly"
          : plan.frequency === "biweekly"
            ? "biweekly"
            : "weekly";

        setSelectedSubscriptionPlan({
          id: plan._id,
          name: plan.name,
          slug: plan.slug,
          frequency,
        });
        setPreviewBag({
          id: `plan-${plan._id}`,
          name: plan.name,
          items: [{
            product: {
              id: plan._id,
              name: plan.name,
              price: Number(plan.price || 0),
              unit: "plan",
              images: [{
                url: plan.image || "/images/subscription-default.jpg",
                alt: plan.name,
              }],
            },
            quantity: 1,
          }],
        });
        setIsRecurring(true);
        setRecurrenceFreq(frequency === "monthly" ? RRule.MONTHLY : RRule.WEEKLY);
        setRecurrenceInterval(frequency === "biweekly" ? 2 : 1);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load this plan.");
          setPreviewBag(null);
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => { cancelled = true; };
  }, [planSlug]);

  useEffect(() => {
    if (!quickSku || planSlug) return;

    let cancelled = false;
    setPreviewLoading(true);

    apiFetch(`/api/storefront/products/${encodeURIComponent(quickSku)}`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Product is unavailable")))
      .then((product: Product) => {
        if (cancelled) return;
        const image = product.image as unknown as Partial<Image> | undefined;
        const productId = product.sku || String((product as unknown as { _id?: string; id?: string })._id || (product as unknown as { id?: string }).id || "");
        if (!productId) throw new Error("Product is unavailable");

        setPreviewBag({
          id: `preview-${productId}`,
          name: product.name || "Quick order",
          items: [{
            product: {
              id: productId,
              name: product.name || "Product",
              price: Number(product.pricePerBaseQuantity || 0),
              unit: product.measurementUnit || "ea",
              images: image?.url || image?.path
                ? [{ url: image.url || image.path || "", alt: image.alt || product.name }]
                : [],
            },
            quantity: Number.isFinite(quickQty) && quickQty > 0 ? quickQty : 1,
          }],
        });
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load this product.");
          setPreviewBag(null);
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => { cancelled = true; };
  }, [quickSku, quickQty, planSlug]);

  const effectiveItems: CheckoutItem[] = useMemo(() => {
    if (previewBag) return previewBag.items;
    if (!bag?.items?.length) return [];

    return bag.items.map((item: Bag["items"][number]) => ({
      product: {
        id: item.product.id,
        name: item.product.name,
        price: Number(item.product.price || 0),
        unit: item.product.unit || undefined,
        images: item.product.images || [],
      },
      quantity: item.quantity,
    }));
  }, [bag, previewBag]);

  const effectiveBagId = previewBag ? undefined : bag?.id;
  const effectiveBagName = previewBag?.name || bag?.name;
  const total = useMemo(
    () => effectiveItems.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0),
    [effectiveItems],
  );
  const itemCount = useMemo(
    () => effectiveItems.reduce((sum, item) => sum + item.quantity, 0),
    [effectiveItems],
  );

  const customAddressComplete = Boolean(shipName && shipPhone && shipStreet && shipCity && shipZip);
  const canPlaceOrder = effectiveItems.length > 0 && (useAccountAddress ? Boolean(user?.registrationAddress) : customAddressComplete);

  const buildRecurrence = () => {
    if (!isRecurring) return undefined;

    const rule = new RRule({
      freq: recurrenceFreq,
      interval: Math.max(1, recurrenceInterval),
      byweekday: recurrenceFreq === RRule.WEEKLY ? recurrenceByWeekday : undefined,
      dtstart: startDate ? new Date(startDate) : new Date(),
      until: endDate ? new Date(endDate) : undefined,
    });

    return {
      rruleString: rule.toString(),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      daysOfWeek: recurrenceFreq === RRule.WEEKLY
        ? recurrenceByWeekday.map((day) => (day + 1) % 7)
        : undefined,
      includeDates,
      excludeDates,
      notes: recurrenceNotes || undefined,
    };
  };

  const placeOrder = async (isWhatsapp = false) => {
    if (!user || effectiveItems.length === 0) {
      setError("Your order is not ready yet.");
      return;
    }
    if (!canPlaceOrder) {
      setError("Please complete the delivery address before placing your order.");
      return;
    }
    if (isWhatsapp && !WHATSAPP_NUMBER) {
      setError("WhatsApp ordering is not configured right now. Please place the order normally.");
      return;
    }

    setSubmitting(true);
    setOrderingViaWhatsapp(isWhatsapp);
    setError(null);

    try {
      if (planSlug) {
        if (!selectedSubscriptionPlan) throw new Error("This subscription plan is not available.");
        const slotIndex = recurrenceByWeekday[0];
        const slotDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        const day = slotIndex === undefined ? undefined : slotDays[slotIndex];
        if (!day) throw new Error("Please choose a delivery day.");

        const deliveryAddress = useAccountAddress
          ? user.registrationAddress
          : {
              name: shipName,
              street: shipStreet,
              city: shipCity,
              state: shipState,
              zipCode: shipZip,
              country: shipCountry,
              phone: shipPhone,
            };

        const response = await apiFetch("/api/subscriptions", {
          method: "POST",
          body: JSON.stringify({
            planId: selectedSubscriptionPlan.id,
            deliveryAddress,
            deliverySlot: { day, timeSlot: "Any time" },
            paymentMethod: "cod",
            startDate: startDate || undefined,
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Subscription could not be created");
        }

        router.replace("/profile/subscriptions");
        return;
      }

      const response = await apiFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          userId: user._id,
          items: effectiveItems.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
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
          recurrence: buildRecurrence(),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Order failed");

      const orderId = data.data?._id || data.data?.id;
      const orderNo = data.data?.orderNumber || orderId?.slice(-6) || "New";

      if (isWhatsapp) {
        const itemsList = effectiveItems
          .map((item) => `- ${item.product.name} (${item.product.unit || "ea"}): ${item.quantity}`)
          .join("\n");
        const deliveryTo = useAccountAddress
          ? `${user.registrationAddress?.recipientName || user.firstName}\n${user.registrationAddress?.phoneNumber || user.phoneNumber}\n${user.registrationAddress?.streetAddress || ""}\n${user.registrationAddress?.city || ""}`
          : `${shipName}\n${shipPhone}\n${shipStreet}\n${shipCity}, ${shipState} ${shipZip}`;
        const message = `Hi FreshPick! I'd like to confirm order #${orderNo}.\n\nItems:\n${itemsList}\n\nItems total: Rs. ${total.toFixed(2)}\n\nDeliver to:\n${deliveryTo}`;
        window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        return;
      }

      router.replace(orderId ? `/orders/${orderId}` : "/orders");
    } catch (placeOrderError) {
      setError(placeOrderError instanceof Error ? placeOrderError.message : "Unable to place the order.");
      setOrderingViaWhatsapp(false);
    } finally {
      if (!isWhatsapp) setSubmitting(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return <LoadingState message={!user && !authLoading ? "Redirecting to sign in…" : "Checking your account…"} />;
  }

  if (previewLoading || (!previewBag && !quickSku && !planSlug && bagsLoading)) {
    return <LoadingState message={planSlug ? "Loading the current subscription plan…" : "Loading your bag…"} />;
  }

  if (effectiveItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-zinc-50 p-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-zinc-400 shadow-sm">
          <ShoppingBag className="h-7 w-7" />
        </span>
        <h2 className="mt-5 font-serif text-3xl text-zinc-950">Nothing to check out yet.</h2>
        <p className="mt-2 max-w-md text-zinc-500">Choose products or an active recurring plan, then come back here to complete the order.</p>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <Link href="/products" className="mt-7 rounded-full bg-zinc-950 px-7 py-3.5 text-sm font-semibold text-white hover:bg-emerald-900">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Secure order</span>
            <h1 className="mt-3 font-serif text-4xl tracking-tight text-zinc-950 md:text-6xl">Checkout</h1>
            {effectiveBagName && (
              <p className="mt-2 text-zinc-600">
                {effectiveBagName} · {itemCount} item{itemCount === 1 ? "" : "s"}
              </p>
            )}
          </div>
          <Link href="/products" className="inline-flex items-center gap-1 text-sm font-medium text-emerald-800 hover:text-emerald-950">
            Continue shopping <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-7 lg:col-span-7">
            <Card className="overflow-hidden rounded-[1.75rem] border-zinc-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
                <h2 className="font-serif text-2xl text-zinc-950">Order items</h2>
                {bagUpdating && <span className="text-xs font-medium text-emerald-700">Updating…</span>}
              </div>
              <CardContent className="space-y-5 p-6">
                {effectiveItems.map((item, index) => (
                  <div key={`${item.product.id}-${index}`} className="flex gap-4 border-b border-zinc-100 pb-5 last:border-0 last:pb-0">
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-zinc-100">
                      {item.product.images?.[0]?.url ? (
                        // Small checkout thumbnail. Product images can originate from supplier storage domains not controlled by Next image config.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.product.images[0].url} alt={item.product.images[0].alt || item.product.name} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-zinc-300" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-zinc-950">{item.product.name}</h3>
                          <p className="mt-1 text-sm text-zinc-500">Rs. {Number(item.product.price).toFixed(2)} {item.product.unit ? `/ ${item.product.unit}` : ""}</p>
                        </div>
                        {!planSlug && (
                          <button
                            type="button"
                            aria-label={`Remove ${item.product.name}`}
                            onClick={() => previewBag ? setPreviewBag(null) : bag && removeFromBag(bag.id, item.product.id)}
                            className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="flex h-9 items-center overflow-hidden rounded-full border border-zinc-200 bg-white">
                          <button
                            type="button"
                            disabled={item.quantity <= 1 || Boolean(planSlug)}
                            onClick={() => {
                              const quantity = Math.max(1, item.quantity - 1);
                              if (previewBag) {
                                setPreviewBag((previous) => previous ? {
                                  ...previous,
                                  items: previous.items.map((candidate) => candidate.product.id === item.product.id ? { ...candidate, quantity } : candidate),
                                } : null);
                              } else if (bag) {
                                updateBagItem(bag.id, item.product.id, quantity);
                              }
                            }}
                            className="flex h-full w-9 items-center justify-center text-zinc-500 hover:bg-zinc-50 disabled:opacity-30"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-9 text-center text-sm font-medium text-zinc-900">{item.quantity}</span>
                          <button
                            type="button"
                            disabled={Boolean(planSlug)}
                            onClick={() => {
                              const quantity = item.quantity + 1;
                              if (previewBag) {
                                setPreviewBag((previous) => previous ? {
                                  ...previous,
                                  items: previous.items.map((candidate) => candidate.product.id === item.product.id ? { ...candidate, quantity } : candidate),
                                } : null);
                              } else if (bag) {
                                updateBagItem(bag.id, item.product.id, quantity);
                              }
                            }}
                            className="flex h-full w-9 items-center justify-center text-zinc-500 hover:bg-zinc-50 disabled:opacity-30"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <strong className="text-zinc-950">Rs. {(item.product.price * item.quantity).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {!planSlug && (
              <Card className="rounded-[1.75rem] border-zinc-200 bg-white shadow-sm">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-800">
                        <CalendarClock className="h-5 w-5" />
                        <span className="text-xs font-bold uppercase tracking-[0.16em]">Recurring order</span>
                      </div>
                      <h2 className="mt-3 font-serif text-2xl text-zinc-950">Repeat this order automatically</h2>
                      <p className="mt-2 text-sm leading-6 text-zinc-500">Optional. Choose a cadence and delivery days for this bag.</p>
                    </div>
                    <input
                      aria-label="Enable recurring order"
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(event) => setIsRecurring(event.target.checked)}
                      className="mt-2 h-5 w-5 rounded border-zinc-300 text-emerald-700 focus:ring-emerald-600"
                    />
                  </div>

                  {isRecurring && (
                    <div className="mt-7 space-y-7 border-t border-zinc-100 pt-7">
                      <div className="grid gap-4 sm:grid-cols-3">
                        {[
                          { label: "Weekly", value: RRule.WEEKLY },
                          { label: "Monthly", value: RRule.MONTHLY },
                          { label: "Daily", value: RRule.DAILY },
                        ].map((option) => (
                          <button
                            key={option.label}
                            type="button"
                            onClick={() => setRecurrenceFreq(option.value)}
                            className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${recurrenceFreq === option.value ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-zinc-200 text-zinc-600 hover:border-emerald-300"}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <label className="text-sm text-zinc-600">
                          Repeat every
                          <Input type="number" min={1} value={recurrenceInterval} onChange={(event) => setRecurrenceInterval(Math.max(1, Number(event.target.value) || 1))} className="mt-2" />
                        </label>
                        <label className="text-sm text-zinc-600">
                          Start date
                          <Input type="date" value={startDate} onChange={(event: ChangeEvent<HTMLInputElement>) => setStartDate(event.target.value)} className="mt-2" />
                        </label>
                        <label className="text-sm text-zinc-600">
                          End date <span className="text-zinc-400">(optional)</span>
                          <Input type="date" value={endDate} onChange={(event: ChangeEvent<HTMLInputElement>) => setEndDate(event.target.value)} className="mt-2" />
                        </label>
                      </div>

                      {recurrenceFreq === RRule.WEEKLY && (
                        <div>
                          <p className="mb-3 text-sm font-medium text-zinc-700">Delivery days</p>
                          <div className="flex flex-wrap gap-2">
                            {WEEKDAYS.map((day) => {
                              const selected = recurrenceByWeekday.includes(day.value);
                              return (
                                <button
                                  key={day.label}
                                  type="button"
                                  onClick={() => setRecurrenceByWeekday((previous) => selected ? previous.filter((value) => value !== day.value) : [...previous, day.value])}
                                  className={`h-10 w-10 rounded-full text-xs font-semibold transition-colors ${selected ? "bg-emerald-800 text-white" : "border border-zinc-200 bg-white text-zinc-600 hover:border-emerald-300"}`}
                                >
                                  {day.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="grid gap-5 md:grid-cols-2">
                        <MultiDateSelector label="Extra include dates" helperText="Optional one-off additional delivery dates" values={includeDates} onChange={setIncludeDates} />
                        <MultiDateSelector label="Exclude dates" helperText="Optional dates to skip" values={excludeDates} onChange={setExcludeDates} />
                      </div>

                      <label className="block text-sm text-zinc-600">
                        Schedule notes <span className="text-zinc-400">(optional)</span>
                        <textarea
                          rows={3}
                          value={recurrenceNotes}
                          onChange={(event) => setRecurrenceNotes(event.target.value)}
                          className="mt-2 w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-emerald-500"
                          placeholder="Anything we should know about the recurring schedule?"
                        />
                      </label>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="rounded-[1.75rem] border-zinc-200 bg-white shadow-sm">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-800">
                      <MapPin className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-[0.16em]">Delivery</span>
                    </div>
                    <h2 className="mt-3 font-serif text-2xl text-zinc-950">Where should we deliver?</h2>
                  </div>
                  {user?.registrationAddress && (
                    <label className="inline-flex items-center gap-2 text-sm text-zinc-600">
                      <input type="checkbox" checked={useAccountAddress} onChange={(event) => setUseAccountAddress(event.target.checked)} className="rounded border-zinc-300 text-emerald-700 focus:ring-emerald-600" />
                      Use saved address
                    </label>
                  )}
                </div>

                {useAccountAddress && user?.registrationAddress ? (
                  <div className="mt-6 rounded-2xl bg-zinc-50 p-5 text-sm leading-6 text-zinc-600">
                    <strong className="block text-zinc-950">{user.registrationAddress.recipientName || user.firstName}</strong>
                    <span>{user.registrationAddress.streetAddress}</span><br />
                    <span>{user.registrationAddress.city}</span><br />
                    <span>{user.registrationAddress.phoneNumber || user.phoneNumber}</span>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <label className="text-sm text-zinc-600">Recipient name<Input value={shipName} onChange={(event) => setShipName(event.target.value)} className="mt-2" /></label>
                    <label className="text-sm text-zinc-600">Phone<Input value={shipPhone} onChange={(event) => setShipPhone(event.target.value)} className="mt-2" /></label>
                    <label className="text-sm text-zinc-600 md:col-span-2">Street address<Input value={shipStreet} onChange={(event) => setShipStreet(event.target.value)} className="mt-2" /></label>
                    <label className="text-sm text-zinc-600">City<Input value={shipCity} onChange={(event) => setShipCity(event.target.value)} className="mt-2" /></label>
                    <label className="text-sm text-zinc-600">State / province<Input value={shipState} onChange={(event) => setShipState(event.target.value)} className="mt-2" /></label>
                    <label className="text-sm text-zinc-600">Postal code<Input value={shipZip} onChange={(event) => setShipZip(event.target.value)} className="mt-2" /></label>
                    <label className="text-sm text-zinc-600">Country<Input value={shipCountry} onChange={(event) => setShipCountry(event.target.value)} className="mt-2" /></label>
                  </div>
                )}
              </CardContent>
            </Card>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>
            )}
          </div>

          <aside className="lg:col-span-5">
            <div className="space-y-5 lg:sticky lg:top-28">
              <Card className="overflow-hidden rounded-[1.75rem] border-zinc-200 bg-white shadow-xl">
                <CardContent className="p-6 md:p-8">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Order summary</span>
                  <div className="mt-6 space-y-3">
                    {effectiveItems.map((item) => (
                      <div key={`summary-${item.product.id}`} className="flex justify-between gap-4 text-sm">
                        <span className="min-w-0 truncate text-zinc-500">{item.quantity} × {item.product.name}</span>
                        <span className="shrink-0 font-medium text-zinc-900">Rs. {(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 border-t border-zinc-100 pt-5">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm text-zinc-500">Items total</p>
                        <p className="mt-1 font-serif text-3xl text-zinc-950">Rs. {total.toFixed(2)}</p>
                      </div>
                      <p className="max-w-[150px] text-right text-xs leading-5 text-zinc-400">Delivery details are confirmed as part of order fulfilment.</p>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    onClick={() => placeOrder(false)}
                    disabled={submitting || !canPlaceOrder}
                    className="mt-7 h-14 w-full rounded-full bg-zinc-950 text-base font-semibold text-white hover:bg-emerald-900"
                  >
                    {submitting && !orderingViaWhatsapp ? "Placing order…" : "Place order · Cash on delivery"}
                  </Button>

                  {WHATSAPP_NUMBER && !planSlug && (
                    <Button
                      size="lg"
                      onClick={() => placeOrder(true)}
                      disabled={submitting || !canPlaceOrder}
                      className="mt-3 h-14 w-full rounded-full bg-[#25D366] text-base font-semibold text-white hover:bg-[#20bd5a]"
                    >
                      {submitting && orderingViaWhatsapp ? "Opening WhatsApp…" : "Place order & open WhatsApp"}
                    </Button>
                  )}

                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-400">
                    <LockKeyhole className="h-4 w-4" />
                    Account-protected checkout
                  </div>
                </CardContent>
              </Card>

              <p className="px-4 text-center text-xs leading-5 text-zinc-500">
                By placing an order you agree to our <Link href="/terms" className="underline hover:text-zinc-800">Terms</Link> and <Link href="/privacy" className="underline hover:text-zinc-800">Privacy Policy</Link>.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
