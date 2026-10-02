import { ProductGridSkeleton } from "@/components/products/ProductCardSkeleton";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading the market">
      <PremiumPageHeader title="Shop the market" isLoading />
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <div aria-hidden="true" className="mb-8 flex flex-col gap-3 border-y border-border py-5 sm:flex-row">
          <div className="h-11 flex-1 rounded-lg bg-muted animate-pulse motion-reduce:animate-none" />
          <div className="h-11 rounded-lg bg-muted sm:w-48 animate-pulse motion-reduce:animate-none" />
        </div>
        <ProductGridSkeleton count={12} />
      </div>
    </div>
  );
}
