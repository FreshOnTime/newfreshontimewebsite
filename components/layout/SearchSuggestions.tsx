"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Clock, TrendingUp, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchResult {
    _id: string;
    sku: string;
    name: string;
    image?: { url: string };
    pricePerBaseQuantity: number;
}

interface SearchSuggestionsProps {
    isOpen: boolean;
    onClose: () => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
}

const RECENT_SEARCHES_KEY = "freshpick_recent_searches";
const MAX_RECENT = 5;

export default function SearchSuggestions({
    isOpen,
    onClose,
    inputRef,
}: SearchSuggestionsProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Load recent searches from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
            try {
                setRecentSearches(JSON.parse(stored));
            } catch {
                setRecentSearches([]);
            }
        }
    }, []);

    // Debounced search
    useEffect(() => {
        if (!query.trim() || query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch(
                    `/api/products?search=${encodeURIComponent(query)}&limit=5`
                );
                if (res.ok) {
                    const data = await res.json();
                    setResults(data.data?.products || []);
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!isOpen) return;

            const items = query ? results : recentSearches;
            const maxIndex = items.length - 1;

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((i) => Math.min(i + 1, maxIndex));
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((i) => Math.max(i - 1, -1));
                    break;
                case "Enter":
                    e.preventDefault();
                    if (selectedIndex >= 0) {
                        if (query && results[selectedIndex]) {
                            navigateToProduct(results[selectedIndex]);
                        } else if (!query && recentSearches[selectedIndex]) {
                            handleRecentClick(recentSearches[selectedIndex]);
                        }
                    } else if (query) {
                        handleSearch(query);
                    }
                    break;
                case "Escape":
                    onClose();
                    break;
            }
        },
        [isOpen, query, results, recentSearches, selectedIndex]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // Reset selected index when results change
    useEffect(() => {
        setSelectedIndex(-1);
    }, [results, recentSearches]);

    const saveRecentSearch = (term: string) => {
        const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(
            0,
            MAX_RECENT
        );
        setRecentSearches(updated);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem(RECENT_SEARCHES_KEY);
    };

    const handleSearch = (term: string) => {
        if (!term.trim()) return;
        saveRecentSearch(term);
        router.push(`/search?q=${encodeURIComponent(term)}`);
        onClose();
    };

    const handleRecentClick = (term: string) => {
        setQuery(term);
        handleSearch(term);
    };

    const navigateToProduct = (product: SearchResult) => {
        saveRecentSearch(product.name);
        router.push(`/products/${product.sku}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            ref={containerRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
        >
            {/* Search Input */}
            <div className="p-4 border-b border-zinc-100">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && query) {
                                handleSearch(query);
                            }
                        }}
                        placeholder="Search products..."
                        className="w-full pl-12 pr-10 py-3 bg-zinc-50 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        autoFocus
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="p-4 text-center text-zinc-500">
                    <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" />
                </div>
            )}

            {/* Search Results */}
            {!isLoading && query && results.length > 0 && (
                <div className="p-2">
                    <p className="px-3 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                        Products
                    </p>
                    {results.map((product, index) => (
                        <button
                            key={product._id || product.sku}
                            onClick={() => navigateToProduct(product)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${selectedIndex === index
                                    ? "bg-emerald-50"
                                    : "hover:bg-zinc-50"
                                }`}
                        >
                            <div className="w-12 h-12 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0">
                                {product.image?.url ? (
                                    <Image
                                        src={product.image.url}
                                        alt={product.name}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                        <Search className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-medium text-zinc-900 line-clamp-1">
                                    {product.name}
                                </p>
                                <p className="text-sm text-emerald-600 font-medium">
                                    Rs. {product.pricePerBaseQuantity?.toFixed(2)}
                                </p>
                            </div>
                        </button>
                    ))}
                    {results.length > 0 && (
                        <Link
                            href={`/search?q=${encodeURIComponent(query)}`}
                            onClick={onClose}
                            className="block text-center py-3 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                        >
                            View all results →
                        </Link>
                    )}
                </div>
            )}

            {/* No Results */}
            {!isLoading && query && results.length === 0 && (
                <div className="p-6 text-center text-zinc-500">
                    <p>No products found for &quot;{query}&quot;</p>
                </div>
            )}

            {/* Recent Searches (when no query) */}
            {!query && recentSearches.length > 0 && (
                <div className="p-2">
                    <div className="flex items-center justify-between px-3 py-2">
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Recent
                        </p>
                        <button
                            onClick={clearRecentSearches}
                            className="text-xs text-zinc-400 hover:text-zinc-600"
                        >
                            Clear
                        </button>
                    </div>
                    {recentSearches.map((term, index) => (
                        <button
                            key={term}
                            onClick={() => handleRecentClick(term)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${selectedIndex === index
                                    ? "bg-emerald-50"
                                    : "hover:bg-zinc-50"
                                }`}
                        >
                            <Clock className="w-4 h-4 text-zinc-400" />
                            <span className="text-zinc-700">{term}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Popular Searches (when no query and no recent) */}
            {!query && recentSearches.length === 0 && (
                <div className="p-6 text-center text-zinc-500">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                    <p className="text-sm">Start typing to search products</p>
                </div>
            )}
        </div>
    );
}
