"use client";

import { ShoppingBag, Trash2 } from "lucide-react";

import { Bag } from "../../models/Bag";
import { calculateBagTotals } from "../../lib/bagCalculations";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function BagCard({
  bag,
  onDelete,
  onOrderNow,
}: {
  bag: Bag;
  onDelete?: (id: string) => void;
  onOrderNow?: (id: string) => void;
}) {
  const { total, savings } = calculateBagTotals(bag.items);
  const itemCount = bag.items.length;

  const bagUrl = `/bags/${bag.id}`;

  return (
    <div className="p-2 pb-0  h-fit  bg-white border rounded-lg overflow-hidden">
      <div className="pt-8 pb-4 px-4">
        <div className="flex justify-between items-start mb-2">
          <Link href={bagUrl}>
            <h3 className="text-lg hover:underline font-semibold line-clamp-1">
              {bag.name}
            </h3>
          </Link>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(bag.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {bag.description}
        </p>
        <div className="flex justify-between items-center mb-2">
          <Badge variant={"outline"} className="text-sm">
            {itemCount} items
          </Badge>
          <span className="text-sm font-semibold">Rs. {total.toFixed(2)}</span>
        </div>
        <div className="text-sm text-right text-green-600 mb-3">
          Savings: Rs. {savings.toFixed(2)}
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {bag.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      {onOrderNow ? (
        <button
          onClick={() => onOrderNow(bag.id)}
          className="h-12 w-full bg-black text-white rounded-t-full flex items-center justify-center"
        >
          <ShoppingBag className="w-6 h-6 mr-2 text-white" /> Order Now
        </button>
      ) : (
        <Link
          href={bagUrl}
          className="h-12 w-full bg-gray-900 text-white rounded-t-full flex items-center justify-center hover:bg-black transition-colors"
        >
          <ShoppingBag className="w-6 h-6 mr-2 text-white" /> View Bag
        </Link>
      )}
    </div>
  );
}
