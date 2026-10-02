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
      await createBag(newBagName, newBagDescription);
      toast.success(`Created new bag: ${newBagName}`);
      setShowCreateDialog(false);
      setNewBagName("");
      setNewBagDescription("");
    } catch (error) {
      toast.error("Failed to create bag");
      console.error("Error creating bag:", error);
    }
  };

  const handleBagSelect = (bagId: string) => {
    selectBag(bagId);
  };

  return (
    <>
      <div className="w-full flex">
        <Button
          className="h-12 w-full rounded-l-lg rounded-r-none bg-primary px-4 text-sm font-semibold leading-tight text-accent-foreground hover:bg-primary/85"
          disabled={product.isOutOfStock || authLoading || loading || !Number.isFinite(quantity) || quantity <= 0}
          onClick={handleAddToBag}
        >
          <span className="line-clamp-2">
            {product.isOutOfStock ? "Currently unavailable" : !user ? "Sign in to add" : selectedBag ? `Add to ${selectedBag.name}` : "Create a bag to add"}
          </span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="rounded-r-lg border-l border-accent-foreground/20 bg-primary px-4 text-accent-foreground transition-colors hover:bg-primary/85"
            disabled={loading || !user || product.isOutOfStock}
            aria-label="Choose shopping bag"
          >
            <ChevronDown className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Select Bag</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={selectedBagId}
              onValueChange={handleBagSelect}
            >
              {bags.map((bag) => (
                <DropdownMenuRadioItem key={bag.id} value={bag.id}>
                  {bag.name} ({bag.items?.length || 0} items)
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <Button
              size="sm"
              className="w-full text-primary px-2 justify-start"
              variant={"ghost"}
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Bag
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>
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
              Create Bag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
