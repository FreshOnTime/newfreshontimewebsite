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
    <section className="bg-gradient-to-b from-white to-emerald-50/40">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What shoppers say</h2>
          <p className="text-gray-600 mt-2">Real reviews from Fresh Pick customers</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="relative rounded-2xl border bg-white/80 backdrop-blur p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <blockquote className="text-gray-700 leading-relaxed">“{t.quote}”</blockquote>
              <figcaption className="flex items-center gap-3 mt-5">
                <span className="relative w-10 h-10 overflow-hidden rounded-full border">
                  <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
