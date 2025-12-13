'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Product } from '@/models/product';
import { toast } from 'sonner';

interface WishlistContextType {
    wishlistItems: Product[];
    loading: boolean;
    addToWishlist: (product: Product) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user?._id) {
            fetchWishlist();
        } else {
            setWishlistItems([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id]);

    const fetchWishlist = async () => {
        if (!user?._id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/wishlist?userId=${user._id}`);
            const data = await res.json();
            if (data.success) {
                setWishlistItems(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch wishlist', error);
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (product: Product) => {
        if (!user?._id) {
            toast.error("Please login to add to wishlist");
            return;
        }

        // Optimistic update
        const productId = product._id || (product as any).id;
        if (!productId) {
            console.error("Product has no ID:", product);
            toast.error("Cannot add to wishlist: Invalid product");
            return;
        }

        if (isInWishlist(productId)) return;

        setWishlistItems(prev => [...prev, product]);

        try {
            const res = await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, productId: productId })
            });
            const data = await res.json();
            if (!data.success) {
                // Revert/Fetch on failure
                fetchWishlist();
                toast.error(data.error || "Failed to add to wishlist");
            } else {
                toast.success("Added to wishlist");
            }
        } catch (error) {
            console.error(error);
            fetchWishlist();
            toast.error("Error adding to wishlist");
        }
    };

    const removeFromWishlist = async (productId: string) => {
        if (!user?._id) return;

        // Optimistic update
        setWishlistItems(prev => prev.filter(p => ((p as any)._id || (p as any).id) !== productId));

        try {
            const res = await fetch(`/api/wishlist/${productId}?userId=${user._id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!data.success) {
                fetchWishlist();
                toast.error("Failed to remove from wishlist");
            } else {
                toast.success("Removed from wishlist");
            }
        } catch (error) {
            console.error(error);
            fetchWishlist();
            toast.error("Error removing from wishlist");
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlistItems.some(item => ((item as any)._id || (item as any).id) === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlistItems, loading, addToWishlist, removeFromWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
