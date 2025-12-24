'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Bag } from '@/models/Bag';
// import { BagItem } from '@/models/BagItem';
import { Product } from '@/models/product';
import { useAuth } from './AuthContext';

// API response interfaces
interface ApiProduct {
  _id?: string;
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

export function BagProvider({ children }: { children: ReactNode }) {
  const [bags, setBags] = useState<Bag[]>([]);
  const [currentBag, setCurrentBag] = useState<Bag | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  // Use authenticated user ObjectId for database queries; don't fallback to a hardcoded id
  const userId = user?._id;
  const router = useRouter();

  const fetchBags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!userId) {
        // Wait until user is available
        return;
      }
      const response = await fetch(`/api/bags?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        const normalizeBag = (bag: ApiBag): Bag => ({
          id: bag._id,
          name: bag.name,
          description: bag.description,
          tags: bag.tags ?? [],
          items: (bag.items || [])
            .filter((it: ApiBagItem) => it && it.product && (it.product as ApiProduct)._id)
            .map((it: ApiBagItem) => {
              const p = it.product as ApiProduct;
              return {
                quantity: it.quantity,
                product: {
                  // UI Product shape extension
                  id: String(p._id || ''),
                  name: p.name || 'Unknown Product',
                  price: it.price,
                  unit: p.measurementType || 'unit',
                  stock: p.stockQuantity || 0,
                  images: p.image ? [{ url: p.image.url, alt: p.image.alt }] : [],
                }
              } as unknown as Bag['items'][number];
            })
        });

        const mappedBags = (data.data || [])
          .filter((bag: ApiBag) => bag && bag._id)
          .map((bag: ApiBag) => normalizeBag(bag));
        setBags(mappedBags);
        // Set first bag as current if none selected
        if (!currentBag && mappedBags.length > 0) {
          setCurrentBag(mappedBags[0]);
        }
      } else {
        setError(data.error || 'Failed to fetch bags');
      }
    } catch (err) {
      setError('Network error while fetching bags');
      console.error('Error fetching bags:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, currentBag]);

  const createBag = useCallback(async (name: string, description?: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!userId) {
        // redirect unauthenticated users to login, preserving current path
        const redirectTo = typeof window !== 'undefined' ? window.location.pathname : '/';
        router.push(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`);
        return;
      }
      const response = await fetch('/api/bags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          items: [],
          tags: []
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        const mappedBag = {
          ...data.data,
          id: data.data._id,
          items: []
        };
        setBags(prev => [mappedBag, ...prev]);
        setCurrentBag(mappedBag);
      } else {
        setError(data.error || 'Failed to create bag');
      }
    } catch (err) {
      setError('Network error while creating bag');
      console.error('Error creating bag:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  const addToBag = useCallback(async (bagId: string, product: Product, quantity: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bags/${bagId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Use database _id when available; fallback to sku only if backend supports it
          productId: (product as unknown as { _id?: string; id?: string })._id
            || (product as unknown as { _id?: string; id?: string }).id
            || (product as unknown as { sku?: string }).sku,
          quantity
        }),
      });

      const data = await response.json();

      if (data.success) {
        const normalize = (bag: ApiBag): Bag => ({
          id: bag._id,
          name: bag.name,
          description: bag.description,
          tags: bag.tags ?? [],
          items: (bag.items || []).map((it: ApiBagItem) => {
            const p = it.product as ApiProduct | null;
            return {
              quantity: it.quantity,
              product: {
                id: String(p?._id || ''),
                name: p?.name || 'Unknown Product',
                price: it.price,
                unit: p?.measurementType || 'unit',
                stock: p?.stockQuantity || 0,
                images: p?.image ? [{ url: p.image.url, alt: p.image.alt }] : []
              }
            } as unknown as Bag['items'][number];
          })
        });

        const normalized = normalize(data.data as ApiBag);
        setBags(prev => prev.map(bag => bag.id === bagId ? normalized : bag));
        if (currentBag?.id === bagId) setCurrentBag(normalized);
      } else {
        setError(data.error || 'Failed to add item to bag');
      }
    } catch (err) {
      setError('Network error while adding item to bag');
      console.error('Error adding to bag:', err);
    } finally {
      setLoading(false);
    }
  }, [currentBag]);

  const removeFromBag = useCallback(async (bagId: string, productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bags/${bagId}/items?productId=${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        const normalize = (bag: ApiBag): Bag => ({
          id: bag._id,
          name: bag.name,
          description: bag.description,
          tags: bag.tags ?? [],
          items: (bag.items || []).map((it: ApiBagItem) => {
            const p = it.product as ApiProduct | null;
            return {
              quantity: it.quantity,
              product: {
                id: String(p?._id || ''),
                name: p?.name || 'Unknown Product',
                price: it.price,
                unit: p?.measurementType || 'unit',
                stock: p?.stockQuantity || 0,
                images: p?.image ? [{ url: p.image.url, alt: p.image.alt }] : []
              }
            } as unknown as Bag['items'][number];
          })
        });

        const normalized = normalize(data.data as ApiBag);
        setBags(prev => prev.map(bag => bag.id === bagId ? normalized : bag));
        if (currentBag?.id === bagId) setCurrentBag(normalized);
      } else {
        setError(data.error || 'Failed to remove item from bag');
      }
    } catch (err) {
      setError('Network error while removing item from bag');
      console.error('Error removing from bag:', err);
    } finally {
      setLoading(false);
    }
  }, [currentBag]);

  const updateBagItem = useCallback(async (bagId: string, productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromBag(bagId, productId);
      return;
    }

    // Optimistic update - update UI immediately
    const bag = bags.find(b => b.id === bagId);
    const item = bag?.items.find(i => i.product.id === productId);
    if (!item) return;

    // Store previous state for rollback
    const previousBags = bags;
    const previousCurrentBag = currentBag;

    // Optimistically update the quantity in state
    const updatedBag: Bag = {
      ...bag!,
      items: bag!.items.map(i =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    };
    setBags(prev => prev.map(b => b.id === bagId ? updatedBag : b));
    if (currentBag?.id === bagId) setCurrentBag(updatedBag);

    // Perform actual API update in background
    setUpdating(true);
    try {
      await removeFromBag(bagId, productId);
      await addToBag(bagId, item.product, quantity);
    } catch (err) {
      // Rollback on error
      setBags(previousBags);
      setCurrentBag(previousCurrentBag);
      console.error('Error updating quantity:', err);
    } finally {
      setUpdating(false);
    }
  }, [bags, currentBag, removeFromBag, addToBag]);

  const deleteBag = useCallback(async (bagId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bags/${bagId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setBags(prev => prev.filter(bag => bag.id !== bagId));
        if (currentBag?.id === bagId) {
          setCurrentBag(null);
          fetchBags();
        }
      } else {
        setError(data.error || 'Failed to delete bag');
      }
    } catch (err) {
      setError('Network error while deleting bag');
      console.error('Error deleting bag:', err);
    } finally {
      setLoading(false);
    }
  }, [currentBag, fetchBags]);

  const selectBag = useCallback((bagId: string) => {
    const bag = bags.find(b => b.id === bagId);
    if (bag) {
      setCurrentBag(bag);
    }
  }, [bags]);

  const getTotalItems = useCallback((bagId: string): number => {
    const bag = bags.find(b => b.id === bagId);
    return bag?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  }, [bags]);

  const getTotalPrice = useCallback((bagId: string): number => {
    const bag = bags.find(b => b.id === bagId);
    return bag?.items.reduce((total, item) => total + (item.product.price * item.quantity), 0) || 0;
  }, [bags]);

  useEffect(() => {
    fetchBags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const value = {
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
  };

  return (
    <BagContext.Provider
      value={useMemo(() => value, [value])}
    >
      {children}
    </BagContext.Provider>
  );
}

export function useBag() {
  const context = useContext(BagContext);
  if (context === undefined) {
    throw new Error('useBag must be used within a BagProvider');
  }
  return context;
}
