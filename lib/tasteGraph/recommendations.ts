import "server-only";

import { listPublishedCollections } from "@/lib/collectionService";
import { listPublishedRecipes } from "@/lib/recipeService";
import { getRecentTasteEvents, getTastePreferences } from "@/lib/tasteGraph/eventStore";
import type { FoodCollectionSummary } from "@/models/foodCollection";
import type { RecipeSummary } from "@/models/recipe";

const EVENT_WEIGHTS: Record<string, number> = {
  recipe_viewed: 1,
  collection_viewed: 1,
  search_performed: 2,
  ingredient_added: 2,
  substitution_used: 2,
  whole_meal_added: 5,
  item_reordered: 5,
  basket_subscribed: 6,
  maker_followed: 3,
  maker_favorited: 3,
};

function normalized(value: string) {
  return value.trim().toLowerCase();
}

function addWeight(map: Map<string, number>, value: string | undefined, weight: number) {
  if (!value) return;
  for (const part of value.split(/[|,]/).map(normalized).filter(Boolean)) {
    map.set(part, (map.get(part) || 0) + weight);
  }
}

function textScore(text: string, signals: Map<string, number>) {
  const haystack = normalized(text);
  let score = 0;
  const matches: Array<{ signal: string; weight: number }> = [];
  for (const [signal, weight] of signals) {
    if (signal.length > 1 && haystack.includes(signal)) {
      score += weight;
      matches.push({ signal, weight });
    }
  }
  matches.sort((a, b) => b.weight - a.weight);
  return { score, reason: matches[0]?.signal };
}

export type RankedRecommendation<T> = {
  item: T;
  score: number;
  reason?: string;
};

export async function getTasteRecommendations(userId?: string | null, limit = 6) {
  const [recipes, collections] = await Promise.all([
    listPublishedRecipes(60),
    listPublishedCollections(60),
  ]);

  if (!userId) {
    return {
      personalized: false,
      recipes: recipes.slice(0, limit).map((item) => ({ item, score: 0 })),
      collections: collections.slice(0, limit).map((item) => ({ item, score: 0 })),
    };
  }

  const [preferences, events] = await Promise.all([
    getTastePreferences(userId),
    getRecentTasteEvents(userId, 90, 500),
  ]);

  if (!preferences.personalizationEnabled) {
    return {
      personalized: false,
      recipes: recipes.slice(0, limit).map((item) => ({ item, score: 0 })),
      collections: collections.slice(0, limit).map((item) => ({ item, score: 0 })),
    };
  }

  const signals = new Map<string, number>();
  preferences.cuisines.forEach((value) => addWeight(signals, value, 8));
  preferences.dietaryChoices.forEach((value) => addWeight(signals, value, 7));

  for (const event of events) {
    const base = EVENT_WEIGHTS[event.eventType] || 1;
    addWeight(signals, event.query, base * 2);
    addWeight(signals, typeof event.metadata.cuisine === "string" ? event.metadata.cuisine : undefined, base * 3);
    addWeight(signals, typeof event.metadata.dietary === "string" ? event.metadata.dietary : undefined, base * 2);
    addWeight(signals, typeof event.metadata.theme === "string" ? event.metadata.theme : undefined, base * 2);
    addWeight(signals, typeof event.metadata.tags === "string" ? event.metadata.tags : undefined, base);
  }

  const disliked = preferences.dislikedIngredients.map(normalized).filter(Boolean);

  const rankedRecipes: RankedRecommendation<RecipeSummary>[] = recipes.map((item) => {
    const text = [item.title, item.excerpt, item.cuisine, ...item.tags, ...item.dietaryTags].join(" ");
    const match = textScore(text, signals);
    const dislikePenalty = disliked.some((term) => normalized(text).includes(term)) ? 100 : 0;
    return { item, score: match.score - dislikePenalty, reason: match.reason };
  }).sort((a, b) => b.score - a.score);

  const rankedCollections: RankedRecommendation<FoodCollectionSummary>[] = collections.map((item) => {
    const text = [item.title, item.excerpt, item.occasion, ...item.themeTags].join(" ");
    const match = textScore(text, signals);
    return { item, score: match.score, reason: match.reason };
  }).sort((a, b) => b.score - a.score);

  return {
    personalized: signals.size > 0,
    recipes: rankedRecipes.slice(0, limit),
    collections: rankedCollections.slice(0, limit),
  };
}
