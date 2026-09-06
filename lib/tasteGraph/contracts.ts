import { z } from "zod";

export const TASTE_EVENT_SCHEMA_VERSION = 1 as const;

export const tasteEventTypes = [
  "discovery_theme_viewed",
  "recipe_viewed",
  "collection_viewed",
  "search_performed",
  "ingredient_added",
  "whole_meal_added",
  "substitution_used",
  "substitution_rejected",
  "item_reordered",
  "basket_subscribed",
  "maker_followed",
  "maker_favorited",
] as const;

export type TasteEventType = (typeof tasteEventTypes)[number];

export const tasteEventSchema = z.object({
  eventType: z.enum(tasteEventTypes),
  entityType: z.enum(["recipe", "collection", "product", "maker", "search", "subscription", "discovery_theme"]).optional(),
  entityId: z.string().trim().max(240).optional(),
  surface: z.string().trim().max(120).optional(),
  query: z.string().trim().max(240).optional(),
  metadata: z.record(z.union([z.string().max(240), z.number(), z.boolean(), z.null()])).optional().default({}),
});

export type TasteEventInput = z.infer<typeof tasteEventSchema>;

export const tastePreferenceSchema = z.object({
  cuisines: z.array(z.string().trim().min(1).max(60)).max(20).optional().default([]),
  dietaryChoices: z.array(z.string().trim().min(1).max(60)).max(20).optional().default([]),
  dislikedIngredients: z.array(z.string().trim().min(1).max(100)).max(50).optional().default([]),
  householdSize: z.number().int().min(1).max(30).nullable().optional().default(null),
  budgetBand: z.enum(["value", "balanced", "premium", "open"]).nullable().optional().default(null),
  personalizationEnabled: z.boolean().optional().default(true),
});

export const tastePreferencePatchSchema = tastePreferenceSchema.partial();

export type TastePreferenceSnapshot = z.infer<typeof tastePreferenceSchema>;

export type TasteEventEnvelope = TasteEventInput & {
  schemaVersion: typeof TASTE_EVENT_SCHEMA_VERSION;
  sessionId: string;
};
