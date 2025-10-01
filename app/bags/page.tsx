'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useBag } from '@/contexts/BagContext';
import { toast } from 'sonner';
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
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function BagsPage() {
  const { 
    bags, 
    loading, 
    error, 
    createBag, 
    updateBagItem, 
    removeFromBag,
    deleteBag 
  } = useBag();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBagName, setNewBagName] = useState("");
  const [newBagDescription, setNewBagDescription] = useState("");

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

  const updateQuantity = async (bagId: string, productId: string, newQuantity: number) => {
    try {
      await updateBagItem(bagId, productId, newQuantity);
    } catch (error) {
      toast.error("Failed to update quantity");
      console.error("Error updating quantity:", error);
    }
  };

  const removeItem = async (bagId: string, productId: string) => {
    try {
      await removeFromBag(bagId, productId);
      toast.success("Item removed from bag");
    } catch (error) {
      toast.error("Failed to remove item");
      console.error("Error removing item:", error);
    }
  };

  const handleDeleteBag = async (bagId: string, bagName: string) => {
    if (confirm(`Are you sure you want to delete "${bagName}"?`)) {
      try {
        await deleteBag(bagId);
        toast.success("Bag deleted successfully");
      } catch (error) {
        toast.error("Failed to delete bag");
        console.error("Error deleting bag:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bags...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Shopping Bags</h1>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Bag
            </button>
          </div>

          {bags.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No bags found</h2>
              <p className="text-gray-500 mb-6">Create your first shopping bag to get started</p>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                Create Your First Bag
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bags.map((bag) => (
                <div key={bag.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <Link href={`/bags/${bag.id}`} className="text-lg font-semibold text-gray-900 hover:underline">
                        {bag.name}
                      </Link>
                      {bag.description && (
                        <p className="text-sm text-gray-600 mt-1">{bag.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        Rs. {(bag.items?.reduce((total, item) => total + (item.product.price * item.quantity), 0) || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {bag.items?.length || 0} item{(bag.items?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteBag(bag.id, bag.name)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      title="Delete bag"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {bag.items?.map((item, idx) => {
                      type Img = { url?: string; alt?: string } | string;
                      const firstImg = (item.product.images?.[0] as Img) ?? undefined;
                      const imgUrl = typeof firstImg === 'string' ? firstImg : firstImg?.url;
                      const key = item.product.id ? `${bag.id}-${item.product.id}` : `${bag.id}-${idx}`;
                      return (
                      <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 relative overflow-hidden">
                          {imgUrl ? (
                            <Image
                              src={imgUrl}
                              alt={(typeof firstImg !== 'string' ? firstImg?.alt : '') || item.product.name}
                              fill
                              className="object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 rounded-lg"></div>
                          )}
                        </div>
                        
                        <div className="flex-grow">
                          <h4 className="font-medium text-gray-900 text-sm">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">
                            Rs. {item.product.price.toFixed(2)} / {item.product.unit || 'unit'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(bag.id, item.product.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          
                          <button
                            onClick={() => updateQuantity(bag.id, item.product.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                            disabled={item.quantity >= (item.product.stock || 999)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => removeItem(bag.id, item.product.id)}
                            className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 ml-2"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    )}) || (
                      <p className="text-gray-500 text-center py-4">No items in this bag</p>
                    )}
                  </div>

                  {bag.tags && bag.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
            {bag.tags.map((tag, index) => (
                        <span
              key={`${bag.id}-tag-${index}-${tag}`}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link href={{ pathname: "/checkout", query: { bagId: bag.id } }} className="block text-center w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                      Checkout Bag
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
