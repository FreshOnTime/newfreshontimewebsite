import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import type { Metadata } from "next";

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
    <main className="min-h-screen bg-background pb-10 text-zinc-950">
      <PremiumPageHeader title="Fresh from the farm" subtitle="Browse fresh produce and food from local suppliers." />

      <div className="mx-auto max-w-6xl px-5 pt-14 md:px-8 md:pt-8">
        <section className="grid gap-4 sm:grid-cols-3">
          <Metric label="Active suppliers" value={snapshot.activeSuppliers > 0 ? snapshot.activeSuppliers.toLocaleString() : "—"} copy="Current supplier records marked active." />
          <Metric label="Supplier-linked products" value={snapshot.supplierProducts > 0 ? snapshot.supplierProducts.toLocaleString() : "—"} copy="Live catalogue products linked to a supplier record." />
          <Metric label="Currently available" value={availability !== null ? `${availability}%` : "—"} copy="Share of supplier-linked catalogue items with stock on hand." />
        </section>

        <section className="mt-14 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-xl border border-zinc-200 bg-background p-7 md:p-10">
            <p className="text-xs font-bold normal-case text-emerald-700">What FreshPick can stand behind today</p>
            <h2 className="mt-3 max-w-2xl font-sans text-2xl font-semibold leading-tight md:text-2xl">A curated supply network, connected to real stock.</h2>
            <div className="mt-8 space-y-5">
              <Point icon={Store} title="Curated onboarding" copy="Supplier relationships are reviewed before products are brought into the FreshPick operating model." />
              <Point icon={PackageCheck} title="Catalogue-linked supply" copy="Products can be connected to supplier records, availability and stock levels used by FreshPick commerce." />
              <Point icon={Sprout} title="Room for richer provenance" copy="Farm, origin and harvest-level traceability should only be shown once that information is captured as structured, maintainable product data." />
            </div>
          </div>

          <div className="rounded-xl bg-background p-7 text-foreground md:p-10">
            <p className="text-xs font-bold normal-case text-brand-green">Why this matters</p>
            <h2 className="mt-3 font-sans text-2xl font-semibold leading-tight">Trust is more premium than a made-up origin story.</h2>
            <p className="mt-5 text-sm font-normal leading-7 text-muted-foreground">As FreshPick adds structured origin, quality, lead-time and supplier-performance data, those signals can become part of the customer experience. Until then, the storefront should stay precise about what is actually known.</p>
            <Link href="/homemade" className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-brand-green">Explore local makers <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, copy }: { label: string; value: string; copy: string }) {
  return <article className="rounded-xl border border-zinc-200 bg-background p-6"><p className="text-xs font-bold normal-case text-emerald-700">{label}</p><p className="mt-4 font-sans text-4xl font-normal tabular-nums text-zinc-950">{value}</p><p className="mt-3 text-xs font-normal leading-5 text-muted-foreground">{copy}</p></article>;
}

function Point({ icon: Icon, title, copy }: { icon: typeof Store; title: string; copy: string }) {
  return <div className="flex gap-4 border-t border-zinc-100 pt-5 first:border-0 first:pt-0"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-900"><Icon className="h-4 w-4" /></span><div><h3 className="text-sm font-semibold text-zinc-900">{title}</h3><p className="mt-1 text-sm font-normal leading-6 text-zinc-500">{copy}</p></div></div>;
}
