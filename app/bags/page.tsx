'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Minus, PackageOpen, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useBag } from '@/contexts/BagContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function BagsPage() {
  const {
    bags,
    loading,
    error,
    createBag,
    updateBagItem,
    removeFromBag,
    deleteBag,
  } = useBag();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBagName, setNewBagName] = useState('');
  const [newBagDescription, setNewBagDescription] = useState('');

  const handleCreateBag = async () => {
    if (!newBagName.trim()) {
      toast.error('Please enter a bag name');
      return;
    }

    try {
      await createBag(newBagName, newBagDescription);
      toast.success(`Created new bag: ${newBagName}`);
      setShowCreateDialog(false);
      setNewBagName('');
      setNewBagDescription('');
    } catch (createError) {
      toast.error('Failed to create bag');
      console.error('Error creating bag:', createError);
    }
  };

  const updateQuantity = async (bagId: string, productId: string, newQuantity: number) => {
    try {
      await updateBagItem(bagId, productId, newQuantity);
    } catch (updateError) {
      toast.error('Failed to update quantity');
      console.error('Error updating quantity:', updateError);
    }
  };

  const removeItem = async (bagId: string, productId: string) => {
    try {
      await removeFromBag(bagId, productId);
      toast.success('Item removed from bag');
    } catch (removeError) {
      toast.error('Failed to remove item');
      console.error('Error removing item:', removeError);
    }
  };

  const handleDeleteBag = async (bagId: string, bagName: string) => {
    if (!confirm(`Delete “${bagName}”?`)) return;

    try {
      await deleteBag(bagId);
      toast.success('Bag deleted successfully');
    } catch (deleteError) {
      toast.error('Failed to delete bag');
      console.error('Error deleting bag:', deleteError);
    }
  };

  if (loading && bags.length === 0) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f6f7f4] px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-700" />
          <p className="mt-4 text-sm font-light text-zinc-500">Preparing your bags…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f6f7f4] px-4">
        <div className="max-w-md rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <PackageOpen className="mx-auto h-10 w-10 text-zinc-400" />
          <h1 className="mt-5 font-serif text-2xl text-zinc-950">We couldn&apos;t load your bags.</h1>
          <p className="mt-2 text-sm font-light leading-6 text-zinc-500">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-6 rounded-full bg-zinc-950 px-6 hover:bg-emerald-900">
            Try again
          </Button>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#f6f7f4]">
        <section className="border-b border-zinc-200 bg-white">
          <div className="container mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
            <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">Your FreshPick</span>
                <h1 className="mt-4 font-serif text-5xl font-normal leading-none tracking-tight text-zinc-950 md:text-7xl">Shopping bags.</h1>
                <p className="mt-5 max-w-xl text-base font-light leading-7 text-zinc-600">
                  Keep separate baskets for weekly groceries, dinner plans, recurring essentials, or anything else you want to organise your way.
                </p>
              </div>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="h-12 rounded-full bg-zinc-950 px-6 text-[10px] font-bold uppercase tracking-[0.16em] hover:bg-emerald-900"
              >
                <Plus className="mr-2 h-4 w-4" /> New bag
              </Button>
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          {bags.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white px-6 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
                <ShoppingBag className="h-7 w-7 stroke-[1.5]" />
              </div>
              <h2 className="mt-6 font-serif text-3xl font-normal text-zinc-950">Start your first bag.</h2>
              <p className="mx-auto mt-3 max-w-md text-sm font-light leading-6 text-zinc-500">
                Create a bag for this week&apos;s groceries, tonight&apos;s meal, or a basket you want to build over time.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button onClick={() => setShowCreateDialog(true)} className="rounded-full bg-zinc-950 px-6 hover:bg-emerald-900">
                  Create a bag
                </Button>
                <Button asChild variant="outline" className="rounded-full border-zinc-200 px-6">
                  <Link href="/products">Browse products</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {bags.map((bag) => {
                const total = bag.items?.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0;
                const itemCount = bag.items?.length || 0;

                return (
                  <article key={bag.id} className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_16px_55px_rgba(15,23,42,0.05)]">
                    <div className="flex items-start justify-between gap-5 border-b border-zinc-100 p-6 md:p-7">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <Link href={`/bags/${bag.id}`} className="truncate font-serif text-3xl font-normal text-zinc-950 transition-colors hover:text-emerald-800">
                            {bag.name}
                          </Link>
                          <span className="rounded-full bg-[#f6f7f4] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        {bag.description && <p className="mt-2 line-clamp-2 text-sm font-light leading-6 text-zinc-500">{bag.description}</p>}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteBag(bag.id, bag.name)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete bag"
                        aria-label={`Delete ${bag.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="p-4 md:p-5">
                      {itemCount > 0 ? (
                        <div className="space-y-2">
                          {bag.items?.map((item, idx) => {
                            type Img = { url?: string; alt?: string } | string;
                            const firstImg = (item.product.images?.[0] as Img) ?? undefined;
                            const imgUrl = typeof firstImg === 'string' ? firstImg : firstImg?.url;
                            const key = item.product.id ? `${bag.id}-${item.product.id}` : `${bag.id}-${idx}`;

                            return (
                              <div key={key} className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 rounded-2xl bg-[#f8f9f7] p-3 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center">
                                <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-zinc-200">
                                  {imgUrl ? (
                                    <Image
                                      src={imgUrl}
                                      alt={(typeof firstImg !== 'string' ? firstImg?.alt : '') || item.product.name}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-zinc-200" />
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <h3 className="truncate text-sm font-medium text-zinc-900">{item.product.name}</h3>
                                  <p className="mt-1 text-xs font-light text-zinc-500">Rs. {item.product.price.toFixed(2)} / {item.product.unit || 'unit'}</p>
                                </div>

                                <div className="col-span-2 flex items-center justify-between gap-3 border-t border-zinc-200 pt-3 sm:col-span-1 sm:border-0 sm:pt-0">
                                  <div className="flex items-center rounded-full border border-zinc-200 bg-white p-1">
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(bag.id, item.product.id, item.quantity - 1)}
                                      className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 disabled:opacity-30"
                                      disabled={item.quantity <= 1}
                                      aria-label={`Decrease ${item.product.name}`}
                                    >
                                      <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="min-w-8 text-center text-sm font-medium text-zinc-900">{item.quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(bag.id, item.product.id, item.quantity + 1)}
                                      className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 disabled:opacity-30"
                                      disabled={item.quantity >= (item.product.stock || 999)}
                                      aria-label={`Increase ${item.product.name}`}
                                    >
                                      <Plus className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeItem(bag.id, item.product.id)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-red-50 hover:text-red-600"
                                    aria-label={`Remove ${item.product.name}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-[#f8f9f7] px-4 py-10 text-center">
                          <p className="font-serif text-xl text-zinc-800">This bag is ready for something good.</p>
                          <Link href="/products" className="mt-3 inline-flex text-sm font-medium text-emerald-800">Add products</Link>
                        </div>
                      )}

                      {bag.tags && bag.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {bag.tags.map((tag, index) => (
                            <span key={`${bag.id}-tag-${index}-${tag}`} className="rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-4 border-t border-zinc-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-7">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">Bag total</p>
                        <p className="mt-1 font-serif text-2xl text-zinc-950">Rs. {total.toFixed(2)}</p>
                      </div>
                      <Link
                        href={{ pathname: '/checkout', query: { bagId: bag.id } }}
                        className={`inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors ${itemCount > 0 ? 'bg-zinc-950 text-white hover:bg-emerald-900' : 'pointer-events-none bg-zinc-100 text-zinc-400'}`}
                        aria-disabled={itemCount === 0}
                      >
                        Checkout bag <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="rounded-[2rem] border-zinc-200 sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl font-normal">Create a new bag</DialogTitle>
            <DialogDescription>Give it a name that makes sense to you. You can use bags for different routines, people, or occasions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bag name</Label>
              <Input
                id="name"
                value={newBagName}
                onChange={(event) => setNewBagName(event.target.value)}
                className="h-12 rounded-xl"
                placeholder="e.g. Weekly groceries"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newBagDescription}
                onChange={(event) => setNewBagDescription(event.target.value)}
                className="h-12 rounded-xl"
                placeholder="Optional note"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button type="button" className="rounded-full bg-zinc-950 hover:bg-emerald-900" onClick={handleCreateBag} disabled={loading || !newBagName.trim()}>
              Create bag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
