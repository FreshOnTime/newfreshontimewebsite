"use client";

import Image from "next/image";
import Link from "next/link";

export default function BannerGrid() {
  const banners = [
    { title: "organice picks", href: "/", image: "/bannermaterial/1.png", accent: "from-green-500/10" },
    { title: "Weekly Deals", href: "/", image: "/bannermaterial/2.png", accent: "from-orange-500/10" },
    { title: "organic prodcts", href: "/", image: "/bannermaterial/3.png", accent: "from-yellow-500/10" },
    { title: "convinient deliveries", href: "/", image: "/bannermaterial/4.png", accent: "from-purple-500/10" },
  ];
  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-10 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {banners.map((b) => (
          <Link key={b.title} href={b.href} className="relative h-48 rounded-xl overflow-hidden group border">
            <Image src={b.image} alt={b.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className={`absolute inset-0 bg-gradient-to-tr ${b.accent} to-transparent`} />
            <div className="absolute bottom-3 left-3">
              <h3 className="text-white text-xl font-semibold drop-shadow">{b.title}</h3>
              <span className="text-white/90 text-sm underline">Shop now</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
