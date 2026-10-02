"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { useAuth } from '@/contexts/AuthContext';
import { useBag } from '@/contexts/BagContext';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';
import { AccountPage, AccountState, AccountLoading, accountButton, accountSecondaryButton } from '@/components/account/AccountPage';

type ProductUi = {
  _id: string;
  sku: string;
  name: string;
  image: { url: string };
  discountPercentage: number;
  baseMeasurementQuantity: number;
  pricePerBaseQuantity: number;
  measurementUnit: "g" | "kg" | "ml" | "l" | "ea" | "lb";
  isSoldAsUnit: boolean;
  isOutOfStock?: boolean;
};

type TasteSignal = { key: string; label: string; score: number; normalized: number };

type IntelligenceData = {
  taste: {
    signalCount: number;
    confidence: number;
    topCategories: TasteSignal[];
    topTags: TasteSignal[];
    generatedAt: string;
  };
  smartBasket: Array<{
    product: ProductUi;
    purchaseCount: number;
    averageIntervalDays: number;
    daysSinceLastPurchase: number;
    dueInDays: number;
    dueScore: number;
    confidence: number;
  }>;
  recommendations: Array<{
    product: ProductUi;
    score: number;
    reason: string;
  }>;
};

export default function ForYouClient() {
  const { user, loading: authLoading } = useAuth();
  const { fetchBags } = useBag();
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'guest' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [building, setBuilding] = useState(false);
  const [added, setAdded] = useState<number | null>(null);
  const [bagId, setBagId] = useState<string | null>(null);
  const [buildError, setBuildError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    setData(null);
    setAdded(null);
    setBagId(null);
    setBuildError(null);
    if (!user?._id) { setStatus('guest'); return; }
    const controller = new AbortController();
    setStatus('loading');
    const load = async () => {
      try {
        const response = await authenticatedApiFetch('/api/intelligence/me', { cache: 'no-store', signal: controller.signal });
        if (response.status === 401) { if (!controller.signal.aborted) setStatus('guest'); return; }
        const body = await response.json();
        if (!response.ok || !body.success || !body.data) throw new Error('Couldn’t load your picks');
        if (!controller.signal.aborted) { setData(body.data); setStatus('ready'); }
      } catch {
        if (!controller.signal.aborted) setStatus('error');
      }
    };
    void load();
    return () => controller.abort();
  }, [user?._id, authLoading, retryCount]);

  const buildSmartBasket = async () => {
    if (!data || building) return;
    setBuilding(true);
    setAdded(null);
    setBagId(null);
    setBuildError(null);
    try {
      const response = await authenticatedApiFetch('/api/intelligence/me', {
        method: 'POST', body: JSON.stringify({ productIds: data.smartBasket.map((item) => item.product._id) }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || 'Couldn’t add your essentials. Please try again.');
      setAdded(Number(body.added || 0));
      setBagId(body.bagId || null);
      await fetchBags();
    } catch (error) {
      setBuildError(error instanceof Error ? error.message : 'Couldn’t add your essentials. Please try again.');
    } finally { setBuilding(false); }
  };

  const tasteLabels = data ? [...data.taste.topCategories.slice(0, 5), ...data.taste.topTags.slice(0, 4)]
    .filter((item, index, array) => array.findIndex((candidate) => candidate.label === item.label) === index).slice(0, 7) : [];

  return (
    <AccountPage title="For you" description="Favourites and repeat essentials, based on your shopping history." action={<Link href="/products" className={accountSecondaryButton}>Shop the market</Link>}>
      {authLoading || status === 'loading' ? <AccountLoading label="Loading your picks…" /> : status === 'guest' ? (
        <AccountState title="Your personal picks" description="Sign in to see recommendations and repeat purchases." action={<Link href="/auth/login?redirect=/for-you" className={accountButton}>Sign in</Link>} />
      ) : status === 'error' || !data ? (
        <AccountState error title="Your picks are unavailable" description="Please try again in a moment." action={<button type="button" className={accountSecondaryButton} onClick={() => setRetryCount((count) => count + 1)}>Try again</button>} />
      ) : (
        <div className="space-y-10 md:space-y-12">
          {tasteLabels.length > 0 && <section aria-label="Your preferences" className="flex flex-wrap items-center gap-2 border-b border-border pb-6"><p className="mr-3 text-sm text-muted-foreground">Your interests</p>{tasteLabels.map((signal) => <span key={`${signal.key}-${signal.label}`} className="rounded-full border border-brand-green/20 px-3 py-1.5 text-xs text-brand-green">{signal.label}</span>)}</section>}
          <section aria-labelledby="repeat-title">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div><h2 id="repeat-title" className="text-xl font-medium text-brand-green">Buy again</h2><p className="mt-2 text-sm text-muted-foreground">Essentials you tend to buy regularly.</p></div>
              {data.smartBasket.length > 0 && <button type="button" onClick={() => void buildSmartBasket()} disabled={building} className={accountButton}>{building && <Loader2 className="h-4 w-4 animate-spin" />} {building ? 'Adding…' : 'Add repeat essentials'}</button>}
            </div>
            {buildError && <p role="alert" className="mt-5 rounded-lg border border-rose-200 px-4 py-3 text-sm text-rose-700">{buildError}</p>}
            {added !== null && <div role="status" className="mt-5 flex flex-wrap items-center gap-4 text-sm text-brand-green"><p>{added > 0 ? `${added} ${added === 1 ? 'item' : 'items'} added to your bag.` : 'No eligible items to add right now.'}</p>{bagId && <Link href={`/bags/${bagId}`} className="font-medium underline underline-offset-4">View bag</Link>}</div>}
            {data.smartBasket.length === 0 ? <p className="mt-6 border-y border-border py-8 text-sm text-muted-foreground">Repeat purchases will appear here after a few orders.</p> : (
              <div className="mt-6 grid gap-x-8 md:grid-cols-2">{data.smartBasket.slice(0, 8).map((item) => <Link key={item.product._id} href={`/products/${item.product.sku || item.product._id}`} className="flex items-center justify-between gap-5 border-t border-border py-5 hover:text-brand-green"><div className="min-w-0"><h3 className="break-words text-sm font-medium">{item.product.name}</h3><p className="mt-1 text-xs text-muted-foreground">Usually every {item.averageIntervalDays} days</p></div><span className="shrink-0 text-xs text-brand-green">{item.dueInDays <= 0 ? 'Due again' : `In ${item.dueInDays} days`}</span></Link>)}</div>
            )}
          </section>
          <section aria-labelledby="picks-title">
            <h2 id="picks-title" className="mb-6 text-xl font-medium text-brand-green">Picked for you</h2>
            {data.recommendations.length === 0 ? <AccountState title="More to discover" description="Save a few favourites or place an order to help us find products you’ll enjoy." action={<Link href="/products" className={accountButton}>Shop the market</Link>} /> : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">{data.recommendations.slice(0, 8).map((item, index) => <div key={item.product._id}><p className="mb-3 text-xs leading-5 text-muted-foreground">{item.reason}</p><ProductCard id={item.product._id} sku={item.product.sku} name={item.product.name} image={item.product.image?.url || ''} discountPercentage={item.product.discountPercentage || 0} baseMeasurementQuantity={item.product.baseMeasurementQuantity} pricePerBaseQuantity={item.product.pricePerBaseQuantity} measurementType={item.product.measurementUnit} isDiscreteItem={item.product.isSoldAsUnit} isOutOfStock={item.product.isOutOfStock} priority={index < 2} /></div>)}</div>
            )}
          </section>
        </div>
      )}
    </AccountPage>
  );
}
