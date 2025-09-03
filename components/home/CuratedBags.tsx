"use client";

import { BagCard } from "@/app/bags/BagCard";
import SectionHeader from "./SectionHeader";
import { Bag } from "@/models/Bag";

export default function CuratedBags() {
  // Mock bags removed - show empty state
  const bags: Bag[] = [];
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Curated Bags"
          subtitle="Pre-built lists for weekly essentials, parties, and more"
          ctaHref="/bags"
          ctaLabel="Create your own"
        />
        {bags.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Coming soon! Create custom shopping lists for your needs.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bags.map((bag) => (
              <BagCard key={bag.id} bag={bag} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
