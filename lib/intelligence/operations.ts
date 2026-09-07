import "server-only";

import prisma from "@/lib/prisma";

const DAY_MS = 86_400_000;

export type DemandForecastRow = {
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

export type SupplierHealthRow = {
  supplierId: string;
  supplier: string;
  activeSkus: number;
  outOfStockSkus: number;
  lowStockSkus: number;
  unitsSold30d: number;
  revenue30d: number;
  availabilityRate: number;
};

export async function getOperationsIntelligence() {
  const now = Date.now();
  const since56 = new Date(now - 56 * DAY_MS);
  const since30 = new Date(now - 30 * DAY_MS);
  const since7 = new Date(now - 7 * DAY_MS);

  const [products, orderItems] = await Promise.all([
    prisma.product.findMany({
      where: { archived: false },
      select: {
        id: true,
        sku: true,
        name: true,
        stockQty: true,
        minStockLevel: true,
        supplierId: true,
        supplier: { select: { id: true, name: true } },
      },
      take: 1500,
    }),
    prisma.orderItem.findMany({
      where: {
        order: {
          status: { in: ["confirmed", "processing", "shipped", "delivered"] },
          createdAt: { gte: since56 },
        },
      },
      select: {
        qty: true,
        total: true,
        productId: true,
        order: { select: { createdAt: true } },
      },
      take: 12000,
    }),
  ]);

  const demandByProduct = new Map<
    string,
    { units7d: number; units30d: number; revenue30d: number; buckets: number[] }
  >();

  for (const item of orderItems) {
    const ageDays = Math.max(0, (now - item.order.createdAt.getTime()) / DAY_MS);
    const bucket = Math.min(7, Math.floor(ageDays / 7));
    const current = demandByProduct.get(item.productId) || {
      units7d: 0,
      units30d: 0,
      revenue30d: 0,
      buckets: Array.from({ length: 8 }, () => 0),
    };
    current.buckets[bucket] += item.qty;
    if (item.order.createdAt >= since7) current.units7d += item.qty;
    if (item.order.createdAt >= since30) {
      current.units30d += item.qty;
      current.revenue30d += Number(item.total);
    }
    demandByProduct.set(item.productId, current);
  }

  const forecasts: DemandForecastRow[] = products.map((product) => {
    const demand = demandByProduct.get(product.id) || {
      units7d: 0,
      units30d: 0,
      revenue30d: 0,
      buckets: Array.from({ length: 8 }, () => 0),
    };
    const recent = demand.buckets[0] || 0;
    const previous = demand.buckets[1] || 0;
    const older = demand.buckets.slice(2).reduce((sum, value) => sum + value, 0) / 6;
    const forecastNext7d = Math.max(0, Math.round(recent * 0.5 + previous * 0.3 + older * 0.2));
    const targetStock = Math.ceil(forecastNext7d * 1.25 + product.minStockLevel);
    const recommendedReorder = Math.max(0, targetStock - product.stockQty);
    const dailyVelocity = demand.units30d / 30;
    const stockCoverDays = dailyVelocity > 0 ? Number((product.stockQty / dailyVelocity).toFixed(1)) : null;

    let risk: DemandForecastRow["risk"] = "healthy";
    if (demand.units30d === 0) risk = "no-demand";
    else if (product.stockQty <= 0) risk = "stockout";
    else if (recommendedReorder > 0 || (stockCoverDays !== null && stockCoverDays < 7)) risk = "low";

    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      supplier: product.supplier?.name || null,
      stockQty: product.stockQty,
      minStockLevel: product.minStockLevel,
      units7d: demand.units7d,
      units30d: demand.units30d,
      forecastNext7d,
      recommendedReorder,
      stockCoverDays,
      risk,
    };
  });

  const supplierMap = new Map<string, SupplierHealthRow>();
  for (const product of products) {
    if (!product.supplierId || !product.supplier) continue;
    const demand = demandByProduct.get(product.id);
    const current = supplierMap.get(product.supplierId) || {
      supplierId: product.supplierId,
      supplier: product.supplier.name,
      activeSkus: 0,
      outOfStockSkus: 0,
      lowStockSkus: 0,
      unitsSold30d: 0,
      revenue30d: 0,
      availabilityRate: 100,
    };
    current.activeSkus += 1;
    if (product.stockQty <= 0) current.outOfStockSkus += 1;
    else if (product.stockQty <= product.minStockLevel) current.lowStockSkus += 1;
    current.unitsSold30d += demand?.units30d || 0;
    current.revenue30d += demand?.revenue30d || 0;
    supplierMap.set(product.supplierId, current);
  }

  const suppliers = Array.from(supplierMap.values())
    .map((supplier) => ({
      ...supplier,
      revenue30d: Number(supplier.revenue30d.toFixed(2)),
      availabilityRate: supplier.activeSkus > 0
        ? Math.round(((supplier.activeSkus - supplier.outOfStockSkus) / supplier.activeSkus) * 100)
        : 100,
    }))
    .sort((a, b) => b.unitsSold30d - a.unitsSold30d);

  const rankedForecasts = forecasts.sort((a, b) => {
    const priority = { stockout: 4, low: 3, healthy: 2, "no-demand": 1 } as const;
    if (priority[a.risk] !== priority[b.risk]) return priority[b.risk] - priority[a.risk];
    return b.recommendedReorder - a.recommendedReorder || b.units30d - a.units30d;
  });

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      trackedSkus: forecasts.length,
      stockoutRisk: forecasts.filter((item) => item.risk === "stockout").length,
      lowStockRisk: forecasts.filter((item) => item.risk === "low").length,
      recommendedUnits: forecasts.reduce((sum, item) => sum + item.recommendedReorder, 0),
      suppliersTracked: suppliers.length,
    },
    forecasts: rankedForecasts,
    suppliers,
  };
}
