import { editorialGuides, guidePath } from '@/lib/editorialGuides';
import type { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { absoluteUrl } from '@/lib/config/site';
import { PUBLIC_PAGES } from '@/lib/publicPages';
import { publishedJournalWhere } from '@/lib/journalService';
import { parseFoodCollectionContent } from '@/lib/collectionContent';

export const revalidate = 300;

function sitemapImage(value: unknown): string | undefined {
  let src: string | undefined;
  if (typeof value === 'string') src = value.trim();
  else if (value && typeof value === 'object' && !Array.isArray(value)) {
    const candidate = (value as Record<string, unknown>).url;
    if (typeof candidate === 'string') src = candidate.trim();
  }
  if (!src) return undefined;
  if (src.startsWith('/') && !src.startsWith('//') && !src.includes('\\')) return absoluteUrl(src);
  try {
    const url = new URL(src);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = PUBLIC_PAGES.map(page => ({
    url: absoluteUrl(page.path),
    changeFrequency: 'weekly' as const,
    priority: page.path === '/' ? 1 : 0.6,
  }));

  const guideSlugs = editorialGuides.map(guide => guide.slug);
  const [results, managedGuides] = await Promise.all([
    Promise.allSettled([
      prisma.product.findMany({ where: { archived: false }, select: { sku: true, image: true, updatedAt: true } }),
      prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      prisma.blog.findMany({ where: publishedJournalWhere, select: { slug: true, featuredImage: true, updatedAt: true } }),
      prisma.blog.findMany({ where: { category: 'collection', published: true, isDeleted: false }, select: { slug: true, content: true, updatedAt: true } }),
    ]),
    Promise.resolve(prisma.blog.findMany({
      where: { slug: { in: guideSlugs } },
      select: { slug: true },
    })).catch(() => []),
  ]);

  const managedGuideSlugs = new Set(managedGuides.map(guide => guide.slug));
  const pages: MetadataRoute.Sitemap = [
    ...staticPages,
    ...editorialGuides
      .filter(guide => !managedGuideSlugs.has(guide.slug))
      .map(guide => ({
        url: absoluteUrl(guidePath(guide.slug)),
        lastModified: guide.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
  ];

  const sections = ['products', 'categories', 'blog', 'collections'];
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Sitemap ${sections[index]} query failed`);
      return;
    }

    for (const row of result.value) {
      const id = 'sku' in row ? row.sku : row.slug;
      if (!id || ('content' in row && !parseFoodCollectionContent(row.content))) continue;
      const image = 'image' in row
        ? sitemapImage(row.image)
        : 'featuredImage' in row
          ? sitemapImage(row.featuredImage)
          : undefined;
      pages.push({
        url: absoluteUrl(`/${sections[index]}/${encodeURIComponent(id)}`),
        ...(row.updatedAt ? { lastModified: row.updatedAt } : {}),
        ...(image ? { images: [image] } : {}),
        changeFrequency: 'weekly',
        priority: 'sku' in row ? 0.8 : 0.7,
      });
    }
  });

  return [...new Map(pages.map(page => [page.url, page])).values()];
}
