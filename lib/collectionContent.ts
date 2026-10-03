import { z } from "zod";
import type { FoodCollectionContent } from "@/models/foodCollection";
import { slugifyEditorial } from "@/lib/editorialContent";

export const foodCollectionContentSchema = z.object({
  version: z.literal(1).optional().default(1),
  eyebrow: z.string().trim().max(80).optional().default("FreshPick edit"),
  story: z.string().trim().max(12000).optional().default(""),
  occasion: z.string().trim().max(80).optional().default(""),
  themeTags: z.array(z.string().trim().min(1).max(60)).max(20).optional().default([]),
  productIds: z.array(z.string().trim().min(1)).max(100).optional().default([]),
}).refine((value) => value.productIds.length > 0, {
  message: "A collection needs at least one product",
});

export function parseFoodCollectionContent(value: string): FoodCollectionContent | null {
  try {
    const result = foodCollectionContentSchema.safeParse(JSON.parse(value) as unknown);
    return result.success ? (result.data as FoodCollectionContent) : null;
  } catch {
    return null;
  }
}

export function stringifyFoodCollectionContent(value: unknown): string {
  return JSON.stringify(foodCollectionContentSchema.parse(value));
}

export const slugifyCollection = slugifyEditorial;
