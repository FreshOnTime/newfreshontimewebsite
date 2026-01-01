"use client";

import Image from "next/image";
import Link from "next/link";

export default function BannerGrid() {
  const banners = [
    { title: "Organic Picks", sub: "Fresh from farm", href: "/categories/produce", image: "/bannermaterial/1.png" },
    { title: "Weekly Deals", sub: "Curated offers", href: "/deals", image: "/bannermaterial/2.png" },
    { title: "New Arrivals", sub: "Just In", href: "/products?sort=new", image: "/bannermaterial/3.png" },
    { title: "Concierge Delivery", sub: "At service", href: "/delivery-info", image: "/bannermaterial/4.png" },
  ];

  return (
    <section className="bg-white py-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {banners.map((b) => (
            <Link key={b.title} href={b.href} className="group relative h-[400px] overflow-hidden bg-zinc-900 transition-all duration-700">
              <Image
                src={b.image}
                alt={b.title}
                fill
                className="object-cover opacity-80 group-hover:scale-105 group-hover:opacity-90 transition-all duration-[1.5s] ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700" />

              <div className="absolute inset-0 p-10 flex flex-col justify-end items-start border-[0.5px] border-white/10 group-hover:border-white/20 transition-colors duration-700 m-4">
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4 text-emerald-400 transform translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                  {b.sub}
                </p>
                <h3 className="text-white text-3xl font-serif font-light leading-none mb-6 group-hover:-translate-y-2 transition-transform duration-500">{b.title}</h3>

                <span className="inline-flex items-center text-xs font-bold tracking-widest uppercase text-white border-b border-whitepb-1 group-hover:border-emerald-400 transition-all">
                  Shop Now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div >
    </section >
  );
}
