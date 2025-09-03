"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useBag } from "@/contexts/BagContext";

export default function BagView() {
  const params = useParams<{ id: string }>();
  const { bags, selectBag, getTotalPrice } = useBag();

  const bag = useMemo(() => bags.find(b => b.id === params.id) || null, [bags, params.id]);

  useEffect(() => {
    if (params.id) selectBag(params.id);
  }, [params.id, selectBag]);

  if (!bag) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-600">Bag not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{bag.name}</h1>
        <div className="text-right">
          <p className="text-gray-600">Total</p>
          <p className="text-xl font-bold">Rs. {getTotalPrice(bag.id).toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {bag.items.map((item, idx) => {
          const firstImg = (item.product.images?.[0] as { url?: string } | string) ?? undefined;
          const imgUrl = typeof firstImg === 'string' ? firstImg : firstImg?.url;
          return (
            <div key={`${bag.id}-${item.product.id}-${idx}`} className="flex items-center gap-3 p-3 bg-white rounded-md border">
              <div className="w-14 h-14 bg-gray-100 rounded relative overflow-hidden">
                {imgUrl ? (
                  <Image src={imgUrl} alt={item.product.name} fill className="object-cover" />
                ) : null}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-gray-600">Rs. {item.product.price.toFixed(2)} x {item.quantity}</p>
              </div>
              <div className="text-right font-semibold">
                Rs. {(item.product.price * item.quantity).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t flex justify-end">
        <Link href={{ pathname: "/checkout", query: { bagId: bag.id } }} className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
