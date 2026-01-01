'use client';

import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Skeleton */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <div className="h-8 w-48 bg-emerald-100 rounded-full animate-pulse mb-4" />
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse mb-4" />
            <div className="h-12 w-3/4 bg-gray-200 rounded-lg animate-pulse mb-6" />
            <div className="h-5 w-full bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-5 w-2/3 bg-gray-100 rounded animate-pulse mb-8" />
            <div className="h-12 w-40 bg-emerald-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-emerald-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg font-medium">Loading fresh products...</span>
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="aspect-square bg-gray-100 rounded-lg animate-pulse mb-3" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse mb-3" />
              <div className="h-6 w-2/3 bg-emerald-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
