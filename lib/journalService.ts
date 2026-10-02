import { unstable_cache, revalidatePath, revalidateTag } from 'next/cache';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import type { JournalSummary, JournalPage } from '@/models/journal';

export const COMMERCE_BLOG_CATEGORIES = ['recipe', 'collection'];
export const journalCategoryWhere: Prisma.BlogWhereInput = {
  AND: [{ OR: [{ category: null }, { category: { notIn: COMMERCE_BLOG_CATEGORIES } }] }],
};
export const publishedJournalWhere: Prisma.BlogWhereInput = {
  ...journalCategoryWhere, isDeleted: false, published: true,
};

export const listPublishedJournalEntries = unstable_cache(async (): Promise<JournalSummary[]> => {
  const posts = await prisma.blog.findMany({
    where: publishedJournalWhere,
    select: { id: true, title: true, slug: true, excerpt: true, featuredImage: true, category: true, publishedAt: true },
    orderBy: [{ publishedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }, { id: 'desc' }],
    take: 3,
  });
  return posts.map(post => {
    const image = post.featuredImage;
    const featuredImage = image && typeof image === 'object' && !Array.isArray(image) && typeof image.url === 'string'
      ? { url: image.url, alt: typeof image.alt === 'string' ? image.alt : undefined }
      : null;
    return { ...post, featuredImage, publishedAt: post.publishedAt?.toISOString() ?? null };
  });
}, ['homepage-journal-v1'], { revalidate: 60, tags: ['journal'] });

export const firstJournalPage = unstable_cache(async (): Promise<JournalPage> => {
  const [posts, total] = await Promise.all([
    prisma.blog.findMany({ where: publishedJournalWhere, select: { id: true, title: true, slug: true, excerpt: true, featuredImage: true, category: true, publishedAt: true }, orderBy: [{ publishedAt: { sort: 'desc', nulls: 'last' } }, { id: 'desc' }], take: 12 }),
    prisma.blog.count({ where: publishedJournalWhere }),
  ]);
  return { blogs: posts.map(({ id, featuredImage, publishedAt, ...post }) => ({ ...post, _id: id, publishedAt: publishedAt?.toISOString() ?? null, featuredImage: featuredImage && typeof featuredImage === 'object' && !Array.isArray(featuredImage) && typeof featuredImage.url === 'string' ? { url: featuredImage.url, alt: typeof featuredImage.alt === 'string' ? featuredImage.alt : undefined } : null })), pagination: { page: 1, limit: 12, total, pages: Math.ceil(total / 12) } };
}, ['journal-first-page-v1'], { revalidate: 60, tags: ['journal'] });

/** Refresh summaries and article pages after an authorised editorial change. */
export function revalidateJournal(...slugs: string[]) {
  revalidateTag('journal', { expire: 0 });
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');
  for (const slug of new Set(slugs)) revalidatePath(`/blog/${slug}`);
}
