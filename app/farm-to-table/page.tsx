import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PackageCheck, Sprout, Store } from "lucide-react";
import prisma from "@/lib/prisma";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Sourcing & Partners | FreshPick",
  description: "Learn how FreshPick works with a curated supplier network and shops from a live, locally operated catalogue in Sri Lanka.",
};

async function getSourcingSnapshot() {
  try {
    const [activeSuppliers, supplierProducts, availableSupplierProducts] = await Promise.all([
      prisma.supplier.count({ where: { status: "active" } }),
      prisma.product.count({ where: { archived: false, supplierId: { not: null } } }),
      prisma.product.count({ where: { archived: false, supplierId: { not: null }, stockQty: { gt: 0 } } }),
    ]);
    return { activeSuppliers, supplierProducts, availableSupplierProducts };
  } catch (error) {
    console.error("[Sourcing page] Failed to load supplier snapshot:", error);
    return { activeSuppliers: 0, supplierProducts: 0, availableSupplierProducts: 0 };
  }
}

export default async function FarmToTablePage() {
  const snapshot = await getSourcingSnapshot();
  const availability = snapshot.supplierProducts > 0
    ? Math.round((snapshot.availableSupplierProducts / snapshot.supplierProducts) * 100)
    : null;

  return (
    <main className="min-h-screen bg-[#f4f5f1] pb-24 text-zinc-950">
      <section className="relative isolate flex min-h-[68svh] items-end overflow-hidden bg-[#07110c] px-5 pb-14 pt-28 text-white md:px-8 md:pb-16">
        <Image src="/bgs/home-hero.jpg" alt="Fresh food selected through the FreshPick supplier network" fill priority sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#07110c]/96 via-[#07110c]/64 to-[#07110c]/18" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#07110c] via-transparent to-black/20" />

        <div className="mx-auto w-full max-w-6xl">
          <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-200"><Sprout className="h-3.5 w-3.5" /> Sourcing & partners</span>
          <h1 className="mt-5 max-w-5xl font-serif text-6xl font-normal leading-[0.9] tracking-[-0.04em] md:text-8xl">Better food starts with a <span className="italic text-emerald-200">better supplier relationship.</span></h1>
          <p className="mt-6 max-w-2xl text-base font-light leading-8 text-white/65">FreshPick works with a curated supplier network and a live catalogue. We do not claim farm-level traceability where the product record does not yet contain structured provenance data.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-xs font-semibold text-zinc-950">Browse the market <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/b2b" className="inline-flex h-12 items-center rounded-full border border-white/15 bg-white/[0.05] px-6 text-xs font-semibold text-white/80">Partner with FreshPick</Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pt-14 md:px-8 md:pt-20">
        <section className="grid gap-4 sm:grid-cols-3">
          <Metric label="Active suppliers" value={snapshot.activeSuppliers > 0 ? snapshot.activeSuppliers.toLocaleString() : "—"} copy="Current supplier records marked active." />
          <Metric label="Supplier-linked products" value={snapshot.supplierProducts > 0 ? snapshot.supplierProducts.toLocaleString() : "—"} copy="Live catalogue products linked to a supplier record." />
          <Metric label="Currently available" value={availability !== null ? `${availability}%` : "—"} copy="Share of supplier-linked catalogue items with stock on hand." />
        </section>

        <section className="mt-14 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-7 md:p-10">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-700">What FreshPick can stand behind today</p>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl font-normal leading-tight md:text-5xl">A curated supply network, connected to real stock.</h2>
            <div className="mt-8 space-y-5">
              <Point icon={Store} title="Curated onboarding" copy="Supplier relationships are reviewed before products are brought into the FreshPick operating model." />
              <Point icon={PackageCheck} title="Catalogue-linked supply" copy="Products can be connected to supplier records, availability and stock levels used by FreshPick commerce." />
              <Point icon={Sprout} title="Room for richer provenance" copy="Farm, origin and harvest-level traceability should only be shown once that information is captured as structured, maintainable product data." />
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#0b1710] p-7 text-white md:p-10">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-200">Why this matters</p>
            <h2 className="mt-3 font-serif text-4xl font-normal leading-tight">Trust is more premium than a made-up origin story.</h2>
            <p className="mt-5 text-sm font-light leading-7 text-white/55">As FreshPick adds structured origin, quality, lead-time and supplier-performance data, those signals can become part of the customer experience. Until then, the storefront should stay precise about what is actually known.</p>
            <Link href="/homemade" className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-emerald-200">Explore local makers <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, copy }: { label: string; value: string; copy: string }) {
  return <article className="rounded-[1.6rem] border border-zinc-200 bg-white p-6"><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-700">{label}</p><p className="mt-4 font-serif text-4xl font-normal tabular-nums text-zinc-950">{value}</p><p className="mt-3 text-xs font-light leading-5 text-zinc-400">{copy}</p></article>;
}

function Point({ icon: Icon, title, copy }: { icon: typeof Store; title: string; copy: string }) {
  return <div className="flex gap-4 border-t border-zinc-100 pt-5 first:border-0 first:pt-0"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-900"><Icon className="h-4 w-4" /></span><div><h3 className="text-sm font-semibold text-zinc-900">{title}</h3><p className="mt-1 text-sm font-light leading-6 text-zinc-500">{copy}</p></div></div>;
}
