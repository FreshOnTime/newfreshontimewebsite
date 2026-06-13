"use client";

import { ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function GuaranteeCta() {
  return (
    <section className="relative overflow-hidden bg-[#020303]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/20 to-transparent" />
        <div className="absolute left-1/2 top-10 h-56 w-[42rem] -translate-x-1/2 rounded-full bg-emerald-400/[0.035] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.045),transparent_42%)]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-20 text-white">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md md:p-12">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/35 to-transparent" />
          <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-full border border-emerald-300/15 bg-emerald-300/10 p-2.5 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.08)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-300">Our Promise</span>
              </div>
              <h3 className="mb-4 font-serif text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
                Freshness backed by a simple guarantee
              </h3>
              <p className="max-w-xl text-lg font-light leading-relaxed text-zinc-300">
                If something isn’t perfect, we’ll replace it or refund you quickly. No stress, just freshness.
              </p>
            </div>

            <Link
              href="/products"
              className="group inline-flex items-center justify-center whitespace-nowrap rounded-full border border-emerald-300/30 bg-emerald-300/10 px-8 py-4 text-base font-bold text-emerald-50 shadow-[0_16px_45px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-300 hover:text-zinc-950"
            >
              Start shopping
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
