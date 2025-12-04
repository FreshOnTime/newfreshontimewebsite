"use client";

import { Leaf, Truck, Timer, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "Farm Fresh Daily",
    desc: "Sourced every morning for peak freshness",
    color: "emerald",
  },
  {
    icon: Truck,
    title: "Scheduled Delivery",
    desc: "Choose your preferred delivery time",
    color: "blue",
  },
  {
    icon: Timer,
    title: "Picked to Order",
    desc: "Hand-selected by our expert team",
    color: "amber",
  },
  {
    icon: ShieldCheck,
    title: "Quality Guaranteed",
    desc: "100% satisfaction or we make it right",
    color: "violet",
  },
];

const colorClasses = {
  emerald: {
    bg: "bg-emerald-50",
    icon: "bg-emerald-100 text-emerald-600",
  },
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "bg-amber-100 text-amber-600",
  },
  violet: {
    bg: "bg-violet-50",
    icon: "bg-violet-100 text-violet-600",
  },
};

export default function FeaturesStrip() {
  return (
    <section className="bg-white border-y border-gray-100">
      <div className="container mx-auto px-4 md:px-8 py-10 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => {
            const colors = colorClasses[color as keyof typeof colorClasses];
            return (
              <div
                key={title}
                className={`flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 p-5 md:p-6 rounded-2xl ${colors.bg} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm`}
              >
                <div className={`rounded-xl p-2.5 ${colors.icon}`}>
                  <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm md:text-base">{title}</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
