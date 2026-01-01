'use client';

import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Skeleton */}
            <div className="bg-white border-b py-4">
                <div className="container mx-auto px-4">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>

            {/* Filters Skeleton */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex gap-4 mb-6">
                    <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
                </div>

                {/* Loading Indicator */}
                <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-emerald-600">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="font-medium">Loading products...</span>
                    </div>
                </div>

                {/* Products Grid Skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-100 p-3">
                            <div className="aspect-square bg-gray-100 rounded-lg animate-pulse mb-3" />
                            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                            <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse mb-2" />
                            <div className="h-5 w-2/3 bg-emerald-100 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
