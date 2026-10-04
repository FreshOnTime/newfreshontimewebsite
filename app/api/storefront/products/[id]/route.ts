import { NextRequest, NextResponse } from "next/server";
import { loadStorefrontProduct } from "@/lib/storefrontProducts";

export const revalidate = 300;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await loadStorefrontProduct(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[Storefront product] Failed to fetch product:", error);
    return NextResponse.json({ error: "Unable to load product" }, { status: 500 });
  }
}
