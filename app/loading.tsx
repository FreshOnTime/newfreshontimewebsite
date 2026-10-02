'use client';

import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <div className="bg-background py-8 md:py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <div className="h-8 w-48 bg-secondary rounded-full animate-pulse mb-4" />
            <div className="h-12 w-full bg-secondary rounded-lg animate-pulse mb-4" />
            <div className="h-12 w-3/4 bg-secondary rounded-lg animate-pulse mb-6" />
            <div className="h-5 w-full bg-background rounded animate-pulse mb-2" />
            <div className="h-5 w-2/3 bg-background rounded animate-pulse mb-8" />
            <div className="h-12 w-40 bg-secondary rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="flex items-center justify-center py-6">
        <div className="flex items-center gap-3 text-brand-green">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg font-medium">Loading fresh products...</span>
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-secondary rounded animate-pulse mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-background rounded-lg border border-border p-4">
              <div className="aspect-square bg-background rounded-lg animate-pulse mb-3" />
              <div className="h-4 w-3/4 bg-secondary rounded animate-pulse mb-2" />
              <div className="h-4 w-1/2 bg-background rounded animate-pulse mb-3" />
              <div className="h-6 w-2/3 bg-secondary rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
