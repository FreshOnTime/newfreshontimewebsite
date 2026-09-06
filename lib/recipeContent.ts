import { z } from "zod";
import type { RecipeContent } from "@/models/recipe";

export const recipeIngredientInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(999),
  note: z.string().trim().max(160).optional().default(""),
  optional: z.boolean().optional().default(false),
  substitutionProductIds: z.array(z.string().min(1)).max(5).optional().default([]),
});

export const recipeContentSchema = z.object({
  version: z.literal(1).optional().default(1),
  story: z.string().trim().max(12000).optional().default(""),
  prepTimeMinutes: z.number().int().nonnegative().max(1440).optional().default(0),
  cookTimeMinutes: z.number().int().nonnegative().max(1440).optional().default(0),
  servings: z.number().int().positive().max(100).optional().default(2),
  cuisine: z.string().trim().max(80).optional().default(""),
  dietaryTags: z.array(z.string().trim().min(1).max(60)).max(20).optional().default([]),
  ingredients: z.array(recipeIngredientInputSchema).min(1).max(100),
  steps: z.array(z.string().trim().min(1).max(2000)).min(1).max(40),
});

export function parseRecipeContent(value: string): RecipeContent | null {
  try {
    const parsed = JSON.parse(value) as unknown;
    const result = recipeContentSchema.safeParse(parsed);
    return result.success ? (result.data as RecipeContent) : null;
  } catch {
    return null;
  }
}

export function stringifyRecipeContent(value: unknown): string {
  const parsed = recipeContentSchema.parse(value);
  return JSON.stringify(parsed);
}

export function slugifyRecipe(value: string): string {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeFeaturedImage(value: unknown): { url: string; alt?: string } | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as { url?: unknown; alt?: unknown };
  if (typeof candidate.url !== "string" || !candidate.url.trim()) return undefined;
  return {
    url: candidate.url,
    alt: typeof candidate.alt === "string" && candidate.alt.trim() ? candidate.alt : undefined,
  };
}
