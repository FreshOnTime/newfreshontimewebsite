"use client";

import { ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function GuaranteeCta() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800" />
      <div className="absolute inset-0 -z-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 40% 20%, white 0%, transparent 40%)" }} />
      <div className="container mx-auto px-4 py-14 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm uppercase tracking-widest text-white/80">Our Promise</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold leading-tight">Satisfaction guaranteed or your money back</h3>
            <p className="mt-3 text-white/90">If something isn’t perfect, we’ll replace it or refund you—no questions asked.</p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-emerald-700 font-semibold shadow hover:shadow-md hover:bg-emerald-50"
          >
            Start shopping
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
