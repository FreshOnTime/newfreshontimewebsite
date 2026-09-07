import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { BAG_INCLUDE, bagTotal, serializeBag } from "@/lib/bagSerializer";
import { getIntelligenceOverview, getSmartBasket } from "@/lib/intelligence/tasteGraph";

type AuthedRequest = NextRequest & {
  user?: { userId: string; role: string; mongoId?: string };
};

export const dynamic = "force-dynamic";

export const GET = requireAuth(async (request: AuthedRequest) => {
  try {
    const userId = request.user?.mongoId || request.user?.userId;
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const data = await getIntelligenceOverview(userId);
    const safeData = data.taste.signalCount === 0
      ? {
          ...data,
          taste: { ...data.taste, confidence: 0 },
          recommendations: [],
        }
      : data;

    return NextResponse.json({ success: true, data: safeData }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[Intelligence] Failed to build customer overview:", error);
    return NextResponse.json({ error: "Failed to build your FreshPick intelligence" }, { status: 500 });
  }
});

export const POST = requireAuth(async (request: AuthedRequest) => {
  try {
    const userId = request.user?.mongoId || request.user?.userId;
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    let requestedIds: string[] | undefined;
    try {
      const body = await request.json();
      if (Array.isArray(body?.productIds)) {
        requestedIds = body.productIds.filter((value: unknown): value is string => typeof value === "string").slice(0, 20);
      }
    } catch {
      requestedIds = undefined;
    }

    const due = await getSmartBasket(userId, 12);
    const eligible = due.filter((candidate) => !requestedIds || requestedIds.includes(candidate.product._id));
    if (eligible.length === 0) {
      return NextResponse.json({ success: true, added: 0, message: "Nothing is due yet." });
    }

    let bag = await prisma.bag.findFirst({
      where: { userId, isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!bag) {
      bag = await prisma.bag.create({
        data: {
          userId,
          name: "Smart Basket",
          description: "Replenishment suggestions generated from your FreshPick order rhythm.",
          tags: ["smart-basket", "replenishment"],
        },
      });
    }

    const productIds = eligible.map((candidate) => candidate.product._id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, archived: false, stockQty: { gt: 0 } },
      select: { id: true, price: true, stockQty: true },
    });
    const byId = new Map(products.map((product) => [product.id, product]));

    let added = 0;
    await prisma.$transaction(async (tx) => {
      for (const candidate of eligible) {
        const product = byId.get(candidate.product._id);
        if (!product || product.stockQty <= 0) continue;
        const existing = await tx.bagItem.findUnique({
          where: { bagId_productId: { bagId: bag!.id, productId: product.id } },
          select: { quantity: true },
        });
        const nextQuantity = Math.min(product.stockQty, (existing?.quantity || 0) + 1);
        await tx.bagItem.upsert({
          where: { bagId_productId: { bagId: bag!.id, productId: product.id } },
          update: { quantity: nextQuantity, price: product.price },
          create: { bagId: bag!.id, productId: product.id, quantity: 1, price: product.price },
        });
        added += 1;
      }

      const items = await tx.bagItem.findMany({
        where: { bagId: bag!.id },
        select: { price: true, quantity: true },
      });
      await tx.bag.update({
        where: { id: bag!.id },
        data: { totalAmount: bagTotal(items.map((item) => ({ price: Number(item.price), quantity: item.quantity }))) },
      });
    });

    const refreshedBag = await prisma.bag.findUnique({ where: { id: bag.id }, include: BAG_INCLUDE });
    return NextResponse.json({
      success: true,
      added,
      bagId: bag.id,
      data: refreshedBag ? serializeBag(refreshedBag) : null,
    });
  } catch (error) {
    console.error("[Intelligence] Failed to build smart basket:", error);
    return NextResponse.json({ error: "Failed to build Smart Basket" }, { status: 500 });
  }
});
