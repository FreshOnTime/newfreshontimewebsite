"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Cache configuration
const CACHE_VERSION = "v1";
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  forceRefresh?: boolean; // Bypass cache and fetch fresh data
  onError?: (error: Error) => void;
}

interface UseCacheResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  clearCache: () => void;
}

// Utility functions for localStorage operations
function getCacheKey(key: string): string {
  return `cache_${CACHE_VERSION}_${key}`;
}

function getFromCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const cacheKey = getCacheKey(key);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    
    // Check version
    if (entry.version !== CACHE_VERSION) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

function setToCache<T>(key: string, data: T, ttl: number): void {
  if (typeof window === "undefined") return;

  try {
    const cacheKey = getCacheKey(key);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version: CACHE_VERSION,
    };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    // Handle quota exceeded or other storage errors
    console.warn("Failed to cache data:", error);
    // Try to clear old cache entries if storage is full
    clearOldCacheEntries();
  }
}

function removeFromCache(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getCacheKey(key));
  } catch {
    // Ignore errors
  }
}

function clearOldCacheEntries(): void {
  if (typeof window === "undefined") return;

  try {
    const keysToRemove: string[] = [];
    const now = Date.now();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("cache_")) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry = JSON.parse(cached);
            // Remove if expired or wrong version
            if (entry.version !== CACHE_VERSION || now - entry.timestamp > entry.ttl) {
              keysToRemove.push(key);
            }
          }
        } catch {
          keysToRemove.push(key || "");
        }
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore errors
  }
}

/**
 * Custom hook for caching API data in localStorage
 * 
 * @param cacheKey - Unique key for caching
 * @param fetcher - Async function to fetch data
 * @param options - Cache options (ttl, forceRefresh, onError)
 * @returns { data, isLoading, error, refresh, clearCache }
 */
export function useLocalStorageCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): UseCacheResult<T> {
  const { ttl = DEFAULT_TTL, forceRefresh = false, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);
  const isMounted = useRef(true);

  // Update fetcher ref when it changes
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const fetchData = useCallback(async (skipCache = false) => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    setError(null);

    // Try to get from cache first (unless forceRefresh or skipCache)
    if (!skipCache && !forceRefresh) {
      const cached = getFromCache<T>(cacheKey);
      if (cached !== null) {
        setData(cached);
        setIsLoading(false);
        return;
      }
    }

    // Fetch fresh data
    try {
      const freshData = await fetcherRef.current();
      if (!isMounted.current) return;
      
      setData(freshData);
      setToCache(cacheKey, freshData, ttl);
    } catch (err) {
      if (!isMounted.current) return;
      
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      
      // Try to use stale cache on error
      const staleData = getFromCache<T>(cacheKey);
      if (staleData !== null) {
        setData(staleData);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [cacheKey, ttl, forceRefresh, onError]);

  // Initial load
  useEffect(() => {
    isMounted.current = true;
    fetchData();
    
    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    removeFromCache(cacheKey);
    setData(null);
  }, [cacheKey]);

  return { data, isLoading, error, refresh, clearCache };
}

/**
 * Simple function to fetch with cache - for use outside of hooks
 */
export async function fetchWithCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  // Check cache first
  const cached = getFromCache<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Fetch and cache
  const data = await fetcher();
  setToCache(cacheKey, data, ttl);
  return data;
}

/**
 * Invalidate specific cache entry
 */
export function invalidateCache(cacheKey: string): void {
  removeFromCache(cacheKey);
}

/**
 * Invalidate all cache entries matching a pattern
 */
export function invalidateCachePattern(pattern: string): void {
  if (typeof window === "undefined") return;

  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes(pattern)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore errors
  }
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  if (typeof window === "undefined") return;

  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("cache_")) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore errors
  }
}

// Cache TTL presets for common use cases
export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
  DAY: 24 * 60 * 60 * 1000,  // 24 hours
} as const;
