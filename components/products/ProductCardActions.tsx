"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useBag } from "@/contexts/BagContext";
import { useWishlist } from "@/contexts/WishlistContext";
import type { Product } from "@/models/product";
import { cn } from "@/lib/utils";

interface ProductCardActionsProps {
  id: string;
  sku: string;
  name: string;
  image: string;
  price: number;
  isOutOfStock?: boolean;
}

export default function ProductCardActions({ id, sku, name, image, price, isOutOfStock = false }: ProductCardActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { currentBag, addToBag, loading } = useBag();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(id);
  const product = {
    _id: id,
    sku,
    name,
    image: { url: image || "/placeholder.svg", filename: "", contentType: "", path: image || "/placeholder.svg", alt: name },
    description: "",
    baseMeasurementQuantity: 1,
    pricePerBaseQuantity: price,
    measurementUnit: "ea",
    isSoldAsUnit: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 9999,
    stepQuantity: 1,
    stockQuantity: 0,
    isOutOfStock: false,
    totalSales: 0,
    lowStockThreshold: 0,
    unitOptions: [],
  } as unknown as Product;

  const toggleWishlist = async () => {
    if (isWishlisted) await removeFromWishlist(id);
    else await addToWishlist(product);
  };

  const quickAdd = async () => {
    if (isOutOfStock) return;
    if (!user) {
      toast.error("Please sign in to add products to a bag");
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!currentBag) {
      toast.info("Create or select a shopping bag first");
      router.push("/bags");
      return;
    }
    try {
      await addToBag(currentBag.id, product, 1);
      toast.success(`Added ${name} to ${currentBag.name}`);
    } catch {
      toast.error("Could not add this product. Please try again.");
    }
  };

  return (
    <div className="flex w-full gap-2">
      <button
        type="button"
        onClick={quickAdd}
        aria-label={isOutOfStock ? `${name} is unavailable` : `Add ${name} to ${currentBag?.name || "bag"}`}
        disabled={isOutOfStock || (loading && Boolean(user && currentBag))}
        className="flex h-11 min-w-0 flex-1 rounded-lg items-center justify-center gap-1.5 border border-brand-amber bg-brand-amber px-2 sm:gap-2 sm:px-3 text-xs font-bold uppercase text-foreground transition-colors hover:bg-brand-amber/85 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {!isOutOfStock && <ShoppingBag strokeWidth={1.75} aria-hidden="true" className="h-4 w-4 shrink-0" />}
        {isOutOfStock ? <span className="min-w-0 truncate text-xs sm:text-sm">Sold out</span> : <><span className="sm:hidden">Add</span><span className="hidden min-w-0 truncate sm:inline">Add to bag</span></>}
      </button>
      <button
        type="button"
        onClick={toggleWishlist}
        className={cn(
          "flex h-11 w-11 shrink-0 rounded-lg items-center justify-center sm:w-11 border border-border bg-transparent text-brand-green transition-colors hover:bg-secondary",
          isWishlisted && "text-[#8b2635]"
        )}
        aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
      >
        <Heart strokeWidth={1.75} aria-hidden="true" className={cn("h-4 w-4", isWishlisted && "fill-current")} />
      </button>
    </div>
  );
}
