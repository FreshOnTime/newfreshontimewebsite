import { NextRequest, NextResponse } from "next/server";
import { listPublishedRecipes } from "@/lib/recipeService";

export async function GET(request: NextRequest) {
  try {
    const rawLimit = Number(request.nextUrl.searchParams.get("limit") || 24);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), 60) : 24;
    const recipes = await listPublishedRecipes(limit);

    return NextResponse.json(
      { recipes },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("Get public recipes error:", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}
