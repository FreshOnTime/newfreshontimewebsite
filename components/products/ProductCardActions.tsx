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
}

export default function ProductCardActions({ id, sku, name, image, price }: ProductCardActionsProps) {
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
    <div className="flex w-full">
      <button
        type="button"
        onClick={quickAdd}
        aria-label={`Add ${name} to ${currentBag?.name || "bag"}`}
        disabled={loading && Boolean(user && currentBag)}
        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-l-lg bg-brand-amber px-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-brand-amber/85 disabled:cursor-wait disabled:opacity-60"
      >
        <ShoppingBag className="h-4 w-4 shrink-0" />
        <span className="min-w-0 truncate">Add to bag</span>
      </button>
      <button
        type="button"
        onClick={toggleWishlist}
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-r-lg border border-l-0 border-border bg-card text-brand-green transition-colors hover:bg-secondary",
          isWishlisted && "text-[#8b2635]"
        )}
        aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
      >
        <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
      </button>
    </div>
  );
}
