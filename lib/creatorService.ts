import "server-only";

import prisma from "@/lib/prisma";
import { normalizeFeaturedImage, parseRecipeContent } from "@/lib/recipeContent";

export type CreatorSummary = {
  id: string;
  name: string;
  recipeCount: number;
  totalViews: number;
  totalLikes: number;
  cuisines: string[];
  latestRecipe: {
    title: string;
    slug: string;
    image?: { url: string; alt?: string };
  } | null;
};

export type CreatorDetail = CreatorSummary & {
  recipes: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    image?: { url: string; alt?: string };
    cuisine: string;
    prepMinutes: number;
    cookMinutes: number;
    views: number;
    likes: number;
    publishedAt?: string;
  }>;
};

function displayName(firstName: string, lastName: string | null, authorName: string | null) {
  const fromUser = [firstName, lastName].filter(Boolean).join(" ").trim();
  return authorName?.trim() || fromUser || "FreshPick creator";
}

export async function listCreators(limit = 40): Promise<CreatorSummary[]> {
  const rows = await prisma.blog.findMany({
    where: { category: "recipe", published: true, isDeleted: false },
    select: {
      authorId: true,
      authorName: true,
      title: true,
      slug: true,
      content: true,
      featuredImage: true,
      views: true,
      likes: true,
      publishedAt: true,
      author: { select: { firstName: true, lastName: true } },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 300,
  });

  const grouped = new Map<
    string,
    {
      name: string;
      recipeCount: number;
      totalViews: number;
      totalLikes: number;
      cuisines: Set<string>;
      latestRecipe: CreatorSummary["latestRecipe"];
      latestAt: number;
    }
  >();

  for (const row of rows) {
    const parsed = parseRecipeContent(row.content);
    if (!parsed) continue;
    const current = grouped.get(row.authorId) || {
      name: displayName(row.author.firstName, row.author.lastName, row.authorName),
      recipeCount: 0,
      totalViews: 0,
      totalLikes: 0,
      cuisines: new Set<string>(),
      latestRecipe: null,
      latestAt: 0,
    };
    current.recipeCount += 1;
    current.totalViews += row.views;
    current.totalLikes += row.likes;
    if (parsed.cuisine?.trim()) current.cuisines.add(parsed.cuisine.trim());
    const publishedAt = row.publishedAt?.getTime() || 0;
    if (!current.latestRecipe || publishedAt >= current.latestAt) {
      current.latestAt = publishedAt;
      current.latestRecipe = {
        title: row.title,
        slug: row.slug,
        image: normalizeFeaturedImage(row.featuredImage),
      };
    }
    grouped.set(row.authorId, current);
  }

  return Array.from(grouped.entries())
    .map(([id, value]) => ({
      id,
      name: value.name,
      recipeCount: value.recipeCount,
      totalViews: value.totalViews,
      totalLikes: value.totalLikes,
      cuisines: Array.from(value.cuisines).slice(0, 6),
      latestRecipe: value.latestRecipe,
    }))
    .sort((a, b) => b.recipeCount - a.recipeCount || b.totalViews - a.totalViews)
    .slice(0, Math.min(Math.max(limit, 1), 100));
}

export async function getCreatorById(id: string): Promise<CreatorDetail | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, firstName: true, lastName: true },
  });
  if (!user) return null;

  const rows = await prisma.blog.findMany({
    where: { authorId: id, category: "recipe", published: true, isDeleted: false },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      featuredImage: true,
      views: true,
      likes: true,
      authorName: true,
      publishedAt: true,
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  const recipes = rows.flatMap((row) => {
    const parsed = parseRecipeContent(row.content);
    if (!parsed) return [];
    return [{
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      image: normalizeFeaturedImage(row.featuredImage),
      cuisine: parsed.cuisine,
      prepMinutes: parsed.prepTimeMinutes,
      cookMinutes: parsed.cookTimeMinutes,
      views: row.views,
      likes: row.likes,
      publishedAt: row.publishedAt?.toISOString(),
    }];
  });

  if (recipes.length === 0) return null;
  const name = displayName(user.firstName, user.lastName, rows[0]?.authorName || null);
  const cuisines = Array.from(new Set(recipes.map((recipe) => recipe.cuisine).filter(Boolean)));

  return {
    id,
    name,
    recipeCount: recipes.length,
    totalViews: recipes.reduce((sum, recipe) => sum + recipe.views, 0),
    totalLikes: recipes.reduce((sum, recipe) => sum + recipe.likes, 0),
    cuisines: cuisines.slice(0, 8),
    latestRecipe: recipes[0]
      ? { title: recipes[0].title, slug: recipes[0].slug, image: recipes[0].image }
      : null,
    recipes,
  };
}
