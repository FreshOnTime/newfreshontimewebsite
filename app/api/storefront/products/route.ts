import { NextRequest, NextResponse } from "next/server";
import { loadStorefrontProducts } from "@/lib/storefrontProducts";

// Filters depend on each request. CDN caching is set on successful responses.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const data = await loadStorefrontProducts(request.nextUrl.searchParams.toString());
    return NextResponse.json(
      data,
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("[Storefront products] Failed to fetch products:", error);
    return NextResponse.json(
      {
        products: [],
        pagination: { page: 1, limit: 24, count: 0, hasNext: false, hasPrev: false },
      },
      { status: 500 }
    );
  }
}
