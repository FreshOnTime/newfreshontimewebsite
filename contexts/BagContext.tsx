'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bag } from '@/models/Bag';
import { Product } from '@/models/product';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';
import { scheduleIdleTask } from '@/lib/utils/idleCallback';
import { useAuth } from './AuthContext';
import { normalizeBag, type ApiBag } from '@/lib/normalizeBag';

interface BagContextType {
  bags: Bag[];
  currentBag: Bag | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
  createBag: (name: string, description?: string, initialItem?: { product: Product; quantity: number }) => Promise<Bag>;
  addToBag: (bagId: string, product: Product, quantity: number) => Promise<void>;
  removeFromBag: (bagId: string, productId: string) => Promise<void>;
  updateBagItem: (bagId: string, productId: string, quantity: number) => Promise<void>;
  deleteBag: (bagId: string) => Promise<void>;
  fetchBags: () => Promise<void>;
  selectBag: (bagId: string) => void;
  getTotalItems: (bagId: string) => number;
  getTotalPrice: (bagId: string) => number;
}

const BagContext = createContext<BagContextType | undefined>(undefined);

function getProductId(product: Product) {
  return (product as unknown as { _id?: string; id?: string })._id
    || (product as unknown as { id?: string }).id
    || (product as unknown as { sku?: string }).sku;
}

type BagState = {
  account: object | null;
  bags: Bag[];
  selectedId: string | null;
  reading: boolean;
  pending: number;
  error: string | null;
};

const replaceBag = (current: BagState, next: Bag): BagState => ({ ...current, bags: current.bags.some((bag) => bag.id === next.id) ? current.bags.map((bag) => bag.id === next.id ? next : bag) : [next, ...current.bags] });

export function BagProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?._id;
  const router = useRouter();
  const pathname = usePathname();
  // A new session object also distinguishes signing out and back into the same
  // account. Responses from a previous session must never repopulate the cart.
  const sessionRef = useRef({ userId, revision: 0, request: 0, pending: 0, tail: Promise.resolve(), controller: new AbortController() });
  if (sessionRef.current.userId !== userId) {
    sessionRef.current = { userId, revision: 0, request: 0, pending: 0, tail: Promise.resolve(), controller: new AbortController() };
  }
  const session = sessionRef.current;
  const [state, setState] = useState<BagState>({ account: null, bags: [], selectedId: null, reading: false, pending: 0, error: null });
  const owned = state.account === session;
  const bags = useMemo(() => owned ? state.bags : [], [owned, state.bags]);
  const currentBag = bags.find((bag) => bag.id === state.selectedId) || null;
  const loading = Boolean(userId && (!owned || state.reading || state.pending > 0));
  const updating = owned && state.pending > 0;
  const error = owned ? state.error : null;

  const fetchBags = useCallback(async (preserveError = false) => {
    if (!session.userId || session.pending > 0) return;
    const request = ++session.request;
    const revision = session.revision;
    setState((current) => ({ account: session, bags: current.account === session ? current.bags : [], selectedId: current.account === session ? current.selectedId : null, reading: true, pending: session.pending, error: preserveError && current.account === session ? current.error : null }));
    const isCurrent = () => sessionRef.current === session && request === session.request && revision === session.revision;
    try {
      const response = await authenticatedApiFetch('/api/bags', { cache: 'no-store', signal: session.controller.signal });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to fetch bags');
      const nextBags: Bag[] = (data.data || []).filter((bag: ApiBag) => bag && bag._id).map(normalizeBag);
      if (isCurrent()) setState((current) => ({ ...current, bags: nextBags, selectedId: nextBags.find((bag) => bag.id === current.selectedId)?.id || nextBags[0]?.id || null, reading: false }));
    } catch (failure) {
      if (isCurrent()) setState((current) => ({ ...current, error: failure instanceof Error ? failure.message : 'Could not load your bags' }));
    } finally {
      if (isCurrent()) setState((current) => ({ ...current, reading: false }));
    }
  }, [session]);

  const mutate = useCallback(async <T,>(operation: () => Promise<T>, apply: (current: BagState, result: T) => BagState): Promise<T> => {
    if (!session.userId || sessionRef.current !== session) throw new Error('Please sign in to update your bag');
    session.pending++;
    session.revision++;
    setState((current) => ({ account: session, bags: current.account === session ? current.bags : [], selectedId: current.account === session ? current.selectedId : null, reading: false, pending: session.pending, error: null }));
    // Serialise writes so two rapid absolute-quantity changes cannot finish in
    // reverse order or roll back another item. No whole-cart optimistic rollback.
    const task = session.tail.then(async () => {
      if (sessionRef.current !== session) throw new Error('Your account changed. Please try again.');
      const result = await operation();
      if (sessionRef.current !== session) throw new Error('Your account changed. Please try again.');
      setState((current) => apply(current, result));
      return result;
    });
    session.tail = task.then(() => undefined, () => undefined);
    try { return await task; }
    catch (failure) {
      if (sessionRef.current === session) setState((current) => ({ ...current, error: failure instanceof Error ? failure.message : 'Could not update your bag' }));
      throw failure;
    } finally {
      session.pending--;
      session.revision++;
      if (sessionRef.current === session) {
        setState((current) => ({ ...current, pending: session.pending }));
        // Recover the full list if a background load overlapped this write.
        if (session.pending === 0) void fetchBags(true);
      }
    }
  }, [session, fetchBags]);

  const bagRequest = useCallback(async (path: string, init: RequestInit): Promise<Bag> => {
    const response = await authenticatedApiFetch(path, { ...init, signal: session.controller.signal });
    const data = await response.json();
    if (!response.ok || !data.success || !data.data) throw new Error(data.error || 'Could not update your bag');
    return normalizeBag(data.data as ApiBag);
  }, [session]);

  const createBag = useCallback(async (name: string, description?: string, initialItem?: { product: Product; quantity: number }) => {
    if (!userId) {
      const returnUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
      router.push(`/auth/login?redirect=${encodeURIComponent(returnUrl)}`);
      throw new Error('Please sign in to create a bag');
    }
    const productId = initialItem ? getProductId(initialItem.product) : null;
    if (initialItem && (!productId || !Number.isSafeInteger(initialItem.quantity) || initialItem.quantity < 1 || initialItem.quantity > 10000)) throw new Error('Choose a valid product quantity');
    return mutate(() => bagRequest('/api/bags', { method: 'POST', body: JSON.stringify({ name: name.trim(), description, items: initialItem ? [{ productId, quantity: initialItem.quantity }] : [], tags: [] }) }), (current, next) => ({ ...replaceBag(current, next), selectedId: next.id }));
  }, [userId, router, mutate, bagRequest]);

  const addToBag = useCallback(async (bagId: string, product: Product, quantity: number) => {
    const productId = getProductId(product);
    if (!productId || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10000) throw new Error('Choose a valid product quantity');
    await mutate(() => bagRequest(`/api/bags/${encodeURIComponent(bagId)}/items`, { method: 'POST', body: JSON.stringify({ productId, quantity }) }), replaceBag);
  }, [mutate, bagRequest]);

  const removeFromBag = useCallback(async (bagId: string, productId: string) => {
    await mutate(() => bagRequest(`/api/bags/${encodeURIComponent(bagId)}/items?productId=${encodeURIComponent(productId)}`, { method: 'DELETE' }), replaceBag);
  }, [mutate, bagRequest]);

  const updateBagItem = useCallback(async (bagId: string, productId: string, quantity: number) => {
    if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > 10000) throw new Error('Please choose a valid quantity');
    await mutate(() => bagRequest(`/api/bags/${encodeURIComponent(bagId)}/items`, { method: 'PATCH', body: JSON.stringify({ productId, quantity }) }), replaceBag);
  }, [mutate, bagRequest]);

  const deleteBag = useCallback(async (bagId: string) => {
    await mutate(async () => {
      const response = await authenticatedApiFetch(`/api/bags/${encodeURIComponent(bagId)}`, { method: 'DELETE', signal: session.controller.signal });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to delete bag');
      return bagId;
    }, (current, id) => ({ ...current, bags: current.bags.filter((bag) => bag.id !== id), selectedId: current.selectedId === id ? current.bags.find((bag) => bag.id !== id)?.id || null : current.selectedId }));
  }, [mutate, session]);

  const selectBag = useCallback((bagId: string) => {
    if (bags.some((bag) => bag.id === bagId)) setState((current) => ({ ...current, selectedId: bagId }));
  }, [bags]);
  const getTotalItems = useCallback((bagId: string) => bags.find((bag) => bag.id === bagId)?.items.reduce((total, item) => total + item.quantity, 0) || 0, [bags]);
  const getTotalPrice = useCallback((bagId: string) => bags.find((bag) => bag.id === bagId)?.items.reduce((total, item) => total + item.product.price * item.quantity, 0) || 0, [bags]);

  useEffect(() => {
    if (session.controller.signal.aborted) session.controller = new AbortController();
    return () => { session.request++; session.controller.abort(); };
  }, [session]);

  useEffect(() => {
    if (!userId) {
      setState({ account: session, bags: [], selectedId: null, reading: false, pending: 0, error: null });
      return;
    }
    if (pathname.startsWith('/bags') || pathname.startsWith('/checkout')) { void fetchBags(); return; }
    const task = scheduleIdleTask(fetchBags, { timeout: 4000, fallbackDelayMs: 2500 });
    return () => task.cancel();
  }, [userId, session, pathname, fetchBags]);

  const value = useMemo<BagContextType>(() => ({ bags, currentBag, loading, updating, error, createBag, addToBag, removeFromBag, updateBagItem, deleteBag, fetchBags, selectBag, getTotalItems, getTotalPrice }), [bags, currentBag, loading, updating, error, createBag, addToBag, removeFromBag, updateBagItem, deleteBag, fetchBags, selectBag, getTotalItems, getTotalPrice]);
  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag() {
  const context = useContext(BagContext);
  if (context === undefined) {
    throw new Error('useBag must be used within a BagProvider');
  }
  return context;
}
