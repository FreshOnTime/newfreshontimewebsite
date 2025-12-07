"use client";

import Image from "next/image";
import Link from "next/link";

export default function BannerGrid() {
  const banners = [
    { title: "Organic Picks", sub: "Fresh from farm", href: "/categories/produce", image: "/bannermaterial/1.png", accent: "from-green-600/20", textAccent: "text-green-700" },
    { title: "Weekly Deals", sub: "Up to 40% off", href: "/deals", image: "/bannermaterial/2.png", accent: "from-orange-500/20", textAccent: "text-orange-700" },
    { title: "New Arrivals", sub: "Just in today", href: "/products?sort=new", image: "/bannermaterial/3.png", accent: "from-blue-500/20", textAccent: "text-blue-700" },
    { title: "Convenient Delivery", sub: "To your doorstep", href: "/delivery-info", image: "/bannermaterial/4.png", accent: "from-purple-500/20", textAccent: "text-purple-700" },
  ];

  return (
    <section className="bg-white py-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {banners.map((b) => (
            <Link key={b.title} href={b.href} className="group relative h-64 rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
              <Image
                src={b.image}
                alt={b.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${b.accent} via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity`} />
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-white/95 via-white/80 to-transparent backdrop-blur-[2px]">
                <p className={`text-xs font-bold tracking-wider uppercase mb-1 ${b.textAccent}`}>{b.sub}</p>
                <h3 className="text-gray-900 text-xl font-bold leading-tight mb-2 group-hover:text-emerald-700 transition-colors">{b.title}</h3>
                <span className="inline-flex items-center text-sm font-medium text-gray-700 group-hover:translate-x-1 transition-transform">
                  Shop now
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
