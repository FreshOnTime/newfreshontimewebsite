"use client";

import Image from "next/image";

const brands = [
  { name: "Anchor", src: "/placeholder.svg" },
  { name: "Prima", src: "/placeholder.svg" },
  { name: "Elephant House", src: "/placeholder.svg" },
  { name: "Keells", src: "/placeholder.svg" },
  { name: "Cargills", src: "/placeholder.svg" },
  { name: "MD", src: "/placeholder.svg" },
];

export default function BrandsStrip() {
  return (
    <section className="bg-gradient-to-r from-green-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-10">
        <p className="text-center text-sm uppercase tracking-widest text-gray-500 mb-6">
          Trusted brands we carry
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 opacity-80">
          {brands.map((b) => (
            <div
              key={b.name}
              className="relative w-28 h-10 grayscale hover:grayscale-0 transition-all"
              title={b.name}
            >
              <Image src={b.src} alt={b.name} fill className="object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
