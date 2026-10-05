"use client";

import { ChevronDown, Heart, Plus, ShoppingBag } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useBag } from "@/contexts/BagContext";
import { useWishlist } from "@/contexts/WishlistContext";
import type { Product } from "@/models/product";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const { bags, addToBag, createBag, loading } = useBag();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBagName, setNewBagName] = useState("");
  const [newBagDescription, setNewBagDescription] = useState("");
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

  const redirectToLogin = () => {
    toast.error("Please sign in to add products to a bag");
    router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
  };

  const addToSelectedBag = async (bagId: string, bagName: string) => {
    if (isOutOfStock) return;
    try {
      await addToBag(bagId, product, 1);
      toast.success(`Added ${name} to ${bagName}`);
    } catch {
      toast.error("Could not add this product. Please try again.");
    }
  };

  const createBagAndAdd = async () => {
    const trimmedName = newBagName.trim();
    if (!trimmedName) {
      toast.error("Please enter a bag name");
      return;
    }
    try {
      await createBag(trimmedName, newBagDescription.trim() || undefined, { product, quantity: 1 });
      toast.success(`Created ${trimmedName} and added ${name}`);
      setShowCreateDialog(false);
      setNewBagName("");
      setNewBagDescription("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create the bag");
    }
  };

  const addButtonClasses = "flex h-11 min-w-0 flex-1 rounded-lg items-center justify-center gap-1.5 border border-brand-leaf bg-brand-leaf px-2 sm:gap-2 sm:px-3 text-xs font-bold uppercase text-brand-ink transition-colors hover:bg-brand-leaf/85 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <>
      <div className="flex w-full gap-2">
        {isOutOfStock ? (
          <button
            type="button"
            aria-label={`${name} is unavailable`}
            disabled
            className={addButtonClasses}
          >
            <span className="min-w-0 truncate text-xs sm:text-sm">Sold out</span>
          </button>
        ) : !user ? (
          <button
            type="button"
            onClick={redirectToLogin}
            className={addButtonClasses}
            aria-label={`Sign in to add ${name} to a bag`}
          >
            <ShoppingBag strokeWidth={1.75} aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="sm:hidden">Add</span>
            <span className="hidden min-w-0 truncate sm:inline">Add to bag</span>
          </button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={loading}
                className={addButtonClasses}
                aria-label={`Choose a bag for ${name}`}
              >
                <ShoppingBag strokeWidth={1.75} aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className="sm:hidden">Add</span>
                <span className="hidden min-w-0 truncate sm:inline">Add to bag</span>
                <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel>Choose a shopping bag</DropdownMenuLabel>
              {bags.length > 0 ? bags.map((bag) => (
                <DropdownMenuItem
                  key={bag.id}
                  onSelect={() => void addToSelectedBag(bag.id, bag.name)}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="min-w-0 truncate">{bag.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{bag.items?.length || 0} items</span>
                </DropdownMenuItem>
              )) : (
                <DropdownMenuItem disabled>No bags yet</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create new bag & add
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

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

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a shopping bag</DialogTitle>
            <DialogDescription>Create the bag and add {name} to it immediately.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor={`bag-name-${id}`}>Bag name</Label>
              <Input
                id={`bag-name-${id}`}
                value={newBagName}
                onChange={(event) => setNewBagName(event.target.value)}
                placeholder="e.g. Weekly groceries"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`bag-description-${id}`}>Description (optional)</Label>
              <Input
                id={`bag-description-${id}`}
                value={newBagDescription}
                onChange={(event) => setNewBagDescription(event.target.value)}
                placeholder="e.g. Saturday household shop"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} disabled={loading}>Cancel</Button>
            <Button type="button" onClick={() => void createBagAndAdd()} disabled={loading || !newBagName.trim()}>
              {loading ? "Creating…" : "Create bag & add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
