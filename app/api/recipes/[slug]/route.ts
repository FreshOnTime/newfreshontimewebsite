import { NextResponse } from "next/server";
import { getPublishedRecipeBySlug } from "@/lib/recipeService";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const recipe = await getPublishedRecipeBySlug(slug);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(
      { recipe },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("Get recipe error:", error);
    return NextResponse.json({ error: "Failed to fetch recipe" }, { status: 500 });
  }
}
