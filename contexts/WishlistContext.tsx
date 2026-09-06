'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Product } from '@/models/product';
import { apiFetch } from '@/lib/api/client';
import { scheduleIdleTask } from '@/lib/utils/idleCallback';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface WishlistContextType {
    wishlistItems: Product[];
    loading: boolean;
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
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const pathname = usePathname();

    const fetchWishlist = useCallback(async () => {
        if (!user?._id) return;
        setLoading(true);
        try {
            const res = await apiFetch(`/api/wishlist?userId=${encodeURIComponent(user._id)}`);
            const data = await res.json();
            if (res.ok && data.success) {
                setWishlistItems(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch wishlist', error);
        } finally {
            setLoading(false);
        }
    }, [user?._id]);

    useEffect(() => {
        if (!user?._id) {
            setWishlistItems([]);
            return;
        }

        if (pathname.startsWith('/wishlist')) {
            fetchWishlist();
            return;
        }

        const task = scheduleIdleTask(fetchWishlist, {
            timeout: 4000,
            fallbackDelayMs: 2500,
        });
        return () => task.cancel();
    }, [user?._id, pathname, fetchWishlist]);

    const isInWishlist = useCallback((productId: string) => {
        return wishlistItems.some((item) => getProductId(item) === productId);
    }, [wishlistItems]);

    const addToWishlist = useCallback(async (product: Product) => {
        if (!user?._id) {
            toast.error('Please login to add to wishlist');
            return;
        }

        const productId = getProductId(product);
        if (!productId) {
            console.error('Product has no ID:', product);
            toast.error('Cannot add to wishlist: Invalid product');
            return;
        }

        if (isInWishlist(productId)) return;

        setWishlistItems((previous) => [...previous, product]);

        try {
            const res = await apiFetch('/api/wishlist', {
                method: 'POST',
                body: JSON.stringify({ userId: user._id, productId }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                await fetchWishlist();
                toast.error(data.error || 'Failed to add to wishlist');
                return;
            }
            toast.success('Added to wishlist');
        } catch (error) {
            console.error(error);
            await fetchWishlist();
            toast.error('Error adding to wishlist');
        }
    }, [user?._id, isInWishlist, fetchWishlist]);

    const removeFromWishlist = useCallback(async (productId: string) => {
        if (!user?._id) return;

        setWishlistItems((previous) => previous.filter((product) => getProductId(product) !== productId));

        try {
            const res = await apiFetch(
                `/api/wishlist/${encodeURIComponent(productId)}?userId=${encodeURIComponent(user._id)}`,
                { method: 'DELETE' },
            );
            const data = await res.json();
            if (!res.ok || !data.success) {
                await fetchWishlist();
                toast.error('Failed to remove from wishlist');
                return;
            }
            toast.success('Removed from wishlist');
        } catch (error) {
            console.error(error);
            await fetchWishlist();
            toast.error('Error removing from wishlist');
        }
    }, [user?._id, fetchWishlist]);

    const value = useMemo<WishlistContextType>(() => ({
        wishlistItems,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
    }), [wishlistItems, loading, addToWishlist, removeFromWishlist, isInWishlist]);

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
