"use client";

import { Award, ShieldCheck, Sparkles, Truck } from "lucide-react";

export default function TrustBar() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Freshness Guarantee",
      desc: "Love it or it's on us",
    },
    {
      icon: Truck,
      title: "99.9% On-time",
      desc: "Same‑day delivery windows",
    },
    {
      icon: Award,
      title: "10k+ 5★ Reviews",
      desc: "Trusted by happy shoppers",
    },
    {
      icon: Sparkles,
      title: "Premium Selection",
      desc: "Hand‑picked daily",
    },
  ];

  return (
    <section className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-y">
      <div className="container mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-center gap-3 rounded-xl bg-white/70 backdrop-blur border shadow-sm p-4"
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700">
              <Icon className="w-5 h-5" />
            </span>
            <div>
              <p className="font-semibold text-gray-900 leading-tight">{title}</p>
              <p className="text-sm text-gray-600 leading-tight">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
