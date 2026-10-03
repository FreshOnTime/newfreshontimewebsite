import type { Product } from "@/models/product";

export interface FoodCollectionContent {
  version: 1;
  eyebrow: string;
  story: string;
  occasion: string;
  themeTags: string[];
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
  productCount: number;
  publishedAt?: string;
}

export interface FoodCollectionDetail extends FoodCollectionSummary {
  story: string;
  products: Product[];
  metaTitle?: string;
  metaDescription?: string;
}
