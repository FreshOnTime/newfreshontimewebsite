import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeProductForUi } from "@/lib/productSerializer";

export const revalidate = 300;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { sku: id }, { slug: id }] },
      include: { category: { select: { name: true, slug: true } } },
    });

    if (!product || product.archived) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(serializeProductForUi(product), {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[Storefront product] Failed to fetch product:", error);
    return NextResponse.json({ error: "Unable to load product" }, { status: 500 });
  }
}
