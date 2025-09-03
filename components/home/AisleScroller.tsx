"use client";

import Link from "next/link";
import Image from "next/image";

export interface AisleItem {
  name: string;
  href: string;
  image?: string;
}

export default function AisleScroller({ items }: { items: AisleItem[] }) {
  return (
    <section className="bg-white border-y">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg">Shop by Aisle</h3>
          <Link href="/categories" className="text-sm text-green-700 hover:underline">View all</Link>
        </div>
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
            {items.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="flex items-center gap-3 flex-shrink-0 pr-4 pl-2 py-2 rounded-full border hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                {c.image && (
                  <span className="relative w-7 h-7 rounded-full overflow-hidden">
                    <Image src={c.image} alt={c.name} fill className="object-cover" />
                  </span>
                )}
                <span className="text-sm font-medium whitespace-nowrap">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
