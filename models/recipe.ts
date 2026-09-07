import type { Product } from "@/models/product";

export interface RecipeIngredientInput {
  productId: string;
  quantity: number;
  note?: string;
  optional?: boolean;
  substitutionProductIds?: string[];
}

export interface RecipeContent {
  version: 1;
  story: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  cuisine: string;
  dietaryTags: string[];
  ingredients: RecipeIngredientInput[];
  steps: string[];
}

export interface RecipeIngredient {
  productId: string;
  quantity: number;
  note?: string;
  optional: boolean;
  product: Product | null;
  substitutions: Product[];
}

export interface RecipeSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: { url: string; alt?: string };
  tags: string[];
  authorId: string;
  authorName?: string;
  publishedAt?: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  cuisine: string;
  dietaryTags: string[];
  ingredientCount: number;
}

export interface RecipeDetail extends RecipeSummary {
  story: string;
  steps: string[];
  ingredients: RecipeIngredient[];
  metaTitle?: string;
  metaDescription?: string;
}
