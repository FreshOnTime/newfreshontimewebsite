"use client";

import { Leaf, Truck, Timer, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "Farm Fresh",
    desc: "Sourced daily for peak freshness",
  },
  {
    icon: Truck,
    title: "Scheduled Delivery",
    desc: "Delivered to your doorstep at your convenience",
  },
  {
    icon: Timer,
    title: "Picked to Order",
    desc: "Hand-selected by our team",
  },
  {
    icon: ShieldCheck,
    title: "Quality Guaranteed",
    desc: "Love it or we make it right",
  },
];

export default function FeaturesStrip() {
  return (
    <section className="bg-white border-y">
      <div className="container mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100"
          >
            <div className="rounded-full p-2 bg-white shadow-sm">
              <Icon className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{title}</p>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
