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
import { useBag } from "@/contexts/BagContext";
import { toast } from "sonner";

interface IAddToBagButtonProps {
  product: Product;
  quantity: number;
}

export default function AddToBagButton(props: IAddToBagButtonProps) {
  const { product, quantity } = props;
  const { bags, currentBag, addToBag, createBag, selectBag, loading } = useBag();
  const [selectedBagId, setSelectedBagId] = useState(currentBag?.id || "");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBagName, setNewBagName] = useState("");
  const [newBagDescription, setNewBagDescription] = useState("");

  const selectedBag = bags.find(bag => bag.id === selectedBagId);

  const handleAddToBag = async () => {
    if (!selectedBagId) {
      toast.error("Please select a bag first");
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
    setSelectedBagId(bagId);
    selectBag(bagId);
  };

  return (
    <>
      <div className="w-full flex">
        <Button
          className="w-full rounded-s-full px-4 h-10 whitespace-normal leading-tight text-sm font-medium"
          disabled={product.isOutOfStock || loading || !selectedBagId}
          onClick={handleAddToBag}
        >
          <span className="line-clamp-2">
            Add to {selectedBag?.name || "selected"} bag
          </span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="bg-primary text-primary-foreground rounded-e-full border-l px-4"
            disabled={loading}
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
