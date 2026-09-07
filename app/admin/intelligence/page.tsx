"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Boxes, Building2, Loader2, RefreshCw, TrendingUp } from "lucide-react";

type Forecast = {
  productId: string;
  sku: string;
  name: string;
  supplier: string | null;
  stockQty: number;
  minStockLevel: number;
  units7d: number;
  units30d: number;
  forecastNext7d: number;
  recommendedReorder: number;
  stockCoverDays: number | null;
  risk: "stockout" | "low" | "healthy" | "no-demand";
};

type Supplier = {
  supplierId: string;
  supplier: string;
  activeSkus: number;
  outOfStockSkus: number;
  lowStockSkus: number;
  unitsSold30d: number;
  revenue30d: number;
  availabilityRate: number;
};

type Intelligence = {
  generatedAt: string;
  summary: {
    trackedSkus: number;
    stockoutRisk: number;
    lowStockRisk: number;
    recommendedUnits: number;
    suppliersTracked: number;
  };
  forecasts: Forecast[];
  suppliers: Supplier[];
};

const riskClass: Record<Forecast["risk"], string> = {
  stockout: "bg-rose-50 text-rose-700 border-rose-200",
  low: "bg-amber-50 text-amber-700 border-amber-200",
  healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "no-demand": "bg-zinc-50 text-zinc-500 border-zinc-200",
};

export default function AdminIntelligencePage() {
  const [data, setData] = useState<Intelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<"all" | Forecast["risk"]>("all");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/intelligence", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load operations intelligence");
      const body = await response.json();
      setData(body.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load intelligence");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    return riskFilter === "all" ? data.forecasts : data.forecasts.filter((row) => row.risk === riskFilter);
  }, [data, riskFilter]);

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-zinc-500"><Loader2 className="h-5 w-5 animate-spin" /> Computing demand and availability…</div>;
  }

  if (error || !data) {
    return (
      <div className="border border-rose-200 bg-white p-6">
        <p className="text-sm text-rose-700">{error || "Unable to load intelligence."}</p>
        <button onClick={() => void load()} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-zinc-800"><RefreshCw className="h-4 w-4" /> Retry</button>
      </div>
    );
  }

  const metrics = [
    { label: "Tracked SKUs", value: data.summary.trackedSkus, icon: Boxes },
    { label: "Stockout risk", value: data.summary.stockoutRisk, icon: AlertTriangle },
    { label: "Low-stock risk", value: data.summary.lowStockRisk, icon: TrendingUp },
    { label: "Suggested reorder units", value: data.summary.recommendedUnits, icon: RefreshCw },
    { label: "Suppliers tracked", value: data.summary.suppliersTracked, icon: Building2 },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 border-b border-zinc-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">FreshPick Operations Intelligence</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">Demand, stock and supplier health</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">Forecasts are calculated from actual order-item velocity over the last eight weeks. No placeholder demand numbers are rendered.</p>
        </div>
        <button onClick={() => void load()} className="inline-flex h-10 items-center gap-2 border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"><RefreshCw className="h-4 w-4" /> Recompute</button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between text-zinc-400"><span className="text-xs font-medium uppercase tracking-wide">{label}</span><Icon className="h-4 w-4" /></div>
            <div className="mt-4 text-3xl font-semibold tabular-nums text-zinc-950">{value.toLocaleString()}</div>
          </div>
        ))}
      </section>

      <section className="border border-zinc-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-zinc-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">SKU forecast queue</h2>
            <p className="mt-1 text-sm text-zinc-500">Prioritized by stockout risk, recommended reorder quantity and recent demand.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "stockout", "low", "healthy", "no-demand"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setRiskFilter(filter)}
                className={`border px-3 py-2 text-xs font-semibold capitalize ${riskFilter === filter ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-600"}`}
              >
                {filter.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold">Supplier</th>
                <th className="px-5 py-3 text-right font-semibold">Stock</th>
                <th className="px-5 py-3 text-right font-semibold">7d sold</th>
                <th className="px-5 py-3 text-right font-semibold">30d sold</th>
                <th className="px-5 py-3 text-right font-semibold">Next 7d forecast</th>
                <th className="px-5 py-3 text-right font-semibold">Cover</th>
                <th className="px-5 py-3 text-right font-semibold">Reorder</th>
                <th className="px-5 py-3 font-semibold">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.slice(0, 250).map((row) => (
                <tr key={row.productId} className="hover:bg-zinc-50/70">
                  <td className="px-5 py-4"><div className="font-medium text-zinc-900">{row.name}</div><div className="mt-1 text-xs text-zinc-400">{row.sku}</div></td>
                  <td className="px-5 py-4 text-zinc-600">{row.supplier || "Unassigned"}</td>
                  <td className="px-5 py-4 text-right tabular-nums text-zinc-700">{row.stockQty}</td>
                  <td className="px-5 py-4 text-right tabular-nums text-zinc-700">{row.units7d}</td>
                  <td className="px-5 py-4 text-right tabular-nums text-zinc-700">{row.units30d}</td>
                  <td className="px-5 py-4 text-right font-medium tabular-nums text-zinc-900">{row.forecastNext7d}</td>
                  <td className="px-5 py-4 text-right tabular-nums text-zinc-600">{row.stockCoverDays == null ? "—" : `${row.stockCoverDays}d`}</td>
                  <td className="px-5 py-4 text-right font-semibold tabular-nums text-zinc-950">{row.recommendedReorder}</td>
                  <td className="px-5 py-4"><span className={`inline-flex border px-2.5 py-1 text-xs font-semibold capitalize ${riskClass[row.risk]}`}>{row.risk.replace("-", " ")}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-5">
          <h2 className="text-lg font-semibold text-zinc-950">Supplier availability</h2>
          <p className="mt-1 text-sm text-zinc-500">Health is derived from the live catalogue and 30-day customer demand, not manual scorecards.</p>
        </div>
        <div className="grid gap-px bg-zinc-200 sm:grid-cols-2 xl:grid-cols-3">
          {data.suppliers.slice(0, 18).map((supplier) => (
            <article key={supplier.supplierId} className="bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div><h3 className="font-semibold text-zinc-950">{supplier.supplier}</h3><p className="mt-1 text-xs text-zinc-500">{supplier.activeSkus} active SKUs</p></div>
                <div className="text-right"><div className="text-2xl font-semibold tabular-nums text-zinc-950">{supplier.availabilityRate}%</div><div className="text-xs text-zinc-400">available</div></div>
              </div>
              <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-zinc-100 pt-4 text-xs">
                <div><dt className="text-zinc-400">Out</dt><dd className="mt-1 font-semibold text-zinc-800">{supplier.outOfStockSkus}</dd></div>
                <div><dt className="text-zinc-400">Low</dt><dd className="mt-1 font-semibold text-zinc-800">{supplier.lowStockSkus}</dd></div>
                <div><dt className="text-zinc-400">30d units</dt><dd className="mt-1 font-semibold text-zinc-800">{supplier.unitsSold30d}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
