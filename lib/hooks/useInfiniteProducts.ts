"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Product } from "@/models/product";

interface UseInfiniteProductsOptions {
    initialProducts?: Product[];
    limit?: number;
    category?: string;
    search?: string;
}

interface UseInfiniteProductsReturn {
    products: Product[];
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    error: string | null;
    loadMore: () => void;
    sentinelRef: React.RefObject<HTMLDivElement | null>;
}

export function useInfiniteProducts({
    initialProducts = [],
    limit = 12,
    category,
    search,
}: UseInfiniteProductsOptions = {}): UseInfiniteProductsReturn {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(initialProducts.length === 0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Build query string
    const buildQueryString = useCallback(
        (pageNum: number) => {
            const params = new URLSearchParams();
            params.set("limit", String(limit));
            params.set("page", String(pageNum));
            if (category) params.set("category", category);
            if (search) params.set("search", search);
            return params.toString();
        },
        [limit, category, search]
    );

    // Fetch products
    const fetchProducts = useCallback(
        async (pageNum: number, append = false) => {
            try {
                if (append) {
                    setIsLoadingMore(true);
                } else {
                    setIsLoading(true);
                }
                setError(null);

                const response = await fetch(
                    `/api/products?${buildQueryString(pageNum)}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch products");
                }

                const data = await response.json();
                const newProducts: Product[] = data.data?.products || [];

                if (newProducts.length < limit) {
                    setHasMore(false);
                }

                if (append) {
                    setProducts((prev) => {
                        // Deduplicate by SKU
                        const existingSkus = new Set(prev.map((p) => p.sku));
                        const uniqueNew = newProducts.filter(
                            (p) => !existingSkus.has(p.sku)
                        );
                        return [...prev, ...uniqueNew];
                    });
                } else {
                    setProducts(newProducts);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        },
        [buildQueryString, limit]
    );

    // Load more handler
    const loadMore = useCallback(() => {
        if (isLoadingMore || !hasMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, true);
    }, [page, isLoadingMore, hasMore, fetchProducts]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    loadMore();
                }
            },
            { rootMargin: "200px" }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, isLoadingMore, loadMore]);

    // Initial fetch
    useEffect(() => {
        if (initialProducts.length === 0) {
            fetchProducts(1);
        }
    }, [fetchProducts, initialProducts.length]);

    // Reset when filters change
    useEffect(() => {
        setProducts([]);
        setPage(1);
        setHasMore(true);
        fetchProducts(1);
    }, [category, search, fetchProducts]);

    return {
        products,
        isLoading,
        isLoadingMore,
        hasMore,
        error,
        loadMore,
        sentinelRef,
    };
}
