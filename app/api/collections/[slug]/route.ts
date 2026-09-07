import { NextResponse } from "next/server";
import { getPublishedCollectionBySlug } from "@/lib/collectionService";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const collection = await getPublishedCollectionBySlug(slug);
    if (!collection) return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    return NextResponse.json(
      { collection },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("Get collection error:", error);
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
  }
}
