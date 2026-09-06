import "server-only";

import prisma from "@/lib/prisma";
import { parseFoodCollectionContent } from "@/lib/collectionContent";
import { normalizeFeaturedImage, parseRecipeContent } from "@/lib/recipeContent";
import { productCardSelect, serializeProductCardForUi } from "@/lib/productSerializer";
import type { FoodCollectionContent, FoodCollectionDetail, FoodCollectionSummary } from "@/models/foodCollection";
import type { RecipeSummary } from "@/models/recipe";

type CollectionRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: unknown;
  publishedAt: Date | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

const collectionSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  featuredImage: true,
  publishedAt: true,
  metaTitle: true,
  metaDescription: true,
} as const;

function collectionSummary(row: CollectionRow, content: FoodCollectionContent): FoodCollectionSummary {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    featuredImage: normalizeFeaturedImage(row.featuredImage),
    eyebrow: content.eyebrow,
    occasion: content.occasion,
    themeTags: content.themeTags,
    recipeCount: content.recipeSlugs.length,
    productCount: content.productIds.length,
    publishedAt: row.publishedAt?.toISOString(),
  };
}

export async function listPublishedCollections(limit = 24): Promise<FoodCollectionSummary[]> {
  const rows = await prisma.blog.findMany({
    where: { category: "collection", published: true, isDeleted: false },
    select: collectionSelect,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: Math.min(Math.max(limit, 1), 60),
  });

  return rows.flatMap((row) => {
    const content = parseFoodCollectionContent(row.content);
    return content ? [collectionSummary(row as CollectionRow, content)] : [];
  });
}

export async function getPublishedCollectionBySlug(slug: string): Promise<FoodCollectionDetail | null> {
  const row = await prisma.blog.findFirst({
    where: { slug, category: "collection", published: true, isDeleted: false },
    select: collectionSelect,
  });
  if (!row) return null;

  const content = parseFoodCollectionContent(row.content);
  if (!content) return null;

  const [recipeRows, productRows] = await Promise.all([
    content.recipeSlugs.length
      ? prisma.blog.findMany({
          where: {
            slug: { in: content.recipeSlugs },
            category: "recipe",
            published: true,
            isDeleted: false,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            content: true,
            featuredImage: true,
            tags: true,
            publishedAt: true,
            authorName: true,
          },
        })
      : Promise.resolve([]),
    content.productIds.length
      ? prisma.product.findMany({
          where: { id: { in: content.productIds }, archived: false },
          select: productCardSelect,
        })
      : Promise.resolve([]),
  ]);

  const recipeMap = new Map<string, RecipeSummary>();
  for (const recipeRow of recipeRows) {
    const recipeContent = parseRecipeContent(recipeRow.content);
    if (!recipeContent) continue;
    recipeMap.set(recipeRow.slug, {
      id: recipeRow.id,
      title: recipeRow.title,
      slug: recipeRow.slug,
      excerpt: recipeRow.excerpt,
      featuredImage: normalizeFeaturedImage(recipeRow.featuredImage),
      tags: recipeRow.tags,
      authorName: recipeRow.authorName || undefined,
      publishedAt: recipeRow.publishedAt?.toISOString(),
      prepTimeMinutes: recipeContent.prepTimeMinutes,
      cookTimeMinutes: recipeContent.cookTimeMinutes,
      servings: recipeContent.servings,
      cuisine: recipeContent.cuisine,
      dietaryTags: recipeContent.dietaryTags,
      ingredientCount: recipeContent.ingredients.length,
    });
  }

  const productMap = new Map(productRows.map((product) => [product.id, serializeProductCardForUi(product)]));

  return {
    ...collectionSummary(row as CollectionRow, content),
    story: content.story,
    recipes: content.recipeSlugs.map((recipeSlug) => recipeMap.get(recipeSlug)).filter((recipe): recipe is RecipeSummary => Boolean(recipe)),
    products: content.productIds.map((productId) => productMap.get(productId)).filter((product): product is NonNullable<typeof product> => Boolean(product)),
    metaTitle: row.metaTitle || undefined,
    metaDescription: row.metaDescription || undefined,
  };
}
