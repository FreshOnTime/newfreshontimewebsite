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
    <section className="bg-section-alt py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-12" data-aos-delay="0">
          <span className="text-emerald-600 text-sm font-semibold tracking-wider uppercase mb-3 block">Community</span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">What shoppers say</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">Real reviews from over 10,000 happy Fresh Pick customers across Colombo.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              className="group relative rounded-3xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-premium-lg transition-all duration-500 hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="flex text-amber-400 mb-6 space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <blockquote className="text-gray-700 leading-relaxed text-lg mb-8 relative z-10">"{t.quote}"</blockquote>
              <figcaption className="flex items-center gap-4 mt-auto">
                <div className="relative w-12 h-12 overflow-hidden rounded-full ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/50 transition-all">
                  <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 leading-tight">{t.name}</p>
                  <p className="text-sm text-emerald-600 font-medium">{t.role}</p>
                </div>
              </figcaption>

              {/* Decorative quote icon */}
              <div className="absolute top-6 right-8 text-emerald-500/10 font-serif text-8xl leading-none select-none pointer-events-none group-hover:text-emerald-500/20 transition-colors">"</div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
