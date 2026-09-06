import { z } from "zod";
import { foodCollectionContentSchema, parseFoodCollectionContent } from "@/lib/collectionContent";
import { normalizeFeaturedImage } from "@/lib/recipeContent";

export const collectionAdminInputSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().max(200).optional(),
  excerpt: z.string().trim().min(10).max(600),
  featuredImage: z.object({ url: z.string().trim().min(1).max(1000), alt: z.string().trim().max(300).optional() }).optional(),
  tags: z.array(z.string().trim().min(1).max(60)).max(30).optional().default([]),
  published: z.boolean().optional().default(false),
  metaTitle: z.string().trim().max(180).optional(),
  metaDescription: z.string().trim().max(320).optional(),
  metaKeywords: z.array(z.string().trim().min(1).max(80)).max(30).optional().default([]),
  content: foodCollectionContentSchema,
});

export const collectionAdminPatchSchema = collectionAdminInputSchema.partial();

export function serializeCollectionForAdmin(row: {
  id: string; title: string; slug: string; excerpt: string; content: string; featuredImage: unknown;
  tags: string[]; published: boolean; publishedAt: Date | null; authorName: string | null;
  metaTitle: string | null; metaDescription: string | null; metaKeywords: string[]; createdAt: Date; updatedAt: Date;
}) {
  return {
    id: row.id,
    _id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    featuredImage: normalizeFeaturedImage(row.featuredImage),
    tags: row.tags,
    published: row.published,
    publishedAt: row.publishedAt?.toISOString() || null,
    authorName: row.authorName || undefined,
    metaTitle: row.metaTitle || "",
    metaDescription: row.metaDescription || "",
    metaKeywords: row.metaKeywords,
    content: parseFoodCollectionContent(row.content),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
