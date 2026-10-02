import type { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { absoluteUrl } from '@/lib/config/site';
import { PUBLIC_PAGES } from '@/lib/publicPages';
import { publishedJournalWhere } from '@/lib/journalService';
import { parseRecipeContent } from '@/lib/recipeContent';
import { parseFoodCollectionContent } from '@/lib/collectionContent';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = PUBLIC_PAGES.map(page => ({ url: absoluteUrl(page.path), changeFrequency: 'weekly' as const, priority: page.path === '/' ? 1 : 0.6 }));
  const results = await Promise.allSettled([
    prisma.product.findMany({ where: { archived: false }, select: { sku: true, updatedAt: true } }),
    prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.blog.findMany({ where: publishedJournalWhere, select: { slug: true, updatedAt: true } }),
    prisma.blog.findMany({ where: { category: 'recipe', published: true, isDeleted: false }, select: { slug: true, content: true, authorId: true, updatedAt: true } }),
    prisma.blog.findMany({ where: { category: 'collection', published: true, isDeleted: false }, select: { slug: true, content: true, updatedAt: true } }),
  ]);
  const pages: MetadataRoute.Sitemap = [...staticPages];
  const sections = ['products', 'categories', 'blog', 'recipes', 'collections'];
  const creatorDates = new Map<string, Date>();
  results.forEach((result, index) => {
    if (result.status === 'rejected') { console.error(`Sitemap ${sections[index]} query failed`); return; }
    for (const row of result.value) {
      const id = 'sku' in row ? row.sku : row.slug;
      if (!id || ('content' in row && !(index === 3 ? parseRecipeContent(row.content) : parseFoodCollectionContent(row.content)))) continue;
      pages.push({ url: absoluteUrl(`/${sections[index]}/${encodeURIComponent(id)}`), ...(row.updatedAt ? { lastModified: row.updatedAt } : {}), changeFrequency: 'weekly', priority: 0.7 });
      if ('authorId' in row && row.authorId && row.updatedAt && (!creatorDates.has(row.authorId) || creatorDates.get(row.authorId)! < row.updatedAt)) creatorDates.set(row.authorId, row.updatedAt);
    }
  });
  for (const [id, lastModified] of creatorDates) pages.push({ url: absoluteUrl(`/creators/${encodeURIComponent(id)}`), lastModified, changeFrequency: 'weekly', priority: 0.5 });
  return [...new Map(pages.map(page => [page.url, page])).values()];
}
