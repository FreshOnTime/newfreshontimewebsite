'use client';

import { useState, useEffect, useRef, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Product } from '@/models/product';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';
import { scheduleIdleTask } from '@/lib/utils/idleCallback';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface WishlistContextType {
    wishlistItems: Product[];
    loading: boolean;
    error: string | null;
    retry: () => Promise<void>;
    addToWishlist: (product: Product) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function getProductId(product: Product) {
    return (product as unknown as { _id?: string; id?: string })._id
        || (product as unknown as { id?: string }).id;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const userId = user?._id;
    const [state, setState] = useState<{ owner?: string; items: Product[]; loading: boolean; error: string | null }>({ items: [], loading: false, error: null });
    const account = useRef(userId);
    account.current = userId;
    const latestRequest = useRef(0);
    const revision = useRef(0);
    const pending = useRef(new Set<string>());
    const pathname = usePathname();
    const wishlistItems = useMemo(() => state.owner === userId ? state.items : [], [state.owner, state.items, userId]);

    const fetchWishlist = useCallback(async () => {
        if (!userId) return;
        const request = ++latestRequest.current;
        const initialRevision = revision.current;
        setState((current) => ({ owner: userId, items: current.owner === userId ? current.items : [], loading: true, error: null }));
        try {
            const res = await authenticatedApiFetch(`/api/wishlist?userId=${encodeURIComponent(userId)}`);
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Please try again in a moment.');
            if (account.current === userId && request === latestRequest.current && initialRevision === revision.current && pending.current.size === 0) {
                setState({ owner: userId, items: data.data || [], loading: false, error: null });
            }
        } catch (loadError) {
            if (account.current === userId && request === latestRequest.current) {
                setState((current) => ({ ...current, error: loadError instanceof Error ? loadError.message : 'Please try again in a moment.' }));
            }
        } finally {
            if (account.current === userId && request === latestRequest.current) setState((current) => ({ ...current, loading: false }));
        }
    }, [userId]);

    useEffect(() => {
        if (!userId) {
            latestRequest.current++;
            setState({ items: [], loading: false, error: null });
            return;
        }
        setState((current) => current.owner === userId ? current : { owner: userId, items: [], loading: true, error: null });
        if (pathname.startsWith('/wishlist')) {
            void fetchWishlist();
            return;
        }
        const task = scheduleIdleTask(fetchWishlist, { timeout: 4000, fallbackDelayMs: 2500 });
        return () => task.cancel();
    }, [userId, pathname, fetchWishlist]);

    const isInWishlist = useCallback((productId: string) => wishlistItems.some((item) => getProductId(item) === productId), [wishlistItems]);

    const addToWishlist = useCallback(async (product: Product) => {
        if (!userId) { toast.error('Sign in to save products'); return; }
        const productId = getProductId(product);
        if (!productId) { toast.error('This product cannot be saved'); return; }
        const key = `${userId}:${productId}`;
        if (isInWishlist(productId) || pending.current.has(key)) return;
        pending.current.add(key);
        revision.current++;
        setState((current) => ({ owner: userId, items: [...(current.owner === userId ? current.items : []), product], loading: current.loading, error: current.error }));
        try {
            const res = await authenticatedApiFetch('/api/wishlist', { method: 'POST', body: JSON.stringify({ userId, productId }) });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Couldn’t save this product. Try again.');
            if (account.current === userId) toast.success('Added to wishlist');
        } catch (saveError) {
            if (account.current === userId) {
                setState((current) => ({ ...current, items: current.items.filter((item) => getProductId(item) !== productId) }));
                toast.error(saveError instanceof Error ? saveError.message : 'Couldn’t save this product. Try again.');
            }
        } finally { pending.current.delete(key); revision.current++; }
    }, [userId, isInWishlist]);

    const removeFromWishlist = useCallback(async (productId: string) => {
        if (!userId) return;
        const key = `${userId}:${productId}`;
        const index = wishlistItems.findIndex((item) => getProductId(item) === productId);
        const removed = wishlistItems[index];
        if (!removed || pending.current.has(key)) return;
        pending.current.add(key);
        revision.current++;
        setState((current) => ({ ...current, items: current.items.filter((item) => getProductId(item) !== productId) }));
        try {
            const res = await authenticatedApiFetch(`/api/wishlist/${encodeURIComponent(productId)}?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Couldn’t remove this product. Try again.');
            if (account.current === userId) toast.success('Removed from wishlist');
        } catch (saveError) {
            if (account.current === userId) {
                setState((current) => {
                    if (current.items.some((item) => getProductId(item) === productId)) return current;
                    const items = [...current.items];
                    items.splice(Math.min(index, items.length), 0, removed);
                    return { ...current, items };
                });
                toast.error(saveError instanceof Error ? saveError.message : 'Couldn’t remove this product. Try again.');
            }
        } finally { pending.current.delete(key); revision.current++; }
    }, [userId, wishlistItems]);

    const value = useMemo<WishlistContextType>(() => ({
        wishlistItems,
        loading: Boolean(userId && (state.owner !== userId || state.loading)),
        error: state.owner === userId ? state.error : null,
        retry: fetchWishlist,
        addToWishlist, removeFromWishlist, isInWishlist,
    }), [wishlistItems, userId, state.owner, state.loading, state.error, fetchWishlist, addToWishlist, removeFromWishlist, isInWishlist]);
    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) throw new Error('useWishlist must be used within a WishlistProvider');
    return context;
}
