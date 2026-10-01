export function ProductCardSkeleton() {
    return (
        <div className="w-full overflow-hidden bg-card rounded-xl border border-border animate-pulse">
            <div className="relative overflow-hidden bg-background">
                <div className="aspect-square p-6">
                    <div className="h-full w-full bg-zinc-200 rounded-xl" />
                </div>
            </div>
            <div className="p-5 space-y-3">
                <div className="h-6 bg-zinc-200 rounded w-3/4" />
                <div className="h-4 bg-zinc-200 rounded w-1/2" />
                <div className="space-y-2 pt-2">
                    <div className="h-6 bg-zinc-200 rounded w-1/3" />
                    <div className="h-10 bg-zinc-200 rounded-full w-full" />
                </div>
            </div>
        </div>
    );
}

interface ProductGridSkeletonProps {
    count?: number;
}

export function ProductGridSkeleton({ count = 6 }: ProductGridSkeletonProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}
