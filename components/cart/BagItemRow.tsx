"use client";

import Image from "next/image";
import { ImageIcon, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { BagItem } from "@/models/BagItem";
import { useBag } from "@/contexts/BagContext";

const money = (value: number) => value.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function BagItemRow({ bagId, item, compact = false }: { bagId: string; item: BagItem; compact?: boolean }) {
  const { loading, updating, updateBagItem, removeFromBag } = useBag();
  const busy = loading || updating;
  const image = item.product.images?.[0];
  const unavailable = item.product.stock < item.quantity;

  const change = async (quantity: number) => {
    try { await updateBagItem(bagId, item.product.id, quantity); }
    catch { toast.error("Could not update this quantity. Please try again."); }
  };
  const remove = async () => {
    try { await removeFromBag(bagId, item.product.id); toast.success("Item removed from your bag"); }
    catch { toast.error("Could not remove this item. Please try again."); }
  };

  return (
    <div className={`grid grid-cols-[64px_minmax(0,1fr)] gap-x-4 gap-y-3 py-5 ${compact ? "" : "sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center"}`}>
      <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-background sm:h-[72px] sm:w-[72px]">
        {image?.url ? <Image src={image.url} alt="" fill sizes="72px" className="object-contain p-2" /> : <ImageIcon strokeWidth={1.5} aria-hidden="true" className="h-6 w-6 text-muted-foreground" />}
      </div>
      <div className="min-w-0">
        <h3 className="break-words text-sm font-medium text-foreground">{item.product.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">Rs. {money(item.product.price)} / {item.product.unit}</p>
        {unavailable && <p className="mt-1 text-xs text-destructive">{item.product.stock === 0 ? "Currently unavailable" : `Only ${item.product.stock} available`}</p>}
      </div>
      <div className={`col-span-2 flex flex-wrap items-center justify-between gap-3 ${compact ? "" : "sm:col-span-1 sm:justify-end"}`}>
        <div className="flex h-11 items-center rounded-lg border border-border">
          <button type="button" disabled={busy || item.quantity <= 1} aria-label={`Decrease ${item.product.name}`} onClick={() => change(Math.max(1, item.quantity - 1))} className="flex h-11 w-11 items-center justify-center text-brand-green hover:bg-secondary disabled:opacity-30"><Minus strokeWidth={1.75} aria-hidden="true" className="h-4 w-4" /></button>
          <span aria-label={`${item.product.name} quantity`} className="min-w-8 text-center text-sm tabular-nums">{item.quantity}</span>
          <button type="button" disabled={busy || item.quantity >= item.product.stock} aria-label={`Increase ${item.product.name}`} onClick={() => change(item.quantity + 1)} className="flex h-11 w-11 items-center justify-center text-brand-green hover:bg-secondary disabled:opacity-30"><Plus strokeWidth={1.75} aria-hidden="true" className="h-4 w-4" /></button>
        </div>
        <p className="min-w-20 text-right text-sm font-semibold tabular-nums">Rs. {money(item.product.price * item.quantity)}</p>
        <button type="button" disabled={busy} aria-label={`Remove ${item.product.name}`} onClick={remove} className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-destructive disabled:opacity-30"><Trash2 strokeWidth={1.75} aria-hidden="true" className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
