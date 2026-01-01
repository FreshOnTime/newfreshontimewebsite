import { ProductGridSkeleton } from "@/components/products/ProductCardSkeleton";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";

export default function Loading() {
    return (
        <>
            <PremiumPageHeader
                title="All Products"
                subtitle="Explore our curated selection of premium groceries, fresh from the source to your table."
                count={0}
                isLoading={true}
            />
            <div className="container mx-auto px-4 md:px-8 pb-24">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Filter Bar Skeleton */}
                    <div className="w-full space-y-8">
                        <div className="h-16 bg-zinc-100 rounded-xl animate-pulse" />

                        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                            <div className="h-4 w-32 bg-zinc-100 rounded animate-pulse" />
                        </div>

                        <ProductGridSkeleton count={12} />
                    </div>
                </div>
            </div>
        </>
    );
}
