import type { Product } from "@/models/product";
import type { RecipeSummary } from "@/models/recipe";

export interface FoodCollectionContent {
  version: 1;
  eyebrow: string;
  story: string;
  occasion: string;
  themeTags: string[];
  recipeSlugs: string[];
  productIds: string[];
}

export interface FoodCollectionSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: { url: string; alt?: string };
  eyebrow: string;
  occasion: string;
  themeTags: string[];
  recipeCount: number;
  productCount: number;
  publishedAt?: string;
}

export interface FoodCollectionDetail extends FoodCollectionSummary {
  story: string;
  recipes: RecipeSummary[];
  products: Product[];
  metaTitle?: string;
  metaDescription?: string;
}
