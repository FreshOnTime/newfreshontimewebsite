"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
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
import { authenticatedApiFetch } from "@/lib/api/authenticated-fetch";
import { isCompleteOrderAddress, registrationAddressToOrderAddress } from "@/lib/checkoutAddress";
import { discountedUnitPrice, type CheckoutQuote } from "@/lib/commercePricing";
import { checkoutRetryForIntent, hashCheckoutIntent, readCheckoutRetry, type CheckoutRetry } from "@/lib/checkoutRetry";
import { WHATSAPP_NUMBER } from "@/lib/config/site";

type CheckoutItem = {
  product: {
    id: string;
    name: string;
    price: number;
    stock?: number;
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
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-background">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-brand-green" />
      <p className="text-sm text-muted-foreground">{message}</p>
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
  const submissionLock = useRef(false);
  const retryRef = useRef<CheckoutRetry | null>(null);
  const subscriptionRetryRef = useRef<CheckoutRetry | null>(null);
  const [quoteState, setQuoteState] = useState<{ itemsKey: string; quote: CheckoutQuote } | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteVersion, setQuoteVersion] = useState(0);
  const [recovering, setRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoveryVersion, setRecoveryVersion] = useState(0);
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
    setPreviewBag(null);
    setSelectedSubscriptionPlan(null);
    setIsRecurring(Boolean(planSlug));
    setError(null);
    if (!planSlug && !quickSku) setPreviewLoading(false);
  }, [planSlug, quickSku, bagId]);

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
              price: discountedUnitPrice(Number(product.pricePerBaseQuantity || 0), product.discountPercentage),
              stock: product.isOutOfStock ? 0 : product.stockQuantity,
              unit: product.measurementUnit || "ea",
              images: image?.url || image?.path
                ? [{ url: image.url || image.path || "", alt: image.alt || product.name }]
                : [],
            },
            quantity: Number.isSafeInteger(quickQty) && quickQty > 0 ? quickQty : 1,
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
    if (planSlug || quickSku) return previewBag?.items || [];
    if (!bag?.items?.length) return [];

    return bag.items.map((item: Bag["items"][number]) => ({
      product: {
        id: item.product.id,
        name: item.product.name,
        price: Number(item.product.price || 0),
        stock: item.product.stock,
        unit: item.product.unit || undefined,
        images: item.product.images || [],
      },
      quantity: item.quantity,
    }));
  }, [bag, previewBag, planSlug, quickSku]);

  const effectiveBagId = planSlug || quickSku ? undefined : bag?.id;
  const effectiveBagName = planSlug || quickSku ? previewBag?.name : bag?.name;
  const total = useMemo(
    () => effectiveItems.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0),
    [effectiveItems],
  );
  const itemCount = useMemo(
    () => effectiveItems.reduce((sum, item) => sum + item.quantity, 0),
    [effectiveItems],
  );

  const itemsKey = JSON.stringify(effectiveItems.map((item) => ({ productId: item.product.id, quantity: item.quantity })));
  const retryScope = `freshpick-checkout:${user?._id || ""}:${effectiveBagId || quickSku || "default"}`;
  const accountAddress = registrationAddressToOrderAddress(user?.registrationAddress, { name: user?.firstName, phone: user?.phoneNumber });
  const areaKey = JSON.stringify({ city: useAccountAddress ? accountAddress?.city || '' : shipCity, country: useAccountAddress ? accountAddress?.country || 'LK' : shipCountry });
  const quoteKey = JSON.stringify([itemsKey, areaKey]);
  const quote = quoteState?.itemsKey === quoteKey ? quoteState.quote : null;

  useEffect(() => {
    if (!user || planSlug || bagsLoading || previewLoading) return;
    let cancelled = false;
    let previous: CheckoutRetry | null = null;
    try { previous = readCheckoutRetry(sessionStorage, retryScope); } catch { /* Storage may be disabled. */ }
    retryRef.current = previous?.completed ? null : previous;
    setRecoveryError(null);
    if (!previous || previous.completed) { setRecovering(false); return; }
    setRecovering(true);
    authenticatedApiFetch(`/api/orders/receipt?key=${encodeURIComponent(previous.key)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to check your previous checkout.");
        if (cancelled) return;
        const orderId = data.receipt?.data?._id || data.receipt?.data?.id;
        if (orderId) {
          try { sessionStorage.setItem(retryScope, JSON.stringify({ ...previous, completed: true })); } catch { /* Optional persistence. */ }
          router.replace(`/orders/${orderId}`);
        } else setRecovering(false);
      })
      .catch((failure) => { if (!cancelled) { setRecovering(false); setRecoveryError(failure.message); } });
    return () => { cancelled = true; };
  }, [user, planSlug, bagsLoading, previewLoading, retryScope, recoveryVersion, router]);

  useEffect(() => {
    if (!user || planSlug || bagsLoading || bagUpdating || previewLoading || itemsKey === "[]") return;
    let cancelled = false;
    setQuoteState(null);
    setQuoteError(null);
    authenticatedApiFetch("/api/orders/quote", { method: "POST", body: JSON.stringify({ items: JSON.parse(itemsKey), ...(JSON.parse(areaKey).city ? { deliveryAddress: JSON.parse(areaKey) } : {}) }) })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.quote) throw new Error(data.error || "Unable to confirm the order total.");
        if (!cancelled) setQuoteState({ itemsKey: quoteKey, quote: data.quote });
      })
      .catch((failure) => { if (!cancelled) setQuoteError(failure.message); });
    return () => { cancelled = true; };
  }, [user, planSlug, bagsLoading, bagUpdating, previewLoading, itemsKey, areaKey, quoteKey, quoteVersion]);

  const quotedUnitPrice = (item: CheckoutItem) => quote?.items.find((line) => line.productId === item.product.id)?.price
    ?? (quickSku && quote?.items.length === 1 ? quote.items[0].price : item.product.price);

  const customAddressComplete = isCompleteOrderAddress({ name: shipName, phone: shipPhone, street: shipStreet, city: shipCity, country: shipCountry });
  const stockAvailable = effectiveItems.every((item) => item.product.stock === undefined || item.quantity <= item.product.stock);
  const canPlaceOrder = !recovering && !recoveryError && (Boolean(planSlug) || Boolean(quote)) && effectiveItems.length > 0 && stockAvailable && !bagsLoading && !bagUpdating && (useAccountAddress ? isCompleteOrderAddress(accountAddress) : customAddressComplete);

  const buildRecurrence = (startedAt: string) => {
    if (!isRecurring) return undefined;

    const rule = new RRule({
      freq: recurrenceFreq,
      interval: Math.max(1, recurrenceInterval),
      byweekday: recurrenceFreq === RRule.WEEKLY ? recurrenceByWeekday : undefined,
      dtstart: startDate ? new Date(startDate) : new Date(startedAt),
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
    if (submissionLock.current || bagUpdating || bagsLoading) return;
    if (!user || effectiveItems.length === 0) {
      setError("Your order is not ready yet.");
      return;
    }
    if (!canPlaceOrder) {
      setError(stockAvailable ? "Please complete the delivery address before placing your order." : "Please remove unavailable items or reduce their quantities before placing your order.");
      return;
    }
    if (isRecurring && recurrenceFreq === RRule.WEEKLY && recurrenceByWeekday.length === 0) {
      setError("Please choose at least one delivery day.");
      return;
    }
    if (isRecurring && startDate && endDate && endDate < startDate) {
      setError("The end date must be on or after the start date.");
      return;
    }
    if (isWhatsapp && !WHATSAPP_NUMBER) {
      setError("WhatsApp ordering is not configured right now. Please place the order normally.");
      return;
    }

    submissionLock.current = true;
    let completed = false;
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
          ? accountAddress
          : {
              name: shipName,
              street: shipStreet,
              city: shipCity,
              state: shipState,
              zipCode: shipZip,
              country: shipCountry,
              phone: shipPhone,
            };

        const intent = { planId: selectedSubscriptionPlan.id, deliveryAddress,
          deliverySlot: { day, timeSlot: "Any time" }, paymentMethod: "cod", startDate: startDate || undefined };
        const scope = `freshpick-subscription:${user._id}:${selectedSubscriptionPlan.id}`;
        const hash = await hashCheckoutIntent(intent);
        let previous = subscriptionRetryRef.current;
        if (!previous) { try { previous = readCheckoutRetry(sessionStorage, scope); } catch { /* Same-page protection remains available. */ } }
        const retry = checkoutRetryForIntent(previous, hash);
        subscriptionRetryRef.current = retry;
        try { sessionStorage.setItem(scope, JSON.stringify(retry)); } catch { /* Optional reload recovery. */ }
        const response = await authenticatedApiFetch("/api/subscriptions", {
          method: "POST", headers: { 'Idempotency-Key': retry.key }, body: JSON.stringify(intent),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Subscription could not be created");
        }

        completed = true;
        try { sessionStorage.setItem(scope, JSON.stringify({ ...retry, completed: true })); } catch { /* Optional persistence. */ }
        subscriptionRetryRef.current = null;
        router.replace("/profile/subscriptions");
        return;
      }

      if (!quote) throw new Error("Please confirm the current order total.");
      const intent = {
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
        recurrence: isRecurring ? { recurrenceFreq, recurrenceInterval, recurrenceByWeekday,
          startDate, endDate, includeDates, excludeDates, recurrenceNotes } : undefined,
      };
      const intentHash = await hashCheckoutIntent(intent);
      let previous = retryRef.current;
      if (!previous) { try { previous = readCheckoutRetry(sessionStorage, retryScope); } catch { /* Optional persistence. */ } }
      const retry = checkoutRetryForIntent(previous, intentHash);
      retryRef.current = retry;
      try { sessionStorage.setItem(retryScope, JSON.stringify(retry)); } catch { /* Same-page retries retain their key in memory. */ }
      const response = await authenticatedApiFetch("/api/orders", {
        method: "POST",
        headers: { "Idempotency-Key": retry.key },
        body: JSON.stringify({ ...intent, recurrence: buildRecurrence(retry.startedAt), quoteFingerprint: quote.fingerprint }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        if (response.status === 409) { setQuoteState(null); setQuoteVersion((version) => version + 1); }
        throw new Error(data.error || "Order failed");
      }
      try { sessionStorage.setItem(retryScope, JSON.stringify({ ...retry, completed: true })); } catch { /* Optional persistence. */ }
      completed = true;

      const orderId = data.data?._id || data.data?.id;
      const orderNo = data.data?.orderNumber || orderId?.slice(-6) || "New";

      if (isWhatsapp) {
        const itemsList = effectiveItems
          .map((item) => `- ${item.product.name} (${item.product.unit || "ea"}): ${item.quantity}`)
          .join("\n");
        const deliveryTo = useAccountAddress
          ? `${user.registrationAddress?.recipientName || user.firstName}\n${user.registrationAddress?.phoneNumber || user.phoneNumber}\n${user.registrationAddress?.streetAddress || ""}\n${user.registrationAddress?.city || ""}`
          : `${shipName}\n${shipPhone}\n${shipStreet}\n${shipCity}, ${shipState} ${shipZip}`;
        const message = `Hi FreshPick! I'd like to confirm order #${orderNo}.\n\nItems:\n${itemsList}\n\nOrder total: Rs. ${Number(data.data?.total || quote.total).toFixed(2)}\n\nDeliver to:\n${deliveryTo}`;
        window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        return;
      }

      router.replace(orderId ? `/orders/${orderId}` : "/orders");
    } catch (placeOrderError) {
      setError(placeOrderError instanceof Error ? placeOrderError.message : "Unable to place the order.");
      setOrderingViaWhatsapp(false);
    } finally {
      if (!completed) {
        submissionLock.current = false;
        setSubmitting(false);
      }
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
      <div className="flex min-h-[50vh] flex-col items-center justify-center bg-background px-5 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-brand-green">
          <ShoppingBag strokeWidth={1.5} aria-hidden="true" className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-3xl font-normal text-brand-green">Nothing to check out yet.</h1>
        <p className="mt-2 max-w-md text-muted-foreground">Choose products or an active recurring plan, then come back here to complete the order.</p>
        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
        <Link href="/products" className="mt-7 rounded-lg bg-brand-leaf px-7 py-3.5 text-sm font-semibold text-brand-ink hover:bg-brand-leaf/85">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-medium text-brand-green">Secure order</span>
            <h1 className="mt-3 text-3xl font-normal tracking-tight text-brand-green md:text-4xl">Checkout</h1>
            {effectiveBagName && (
              <p className="mt-2 text-muted-foreground">
                {effectiveBagName} · {itemCount} item{itemCount === 1 ? "" : "s"}
              </p>
            )}
          </div>
          <Link href="/products" className="inline-flex items-center gap-1 text-sm font-medium text-brand-green hover:text-brand-green">
            Continue shopping <ChevronRight strokeWidth={1.75} aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
          <fieldset disabled={submitting} aria-label="Order details" className="min-w-0 space-y-7 lg:col-span-7">
            <Card className="overflow-hidden rounded-lg border-border bg-background shadow-none">
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <h2 className="text-xl font-normal text-brand-green">Order items</h2>
                {bagUpdating && <span className="text-xs font-medium text-brand-green">Updating…</span>}
              </div>
              <CardContent className="space-y-5 p-6">
                {effectiveItems.map((item, index) => (
                  <div key={`${item.product.id}-${index}`} className="flex gap-4 border-b border-border pb-5 last:border-0 last:pb-0">
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-background">
                      {item.product.images?.[0]?.url ? (
                        // Small checkout thumbnail. Product images can originate from supplier storage domains not controlled by Next image config.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.product.images[0].url} alt={item.product.images[0].alt || item.product.name} className="h-full w-full object-contain p-2" />
                      ) : (
                        <ImageIcon strokeWidth={1.5} aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-foreground">{item.product.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">Rs. {quotedUnitPrice(item).toFixed(2)} {item.product.unit ? `/ ${item.product.unit}` : ""}</p>
                        </div>
                        {!planSlug && (
                          <button
                            type="button"
                            aria-label={`Remove ${item.product.name}`}
                            disabled={submitting || bagUpdating || bagsLoading}
                            onClick={() => previewBag ? setPreviewBag(null) : bag && removeFromBag(bag.id, item.product.id).catch((error: Error) => setError(error.message))}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 strokeWidth={1.75} aria-hidden="true" className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex h-11 items-center overflow-hidden rounded-lg border border-border bg-background">
                          <button
                            type="button"
                            aria-label={`Decrease ${item.product.name}`}
                            disabled={item.quantity <= 1 || Boolean(planSlug) || submitting || bagUpdating || bagsLoading}
                            onClick={() => {
                              const quantity = Math.max(1, item.quantity - 1);
                              if (previewBag) {
                                setPreviewBag((previous) => previous ? {
                                  ...previous,
                                  items: previous.items.map((candidate) => candidate.product.id === item.product.id ? { ...candidate, quantity } : candidate),
                                } : null);
                              } else if (bag) {
                                updateBagItem(bag.id, item.product.id, quantity).catch((error: Error) => setError(error.message));
                              }
                            }}
                            className="flex h-full w-11 items-center justify-center text-muted-foreground hover:bg-background disabled:opacity-30"
                          >
                            <Minus strokeWidth={1.75} aria-hidden="true" className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Increase ${item.product.name}`}
                            disabled={Boolean(planSlug) || submitting || bagUpdating || bagsLoading || (item.product.stock !== undefined && item.quantity >= item.product.stock)}
                            onClick={() => {
                              const quantity = item.quantity + 1;
                              if (previewBag) {
                                setPreviewBag((previous) => previous ? {
                                  ...previous,
                                  items: previous.items.map((candidate) => candidate.product.id === item.product.id ? { ...candidate, quantity } : candidate),
                                } : null);
                              } else if (bag) {
                                updateBagItem(bag.id, item.product.id, quantity).catch((error: Error) => setError(error.message));
                              }
                            }}
                            className="flex h-full w-11 items-center justify-center text-muted-foreground hover:bg-background disabled:opacity-30"
                          >
                            <Plus strokeWidth={1.75} aria-hidden="true" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <strong className="text-foreground">Rs. {(quotedUnitPrice(item) * item.quantity).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {planSlug && (
              <section aria-labelledby="delivery-schedule-title" className="rounded-lg border border-border p-6 md:p-8">
                <div className="flex items-center gap-2 text-brand-green"><CalendarClock strokeWidth={1.75} aria-hidden="true" className="h-5 w-5" /><h2 id="delivery-schedule-title" className="text-xl font-normal">Delivery schedule</h2></div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Choose a delivery day for your {selectedSubscriptionPlan?.frequency === 'biweekly' ? 'fortnightly' : selectedSubscriptionPlan?.frequency === 'monthly' ? 'monthly' : 'weekly'} basket.</p>
                <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Subscription delivery day">
                  {WEEKDAYS.map((day) => <button key={day.value} type="button" aria-pressed={recurrenceByWeekday[0] === day.value} onClick={() => setRecurrenceByWeekday([day.value])} className={`h-11 min-w-11 rounded-lg border px-3 text-sm ${recurrenceByWeekday[0] === day.value ? 'border-brand-green bg-brand-green text-primary-foreground' : 'border-border text-muted-foreground hover:border-brand-green'}`}>{day.label}</button>)}
                </div>
                <label className="mt-5 block text-sm text-muted-foreground">Start date <span>(optional)</span><Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-2 max-w-sm" /></label>
              </section>
            )}

            {!planSlug && (
              <Card className="rounded-lg border-border bg-background shadow-none">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 text-brand-green">
                        <CalendarClock strokeWidth={1.75} aria-hidden="true" className="h-5 w-5" />
                        <span className="text-xs font-medium">Recurring order</span>
                      </div>
                      <h2 className="mt-3 text-xl font-normal text-brand-green">Repeat this order automatically</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">Optional. Choose a cadence and delivery days for this bag.</p>
                    </div>
                    <input
                      aria-label="Enable recurring order"
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(event) => setIsRecurring(event.target.checked)}
                      className="mt-2 h-5 w-5 rounded border-border text-brand-green focus:ring-brand-green"
                    />
                  </div>

                  {isRecurring && (
                    <div className="mt-7 space-y-7 border-t border-border pt-7">
                      <div className="grid gap-4 sm:grid-cols-3">
                        {[
                          { label: "Weekly", value: RRule.WEEKLY },
                          { label: "Monthly", value: RRule.MONTHLY },
                          { label: "Daily", value: RRule.DAILY },
                        ].map((option) => (
                          <button
                            key={option.label}
                            type="button"
                            aria-pressed={recurrenceFreq === option.value}
                            onClick={() => setRecurrenceFreq(option.value)}
                            className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${recurrenceFreq === option.value ? "border-brand-green bg-secondary text-brand-green" : "border-border text-muted-foreground hover:border-brand-green/40"} `}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <label className="text-sm text-muted-foreground">
                          Repeat every
                          <Input type="number" min={1} value={recurrenceInterval} onChange={(event) => setRecurrenceInterval(Math.max(1, Number(event.target.value) || 1))} className="mt-2" />
                        </label>
                        <label className="text-sm text-muted-foreground">
                          Start date
                          <Input type="date" value={startDate} onChange={(event: ChangeEvent<HTMLInputElement>) => setStartDate(event.target.value)} className="mt-2" />
                        </label>
                        <label className="text-sm text-muted-foreground">
                          End date <span className="text-muted-foreground">(optional)</span>
                          <Input type="date" value={endDate} onChange={(event: ChangeEvent<HTMLInputElement>) => setEndDate(event.target.value)} className="mt-2" />
                        </label>
                      </div>

                      {recurrenceFreq === RRule.WEEKLY && (
                        <div>
                          <p className="mb-3 text-sm font-medium text-foreground">Delivery days</p>
                          <div className="flex flex-wrap gap-2">
                            {WEEKDAYS.map((day) => {
                              const selected = recurrenceByWeekday.includes(day.value);
                              return (
                                <button
                                  key={day.label}
                                  type="button"
                                  aria-pressed={selected}
                                  onClick={() => setRecurrenceByWeekday((previous) => selected ? previous.filter((value) => value !== day.value) : [...previous, day.value])}
                                  className={`h-11 w-11 rounded-lg text-xs font-semibold transition-colors ${selected ? "bg-brand-green text-white" : "border border-border bg-background text-muted-foreground hover:border-brand-green/40"} `}
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

                      <label className="block text-sm text-muted-foreground">
                        Schedule notes <span className="text-muted-foreground">(optional)</span>
                        <textarea
                          rows={3}
                          value={recurrenceNotes}
                          onChange={(event) => setRecurrenceNotes(event.target.value)}
                          className="mt-2 w-full resize-none rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-brand-green"
                          placeholder="Anything we should know about the recurring schedule?"
                        />
                      </label>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="rounded-lg border-border bg-background shadow-none">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center gap-2 text-brand-green">
                      <MapPin strokeWidth={1.75} aria-hidden="true" className="h-5 w-5" />
                      <span className="text-xs font-medium">Delivery</span>
                    </div>
                    <h2 className="mt-3 text-xl font-normal text-brand-green">Where should we deliver?</h2>
                  </div>
                  {user?.registrationAddress && (
                    <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" checked={useAccountAddress} onChange={(event) => setUseAccountAddress(event.target.checked)} className="rounded border-border text-brand-green focus:ring-brand-green" />
                      Use saved address
                    </label>
                  )}
                </div>

                {useAccountAddress && user?.registrationAddress ? (
                  <div className="mt-6 rounded-lg bg-secondary/50 p-5 text-sm leading-6 text-muted-foreground">
                    <strong className="block text-foreground">{user.registrationAddress.recipientName || user.firstName}</strong>
                    <span>{user.registrationAddress.streetAddress}</span><br />
                    <span>{user.registrationAddress.city}</span><br />
                    <span>{user.registrationAddress.phoneNumber || user.phoneNumber}</span>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <label className="text-sm text-muted-foreground">Recipient name<Input autoComplete="shipping name" value={shipName} onChange={(event) => setShipName(event.target.value)} className="mt-2" /></label>
                    <label className="text-sm text-muted-foreground">Phone<Input type="tel" autoComplete="shipping tel" value={shipPhone} onChange={(event) => setShipPhone(event.target.value)} className="mt-2" /></label>
                    <label className="text-sm text-muted-foreground md:col-span-2">Street address<Input autoComplete="shipping street-address" value={shipStreet} onChange={(event) => setShipStreet(event.target.value)} className="mt-2" /></label>
                    <label className="text-sm text-muted-foreground">City<Input autoComplete="shipping address-level2" value={shipCity} onChange={(event) => setShipCity(event.target.value)} className="mt-2" /></label>
                    <label className="text-sm text-muted-foreground">State / province<Input autoComplete="shipping address-level1" value={shipState} onChange={(event) => setShipState(event.target.value)} className="mt-2" /></label>
                    <label className="text-sm text-muted-foreground">Postal code<Input autoComplete="shipping postal-code" value={shipZip} onChange={(event) => setShipZip(event.target.value)} className="mt-2" /></label>
                    <label className="text-sm text-muted-foreground">Country<Input autoComplete="shipping country" value={shipCountry} onChange={(event) => setShipCountry(event.target.value)} className="mt-2" /></label>
                  </div>
                )}
              </CardContent>
            </Card>

            {error && (
              <div role="alert" className="rounded-lg border border-destructive/20 px-5 py-4 text-sm text-destructive">{error}</div>
            )}
          </fieldset>

          <aside className="lg:col-span-5">
            <div className="space-y-5 lg:sticky lg:top-28">
              <Card className="overflow-hidden rounded-lg border-border bg-background shadow-none">
                <CardContent className="p-6 md:p-8">
                  <span className="text-xs font-medium text-brand-green">Order summary</span>
                  <div className="mt-6 space-y-3">
                    {(quote?.items || effectiveItems.map((item) => ({ productId: item.product.id, name: item.product.name, quantity: item.quantity, total: item.product.price * item.quantity }))).map((item) => (
                      <div key={`summary-${item.productId}`} className="flex justify-between gap-4 text-sm">
                        <span className="min-w-0 truncate text-muted-foreground">{item.quantity} × {item.name}</span>
                        <span className="shrink-0 font-medium text-foreground">Rs. {item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3 border-t border-border pt-5" aria-live="polite">
                    {quote && <>
                      <div className="flex justify-between text-sm text-muted-foreground"><span>Items subtotal</span><span>Rs. {quote.subtotal.toFixed(2)}</span></div>
                      <div className="flex justify-between text-sm text-muted-foreground"><span>Delivery</span><span>{quote.shipping ? `Rs. ${quote.shipping.toFixed(2)}` : "Free"}</span></div>
                    </>}
                    <div className="flex items-end justify-between gap-4">
                      <p className="text-sm text-muted-foreground">{planSlug ? "Plan price" : "Order total"}</p>
                      <p className="font-sans text-3xl text-foreground">{planSlug || quote ? `Rs. ${(quote?.total ?? total).toFixed(2)}` : "—"}</p>
                    </div>
                    {!planSlug && !quote && !quoteError && <p className="text-sm text-muted-foreground">Confirming prices and availability…</p>}
                    {quoteError && <div role="alert" className="text-sm text-destructive"><p>{quoteError}</p><button type="button" disabled={submitting} onClick={() => setQuoteVersion((version) => version + 1)} className="mt-2 underline">Check total again</button></div>}
                    {recovering && <p className="text-sm text-muted-foreground">Checking your previous checkout…</p>}
                    {recoveryError && <div role="alert" className="text-sm text-destructive"><p>{recoveryError}</p><button type="button" onClick={() => setRecoveryVersion((version) => version + 1)} className="mt-2 underline">Check previous order again</button></div>}
                  </div>

                  <p className="mt-5 text-sm text-muted-foreground">Payment: cash on delivery</p>
                  {isRecurring && !planSlug && <p className="mt-2 text-xs leading-5 text-muted-foreground">Future deliveries use the catalogue prices and delivery charges current when each order is created.</p>}
                  {!stockAvailable && <p className="mt-3 text-sm leading-6 text-destructive">Update unavailable items before placing your order.</p>}
                  <Button
                    size="lg"
                    onClick={() => placeOrder(false)}
                    disabled={submitting || !canPlaceOrder}
                    className="mt-7 min-h-12 h-auto w-full whitespace-normal rounded-lg px-4 py-3 bg-brand-leaf text-base font-semibold text-brand-ink hover:bg-brand-leaf/85"
                  >
                    {submitting && !orderingViaWhatsapp ? "Placing order…" : "Place order"}
                  </Button>

                  {WHATSAPP_NUMBER && !planSlug && (
                    <Button
                      size="lg"
                      onClick={() => placeOrder(true)}
                      disabled={submitting || !canPlaceOrder}
                      className="mt-3 min-h-12 h-auto w-full whitespace-normal rounded-lg px-4 py-3 border border-brand-green bg-background text-base font-medium text-brand-green hover:bg-secondary"
                    >
                      {submitting && orderingViaWhatsapp ? "Opening WhatsApp…" : "Place order & open WhatsApp"}
                    </Button>
                  )}

                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <LockKeyhole strokeWidth={1.75} aria-hidden="true" className="h-4 w-4" />
                    Account-protected checkout
                  </div>
                </CardContent>
              </Card>

              <p className="px-4 text-center text-xs leading-5 text-muted-foreground">
                By placing an order you agree to our <Link href="/terms" className="underline hover:text-foreground">Terms</Link> and <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
