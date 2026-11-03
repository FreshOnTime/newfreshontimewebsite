"use client";

import { Product } from "@/models/product";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useBag } from "@/contexts/BagContext";
import { toast } from "sonner";

interface IAddToBagButtonProps {
  product: Product;
  quantity: number;
}

export default function AddToBagButton(props: IAddToBagButtonProps) {
  const { product, quantity } = props;
  const { bags, currentBag, addToBag, createBag, selectBag, loading } = useBag();
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [addAfterCreate, setAddAfterCreate] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBagName, setNewBagName] = useState("");
  const [newBagDescription, setNewBagDescription] = useState("");

  const selectedBag = currentBag;
  const selectedBagId = selectedBag?.id || "";

  const handleAddToBag = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!selectedBagId) {
      setAddAfterCreate(true);
      setShowCreateDialog(true);
      return;
    }

    try {
      await addToBag(selectedBagId, product, quantity);
      toast.success(`Added ${product.name} to ${selectedBag?.name || 'bag'}`);
    } catch (error) {
      toast.error("Failed to add item to bag");
      console.error("Error adding to bag:", error);
    }
  };

  const handleCreateBag = async () => {
    if (!newBagName.trim()) {
      toast.error("Please enter a bag name");
      return;
    }

    try {
      await createBag(newBagName, newBagDescription, addAfterCreate ? { product, quantity } : undefined);
      toast.success(addAfterCreate ? `Added ${product.name} to ${newBagName.trim()}` : `Created new bag: ${newBagName.trim()}`);
      setShowCreateDialog(false);
      setNewBagName("");
      setNewBagDescription("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create bag");
      console.error("Error creating bag:", error);
    }
  };

  const handleBagSelect = (bagId: string) => {
    selectBag(bagId);
  };

  const canChooseBag = Boolean(user) && !authLoading && !product.isOutOfStock;
  const validQuantity = Number.isSafeInteger(quantity) && quantity >= 1 && quantity <= 10000;

  return (
    <>
      <div className="flex w-full min-w-0">
        <Button
          className={`h-12 min-w-0 flex-1 rounded-lg bg-brand-leaf px-4 text-xs font-bold uppercase leading-tight text-brand-ink hover:bg-brand-leaf/85 ${canChooseBag ? "rounded-r-none" : ""}`}
          disabled={product.isOutOfStock || authLoading || loading || !validQuantity}
          onClick={handleAddToBag}
        >
          <span className="line-clamp-2 text-center">
            {product.isOutOfStock ? "Currently unavailable" : !user ? "Sign in to add to bag" : selectedBag ? `Add to ${selectedBag.name}` : "Create a bag to add"}
          </span>
        </Button>
        {canChooseBag && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-r-lg border border-l-0 border-brand-green-deep/20 bg-brand-cream text-brand-green-deep transition-colors hover:bg-white disabled:opacity-50"
              disabled={loading || !validQuantity}
              aria-label="Choose shopping bag"
            >
              <ChevronDown className="h-5 w-5" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Select shopping bag</DropdownMenuLabel>
              {bags.length > 0 && (
                <>
                  <DropdownMenuRadioGroup value={selectedBagId} onValueChange={handleBagSelect}>
                    {bags.map((bag) => (
                      <DropdownMenuRadioItem key={bag.id} value={bag.id}>
                        {bag.name} ({bag.items?.length || 0} items)
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                </>
              )}
              <Button
                type="button"
                size="sm"
                className="w-full justify-start px-2 text-primary"
                variant="ghost"
                onClick={() => { setAddAfterCreate(true); setShowCreateDialog(true); }}
              >
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Create new bag & add
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Bag</DialogTitle>
            <DialogDescription>
              Give your new shopping bag a name and description.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newBagName}
                onChange={(e) => setNewBagName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Weekly Groceries"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={newBagDescription}
                onChange={(e) => setNewBagDescription(e.target.value)}
                className="col-span-3"
                placeholder="Optional description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateBag}
              disabled={loading || !newBagName.trim()}
            >
              {addAfterCreate ? 'Create bag & add item' : 'Create bag'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
