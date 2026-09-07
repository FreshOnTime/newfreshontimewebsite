import { NextRequest, NextResponse } from "next/server";
import { listPublishedCollections } from "@/lib/collectionService";

export async function GET(request: NextRequest) {
  try {
    const rawLimit = Number(request.nextUrl.searchParams.get("limit") || 24);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), 60) : 24;
    const collections = await listPublishedCollections(limit);
    return NextResponse.json(
      { collections },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("Get public collections error:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}
