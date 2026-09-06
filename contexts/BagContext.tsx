'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bag } from '@/models/Bag';
import { Product } from '@/models/product';
import { apiFetch } from '@/lib/api/client';
import { scheduleIdleTask } from '@/lib/utils/idleCallback';
import { useAuth } from './AuthContext';

interface ApiProduct {
  _id?: string;
  id?: string;
  name?: string;
  image?: { url: string; alt: string };
  measurementType?: string;
  stockQuantity?: number;
}

interface ApiBagItem {
  product: ApiProduct | null;
  quantity: number;
  price: number;
}

interface ApiBag {
  _id: string;
  name: string;
  description?: string;
  tags: string[];
  items: ApiBagItem[];
}

interface BagContextType {
  bags: Bag[];
  currentBag: Bag | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
  createBag: (name: string, description?: string) => Promise<void>;
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

function normalizeBag(bag: ApiBag): Bag {
  return {
    id: bag._id,
    name: bag.name,
    description: bag.description,
    tags: bag.tags ?? [],
    items: (bag.items || [])
      .filter((item) => item?.product && (item.product._id || item.product.id))
      .map((item) => {
        const product = item.product as ApiProduct;
        return {
          quantity: item.quantity,
          product: {
            id: String(product._id || product.id || ''),
            name: product.name || 'Unknown Product',
            price: item.price,
            unit: product.measurementType || 'unit',
            stock: product.stockQuantity || 0,
            images: product.image ? [{ url: product.image.url, alt: product.image.alt }] : [],
          },
        } as unknown as Bag['items'][number];
      }),
  };
}

function getProductId(product: Product) {
  return (product as unknown as { _id?: string; id?: string })._id
    || (product as unknown as { id?: string }).id
    || (product as unknown as { sku?: string }).sku;
}

export function BagProvider({ children }: { children: ReactNode }) {
  const [bags, setBags] = useState<Bag[]>([]);
  const [currentBag, setCurrentBag] = useState<Bag | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const userId = user?._id;
  const router = useRouter();
  const pathname = usePathname();

  const replaceBag = useCallback((bagId: string, nextBag: ApiBag) => {
    const normalized = normalizeBag(nextBag);
    setBags((previous) => previous.map((bag) => bag.id === bagId ? normalized : bag));
    setCurrentBag((previous) => previous?.id === bagId ? normalized : previous);
  }, []);

  const fetchBags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!userId) return;

      const response = await apiFetch(`/api/bags?userId=${encodeURIComponent(userId)}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch bags');
      }

      const mappedBags = (data.data || [])
        .filter((bag: ApiBag) => bag && bag._id)
        .map((bag: ApiBag) => normalizeBag(bag));

      setBags(mappedBags);
      setCurrentBag((previous) => {
        if (previous) {
          return mappedBags.find((bag: Bag) => bag.id === previous.id) || mappedBags[0] || null;
        }
        return mappedBags[0] || null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error while fetching bags');
      console.error('Error fetching bags:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createBag = useCallback(async (name: string, description?: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!userId) {
        const redirectTo = typeof window !== 'undefined' ? window.location.pathname : '/';
        router.push(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`);
        return;
      }

      const response = await apiFetch('/api/bags', {
        method: 'POST',
        body: JSON.stringify({ name, description, items: [], tags: [] }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create bag');
      }

      const mappedBag = normalizeBag(data.data as ApiBag);
      setBags((previous) => [mappedBag, ...previous]);
      setCurrentBag(mappedBag);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error while creating bag');
      console.error('Error creating bag:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  const addToBag = useCallback(async (bagId: string, product: Product, quantity: number) => {
    setLoading(true);
    setError(null);
    try {
      const productId = getProductId(product);
      if (!productId) throw new Error('Product ID is missing');

      const response = await apiFetch(`/api/bags/${encodeURIComponent(bagId)}/items`, {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to add item to bag');
      }

      replaceBag(bagId, data.data as ApiBag);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error while adding item to bag');
      console.error('Error adding to bag:', err);
    } finally {
      setLoading(false);
    }
  }, [replaceBag]);

  const removeFromBag = useCallback(async (bagId: string, productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(
        `/api/bags/${encodeURIComponent(bagId)}/items?productId=${encodeURIComponent(productId)}`,
        { method: 'DELETE' },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to remove item from bag');
      }

      replaceBag(bagId, data.data as ApiBag);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error while removing item from bag');
      console.error('Error removing from bag:', err);
    } finally {
      setLoading(false);
    }
  }, [replaceBag]);

  const updateBagItem = useCallback(async (bagId: string, productId: string, quantity: number) => {
    const bag = bags.find((candidate) => candidate.id === bagId);
    const item = bag?.items.find((candidate) => candidate.product.id === productId);
    if (!bag || !item) return;

    const previousBags = bags;
    const previousCurrentBag = currentBag;

    const updatedBag: Bag = {
      ...bag,
      items: quantity <= 0
        ? bag.items.filter((candidate) => candidate.product.id !== productId)
        : bag.items.map((candidate) =>
            candidate.product.id === productId ? { ...candidate, quantity } : candidate
          ),
    };

    setBags((previous) => previous.map((candidate) => candidate.id === bagId ? updatedBag : candidate));
    if (currentBag?.id === bagId) setCurrentBag(updatedBag);

    setUpdating(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/bags/${encodeURIComponent(bagId)}/items`, {
        method: 'PATCH',
        body: JSON.stringify({ productId, quantity: Math.max(0, quantity) }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update quantity');
      }

      replaceBag(bagId, data.data as ApiBag);
    } catch (err) {
      setBags(previousBags);
      setCurrentBag(previousCurrentBag);
      setError(err instanceof Error ? err.message : 'Network error while updating quantity');
      console.error('Error updating quantity:', err);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [bags, currentBag, replaceBag]);

  const deleteBag = useCallback(async (bagId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/bags/${encodeURIComponent(bagId)}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete bag');
      }

      setBags((previous) => previous.filter((bag) => bag.id !== bagId));
      setCurrentBag((previous) => previous?.id === bagId ? null : previous);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error while deleting bag');
      console.error('Error deleting bag:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectBag = useCallback((bagId: string) => {
    const bag = bags.find((candidate) => candidate.id === bagId);
    if (bag) setCurrentBag(bag);
  }, [bags]);

  const getTotalItems = useCallback((bagId: string): number => {
    const bag = bags.find((candidate) => candidate.id === bagId);
    return bag?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  }, [bags]);

  const getTotalPrice = useCallback((bagId: string): number => {
    const bag = bags.find((candidate) => candidate.id === bagId);
    return bag?.items.reduce((total, item) => total + (item.product.price * item.quantity), 0) || 0;
  }, [bags]);

  useEffect(() => {
    if (!userId) {
      setBags([]);
      setCurrentBag(null);
      setLoading(false);
      return;
    }

    if (pathname.startsWith('/bags') || pathname.startsWith('/checkout')) {
      fetchBags();
      return;
    }

    const task = scheduleIdleTask(fetchBags, {
      timeout: 4000,
      fallbackDelayMs: 2500,
    });
    return () => task.cancel();
  }, [userId, pathname, fetchBags]);

  const value = useMemo<BagContextType>(() => ({
    bags,
    currentBag,
    loading,
    updating,
    error,
    createBag,
    addToBag,
    removeFromBag,
    updateBagItem,
    deleteBag,
    fetchBags,
    selectBag,
    getTotalItems,
    getTotalPrice,
  }), [
    bags,
    currentBag,
    loading,
    updating,
    error,
    createBag,
    addToBag,
    removeFromBag,
    updateBagItem,
    deleteBag,
    fetchBags,
    selectBag,
    getTotalItems,
    getTotalPrice,
  ]);

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag() {
  const context = useContext(BagContext);
  if (context === undefined) {
    throw new Error('useBag must be used within a BagProvider');
  }
  return context;
}
