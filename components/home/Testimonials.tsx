"use client";

import Image from "next/image";

const testimonials = [
  {
    name: "Anushka P.",
    role: "Colombo 07",
    quote:
      "Easily the freshest produce I've found online. The spinach was crisp and the mangoes were perfect!",
    avatar: "/bgs/landing-page-bg-1.jpg",
  },
  {
    name: "Ravin M.",
    role: "Battaramulla",
    quote:
      "Delivery was right on time and the quality is consistently top‑notch. My go‑to for weekly groceries.",
    avatar: "/bgs/landing-page-bg-1.jpg",
  },
  {
    name: "Ishara D.",
    role: "Dehiwala",
    quote:
      "Love the curated bags—great value and everything tastes amazing. Highly recommend!",
    avatar: "/bgs/landing-page-bg-1.jpg",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-zinc-50 py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay"></div>
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-emerald-100/50 text-emerald-700 text-sm font-medium tracking-widest uppercase mb-4 border border-emerald-200/50">
            Community Love
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 tracking-tight mb-4">
            Voices of Freshness
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
            Join thousands of satisfied customers who have elevated their daily dining.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              className="group relative rounded-[2rem] bg-white p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]"
            >
              <div className="flex text-amber-400 mb-8 space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <blockquote className="text-zinc-700 leading-relaxed text-lg mb-8 relative z-10 font-medium">"{t.quote}"</blockquote>
              <figcaption className="flex items-center gap-4 mt-auto pt-6 border-t border-zinc-50">
                <div className="relative w-12 h-12 overflow-hidden rounded-full ring-2 ring-zinc-100 group-hover:ring-emerald-200 transition-all">
                  <Image src={t.avatar} alt={t.name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                <div>
                  <p className="font-serif font-bold text-zinc-900 leading-tight text-lg">{t.name}</p>
                  <p className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
