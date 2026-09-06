import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { BAG_INCLUDE, bagTotal, serializeBag } from "@/lib/bagSerializer";
import { getRecipeContentBySlugForCommerce } from "@/lib/recipeService";

type Context = { params: Promise<{ slug: string }> };
type AuthedRequest = NextRequest & {
  user?: { userId: string; role: string; mongoId?: string };
};

type AddedItem = {
  requestedProductId: string;
  productId: string;
  productName: string;
  quantity: number;
  substituted: boolean;
};

type SkippedItem = {
  productId: string;
  quantity: number;
  optional: boolean;
  reason: "unavailable" | "insufficient_stock";
};

export const POST = requireAuth(async (request: AuthedRequest, context: Context) => {
  try {
    const userId = request.user?.mongoId || request.user?.userId;
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { slug } = await context.params;
    const recipe = await getRecipeContentBySlugForCommerce(slug);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    let requestedBagId: string | undefined;
    try {
      const body = await request.json();
      requestedBagId = typeof body?.bagId === "string" ? body.bagId : undefined;
    } catch {
      requestedBagId = undefined;
    }

    let bag = requestedBagId
      ? await prisma.bag.findFirst({ where: { id: requestedBagId, userId, isActive: true } })
      : await prisma.bag.findFirst({
          where: { userId, isActive: true },
          orderBy: { updatedAt: "desc" },
        });

    if (!bag) {
      bag = await prisma.bag.create({
        data: {
          userId,
          name: `${recipe.title} basket`,
          description: `Ingredients selected from FreshPick recipe: ${recipe.title}`,
          tags: ["recipe", recipe.id],
        },
      });
    }

    const allProductIds = Array.from(
      new Set(
        recipe.content.ingredients.flatMap((ingredient) => [
          ingredient.productId,
          ...ingredient.substitutionProductIds,
        ])
      )
    );

    const [products, existingItems] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: allProductIds }, archived: false },
        select: { id: true, name: true, price: true, stockQty: true },
      }),
      prisma.bagItem.findMany({
        where: { bagId: bag.id, productId: { in: allProductIds } },
        select: { productId: true, quantity: true },
      }),
    ]);

    const productsById = new Map(products.map((product) => [product.id, product]));
    const reservedByProduct = new Map(existingItems.map((item) => [item.productId, item.quantity]));
    const plannedByProduct = new Map<string, number>();
    const added: AddedItem[] = [];
    const skipped: SkippedItem[] = [];

    for (const ingredient of recipe.content.ingredients) {
      const candidates = [ingredient.productId, ...ingredient.substitutionProductIds];
      let chosen: (typeof products)[number] | undefined;
      let sawCandidate = false;

      for (const candidateId of candidates) {
        const product = productsById.get(candidateId);
        if (!product) continue;
        sawCandidate = true;
        const alreadyInBag = reservedByProduct.get(product.id) || 0;
        const alreadyPlanned = plannedByProduct.get(product.id) || 0;
        if (product.stockQty >= alreadyInBag + alreadyPlanned + ingredient.quantity) {
          chosen = product;
          break;
        }
      }

      if (!chosen) {
        skipped.push({
          productId: ingredient.productId,
          quantity: ingredient.quantity,
          optional: ingredient.optional,
          reason: sawCandidate ? "insufficient_stock" : "unavailable",
        });
        continue;
      }

      plannedByProduct.set(
        chosen.id,
        (plannedByProduct.get(chosen.id) || 0) + ingredient.quantity
      );
      added.push({
        requestedProductId: ingredient.productId,
        productId: chosen.id,
        productName: chosen.name,
        quantity: ingredient.quantity,
        substituted: chosen.id !== ingredient.productId,
      });
    }

    if (plannedByProduct.size > 0) {
      await prisma.$transaction(async (tx) => {
        for (const [productId, quantityToAdd] of plannedByProduct) {
          const product = productsById.get(productId);
          if (!product) continue;
          const currentQuantity = reservedByProduct.get(productId) || 0;
          await tx.bagItem.upsert({
            where: { bagId_productId: { bagId: bag!.id, productId } },
            update: {
              quantity: currentQuantity + quantityToAdd,
              price: Number(product.price),
            },
            create: {
              bagId: bag!.id,
              productId,
              quantity: quantityToAdd,
              price: Number(product.price),
            },
          });
        }

        const items = await tx.bagItem.findMany({
          where: { bagId: bag!.id },
          select: { price: true, quantity: true },
        });
        await tx.bag.update({
          where: { id: bag!.id },
          data: {
            totalAmount: bagTotal(
              items.map((item) => ({ price: Number(item.price), quantity: item.quantity }))
            ),
          },
        });
      });
    }

    const refreshedBag = await prisma.bag.findUnique({
      where: { id: bag.id },
      include: BAG_INCLUDE,
    });

    return NextResponse.json({
      success: true,
      bagId: bag.id,
      added,
      skipped,
      data: refreshedBag ? serializeBag(refreshedBag) : null,
    });
  } catch (error) {
    console.error("Add recipe to bag error:", error);
    return NextResponse.json({ error: "Failed to add recipe to bag" }, { status: 500 });
  }
});
