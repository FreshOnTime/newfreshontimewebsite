export function ProductCardSkeleton() {
    return (
        <div aria-hidden="true" className="w-full animate-pulse motion-reduce:animate-none">
            <div className="aspect-square rounded-lg border border-border bg-secondary" />
            <div className="pt-4 space-y-3">
                <div className="h-3 rounded bg-muted w-1/4" />
                <div className="h-5 rounded bg-muted w-3/4" />
                <div className="h-5 rounded bg-muted w-1/3" />
                <div className="h-11 rounded-lg bg-muted w-full" />
            </div>
        </div>
    );
}

interface ProductGridSkeletonProps {
    count?: number;
}

export function ProductGridSkeleton({ count = 6 }: ProductGridSkeletonProps) {
    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:gap-x-6 md:gap-y-10 lg:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}
