import "server-only";

import prisma from "@/lib/prisma";
import { productCardSelect, serializeProductCardForUi } from "@/lib/productSerializer";

const DAY_MS = 86_400_000;
const LOOKBACK_DAYS = 180;

type ProductSignal = {
  id: string;
  name: string;
  category: { name: string; slug: string } | null;
  tags: string[];
};

type RankedSignal = {
  key: string;
  label: string;
  score: number;
  normalized: number;
};

export type TasteProfile = {
  signalCount: number;
  confidence: number;
  topCategories: RankedSignal[];
  topTags: RankedSignal[];
  generatedAt: string;
};

export type SmartBasketCandidate = {
  product: ReturnType<typeof serializeProductCardForUi>;
  purchaseCount: number;
  averageIntervalDays: number;
  daysSinceLastPurchase: number;
  dueInDays: number;
  dueScore: number;
  confidence: number;
};

export type PersonalizedRecommendation = {
  product: ReturnType<typeof serializeProductCardForUi>;
  score: number;
  reason: string;
};

function addSignal(
  map: Map<string, { label: string; score: number }>,
  key: string | null | undefined,
  label: string | null | undefined,
  weight: number,
) {
  if (!key || !label || !Number.isFinite(weight) || weight <= 0) return;
  const current = map.get(key) || { label, score: 0 };
  current.score += weight;
  map.set(key, current);
}

function rankSignals(map: Map<string, { label: string; score: number }>, limit = 6): RankedSignal[] {
  const ranked = Array.from(map.entries())
    .map(([key, value]) => ({ key, label: value.label, score: Number(value.score.toFixed(2)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const top = ranked[0]?.score || 1;
  return ranked.map((item) => ({
    ...item,
    normalized: Math.max(1, Math.round((item.score / top) * 100)),
  }));
}

function applyProductSignal(
  product: ProductSignal,
  weight: number,
  categories: Map<string, { label: string; score: number }>,
  tags: Map<string, { label: string; score: number }>,
) {
  if (product.category) {
    addSignal(categories, product.category.slug, product.category.name, weight);
  }
  for (const tag of product.tags || []) {
    const clean = tag.trim();
    if (clean) addSignal(tags, clean.toLowerCase(), clean, weight * 0.72);
  }
}

export async function getTasteProfile(userId: string): Promise<TasteProfile> {
  const since = new Date(Date.now() - LOOKBACK_DAYS * DAY_MS);
  const [orders, wishlist, bags] = await Promise.all([
    prisma.order.findMany({
      where: {
        customerId: userId,
        status: { in: ["confirmed", "processing", "shipped", "delivered"] },
        createdAt: { gte: since },
      },
      select: {
        createdAt: true,
        items: {
          select: {
            qty: true,
            product: {
              select: {
                id: true,
                name: true,
                tags: true,
                category: { select: { name: true, slug: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.wishlistItem.findMany({
      where: { userId },
      select: {
        product: {
          select: {
            id: true,
            name: true,
            tags: true,
            category: { select: { name: true, slug: true } },
          },
        },
      },
      take: 80,
    }),
    prisma.bag.findMany({
      where: { userId, isActive: true },
      select: {
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
                tags: true,
                category: { select: { name: true, slug: true } },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
  ]);

  const categories = new Map<string, { label: string; score: number }>();
  const tags = new Map<string, { label: string; score: number }>();
  let signalCount = 0;

  for (const order of orders) {
    const ageDays = Math.max(0, (Date.now() - order.createdAt.getTime()) / DAY_MS);
    const recency = Math.max(0.45, 1 - ageDays / (LOOKBACK_DAYS * 1.5));
    for (const item of order.items) {
      const weight = Math.max(1, item.qty) * 5 * recency;
      applyProductSignal(item.product, weight, categories, tags);
      signalCount += 1;
    }
  }

  for (const item of wishlist) {
    applyProductSignal(item.product, 2.2, categories, tags);
    signalCount += 1;
  }

  for (const bag of bags) {
    for (const item of bag.items) {
      applyProductSignal(item.product, Math.max(1, item.quantity) * 1.4, categories, tags);
      signalCount += 1;
    }
  }

  return {
    signalCount,
    confidence: Math.min(100, Math.round(18 + Math.log2(signalCount + 1) * 16)),
    topCategories: rankSignals(categories),
    topTags: rankSignals(tags),
    generatedAt: new Date().toISOString(),
  };
}

export async function getSmartBasket(userId: string, limit = 8): Promise<SmartBasketCandidate[]> {
  const orders = await prisma.order.findMany({
    where: {
      customerId: userId,
      status: "delivered",
      createdAt: { gte: new Date(Date.now() - 365 * DAY_MS) },
    },
    select: {
      createdAt: true,
      items: {
        select: {
          qty: true,
          productId: true,
          product: { select: productCardSelect },
        },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 80,
  });

  const history = new Map<
    string,
    { dates: Date[]; product: (typeof orders)[number]["items"][number]["product"] }
  >();

  for (const order of orders) {
    for (const item of order.items) {
      if (item.product.stockQty <= 0) continue;
      const current = history.get(item.productId) || { dates: [], product: item.product };
      current.dates.push(order.createdAt);
      current.product = item.product;
      history.set(item.productId, current);
    }
  }

  const now = Date.now();
  return Array.from(history.values())
    .flatMap(({ dates, product }) => {
      if (dates.length < 2) return [];
      const intervals: number[] = [];
      for (let index = 1; index < dates.length; index += 1) {
        intervals.push(Math.max(1, (dates[index].getTime() - dates[index - 1].getTime()) / DAY_MS));
      }
      const averageIntervalDays = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
      const lastPurchase = dates[dates.length - 1];
      const daysSinceLastPurchase = Math.max(0, (now - lastPurchase.getTime()) / DAY_MS);
      const ratio = daysSinceLastPurchase / Math.max(1, averageIntervalDays);
      const dueScore = Math.min(1.35, ratio);
      const dueInDays = Math.round(averageIntervalDays - daysSinceLastPurchase);
      const intervalSpread =
        intervals.length <= 1
          ? averageIntervalDays * 0.45
          : Math.sqrt(
              intervals.reduce((sum, value) => sum + Math.pow(value - averageIntervalDays, 2), 0) /
                intervals.length,
            );
      const regularity = Math.max(0, 1 - intervalSpread / Math.max(averageIntervalDays, 1));
      const confidence = Math.min(100, Math.round(35 + Math.min(dates.length, 6) * 8 + regularity * 20));

      if (dueScore < 0.58) return [];
      return [
        {
          product: serializeProductCardForUi(product),
          purchaseCount: dates.length,
          averageIntervalDays: Math.max(1, Math.round(averageIntervalDays)),
          daysSinceLastPurchase: Math.round(daysSinceLastPurchase),
          dueInDays,
          dueScore: Number(dueScore.toFixed(2)),
          confidence,
        },
      ];
    })
    .sort((a, b) => b.dueScore * b.confidence - a.dueScore * a.confidence)
    .slice(0, Math.min(Math.max(limit, 1), 16));
}

export async function getPersonalizedRecommendations(
  userId: string,
  limit = 12,
): Promise<PersonalizedRecommendation[]> {
  const profile = await getTasteProfile(userId);
  const categoryScores = new Map(profile.topCategories.map((item) => [item.key, item.normalized / 100]));
  const tagScores = new Map(profile.topTags.map((item) => [item.key, item.normalized / 100]));

  const products = await prisma.product.findMany({
    where: { archived: false, stockQty: { gt: 0 } },
    select: {
      ...productCardSelect,
      tags: true,
      isFeatured: true,
      category: { select: { name: true, slug: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 120,
  });

  return products
    .map((product) => {
      const categoryScore = product.category ? categoryScores.get(product.category.slug) || 0 : 0;
      const matchedTags = product.tags
        .map((tag) => tagScores.get(tag.trim().toLowerCase()) || 0)
        .filter((score) => score > 0);
      const tagScore = matchedTags.length ? matchedTags.reduce((sum, score) => sum + score, 0) / matchedTags.length : 0;
      const score = categoryScore * 0.64 + tagScore * 0.28 + (product.isFeatured ? 0.08 : 0);
      const reason = categoryScore >= tagScore && product.category
        ? `Because ${product.category.name.toLowerCase()} is strong in your Taste Graph`
        : matchedTags.length > 0
          ? "Because it matches food signals you keep returning to"
          : "A fresh catalogue pick";
      return {
        product: serializeProductCardForUi(product),
        score: Number(score.toFixed(3)),
        reason,
      };
    })
    .filter((item) => profile.signalCount === 0 || item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(Math.max(limit, 1), 24));
}

export async function getTrendingProducts(limit = 6) {
  const since = new Date(Date.now() - 30 * DAY_MS);
  const items = await prisma.orderItem.findMany({
    where: {
      order: {
        status: { in: ["confirmed", "processing", "shipped", "delivered"] },
        createdAt: { gte: since },
      },
      product: { archived: false, stockQty: { gt: 0 } },
    },
    select: {
      qty: true,
      productId: true,
      product: { select: productCardSelect },
    },
    take: 1200,
  });

  const grouped = new Map<string, { units: number; product: (typeof items)[number]["product"] }>();
  for (const item of items) {
    const current = grouped.get(item.productId) || { units: 0, product: item.product };
    current.units += item.qty;
    grouped.set(item.productId, current);
  }

  return Array.from(grouped.values())
    .sort((a, b) => b.units - a.units)
    .slice(0, Math.min(Math.max(limit, 1), 12))
    .map((item) => ({ units: item.units, product: serializeProductCardForUi(item.product) }));
}

export async function getIntelligenceOverview(userId: string) {
  const [taste, smartBasket, recommendations] = await Promise.all([
    getTasteProfile(userId),
    getSmartBasket(userId, 8),
    getPersonalizedRecommendations(userId, 12),
  ]);
  return { taste, smartBasket, recommendations };
}
