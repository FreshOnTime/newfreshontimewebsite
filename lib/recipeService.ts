import "server-only";

import prisma from "@/lib/prisma";
import { productCardSelect, serializeProductCardForUi } from "@/lib/productSerializer";
import { normalizeFeaturedImage, parseRecipeContent } from "@/lib/recipeContent";
import type { RecipeContent, RecipeDetail, RecipeSummary } from "@/models/recipe";

type RecipeBlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: unknown;
  tags: string[];
  published: boolean;
  publishedAt: Date | null;
  authorName: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

const recipeSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  featuredImage: true,
  tags: true,
  published: true,
  publishedAt: true,
  authorName: true,
  metaTitle: true,
  metaDescription: true,
} as const;

function toSummary(row: RecipeBlogRow, content: RecipeContent): RecipeSummary {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    featuredImage: normalizeFeaturedImage(row.featuredImage),
    tags: row.tags,
    authorName: row.authorName || undefined,
    publishedAt: row.publishedAt?.toISOString(),
    prepTimeMinutes: content.prepTimeMinutes,
    cookTimeMinutes: content.cookTimeMinutes,
    servings: content.servings,
    cuisine: content.cuisine,
    dietaryTags: content.dietaryTags,
    ingredientCount: content.ingredients.length,
  };
}

export async function listPublishedRecipes(limit = 24): Promise<RecipeSummary[]> {
  const rows = await prisma.blog.findMany({
    where: {
      category: "recipe",
      published: true,
      isDeleted: false,
    },
    select: recipeSelect,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: Math.min(Math.max(limit, 1), 60),
  });

  return rows.flatMap((row) => {
    const content = parseRecipeContent(row.content);
    return content ? [toSummary(row as RecipeBlogRow, content)] : [];
  });
}

export async function getPublishedRecipeBySlug(slug: string): Promise<RecipeDetail | null> {
  const row = await prisma.blog.findUnique({
    where: { slug },
    select: recipeSelect,
  });

  if (!row || row.category === "recipe") {
    // category is not selected above; this branch is intentionally replaced below.
  }

  const recipeRow = await prisma.blog.findFirst({
    where: {
      slug,
      category: "recipe",
      published: true,
      isDeleted: false,
    },
    select: recipeSelect,
  });

  if (!recipeRow) return null;
  const content = parseRecipeContent(recipeRow.content);
  if (!content) return null;

  const productIds = Array.from(
    new Set(
      content.ingredients.flatMap((ingredient) => [
        ingredient.productId,
        ...ingredient.substitutionProductIds,
      ])
    )
  );

  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds }, archived: false },
        select: productCardSelect,
      })
    : [];

  const productsById = new Map(
    products.map((product) => [product.id, serializeProductCardForUi(product)])
  );

  return {
    ...toSummary(recipeRow as RecipeBlogRow, content),
    story: content.story,
    steps: content.steps,
    ingredients: content.ingredients.map((ingredient) => ({
      productId: ingredient.productId,
      quantity: ingredient.quantity,
      note: ingredient.note || undefined,
      optional: ingredient.optional,
      product: productsById.get(ingredient.productId) || null,
      substitutions: ingredient.substitutionProductIds
        .map((id) => productsById.get(id))
        .filter((product): product is NonNullable<typeof product> => Boolean(product)),
    })),
    metaTitle: recipeRow.metaTitle || undefined,
    metaDescription: recipeRow.metaDescription || undefined,
  };
}

export async function getRecipeContentBySlugForCommerce(slug: string) {
  const row = await prisma.blog.findFirst({
    where: {
      slug,
      category: "recipe",
      published: true,
      isDeleted: false,
    },
    select: { id: true, title: true, content: true },
  });
  if (!row) return null;
  const content = parseRecipeContent(row.content);
  return content ? { ...row, content } : null;
}
