"use client";

import { ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function GuaranteeCta() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-zinc-900" />
      <div className="absolute inset-0 -z-0 opacity-30 bg-[url('/noise.png')] mix-blend-overlay" />
      <div className="absolute inset-0 -z-0 bg-gradient-to-r from-emerald-900/50 to-black/50" />
      <div className="container mx-auto px-4 py-20 text-white relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-zinc-800/50 p-8 md:p-12 rounded-[2rem] border border-white/5 backdrop-blur-sm">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-emerald-400">Our Promise</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-serif font-bold leading-tight mb-4">Satisfaction guaranteed or your money back</h3>
            <p className="text-zinc-300 text-lg leading-relaxed">If something isn’t perfect, we’ll replace it or refund you instantly. No questions, just freshness.</p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-emerald-500 text-zinc-950 font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:bg-emerald-400 hover:scale-105 transition-all duration-300 whitespace-nowrap"
          >
            Start shopping
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
