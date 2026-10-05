import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { editorialGuides } from '@/lib/editorialGuides';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';
import { revalidateJournal } from '@/lib/journalService';

export const POST = requireAdminSimple(async request => {
  try {
    const slugs = editorialGuides.map(guide => guide.slug);
    const existing = await prisma.blog.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true },
    });
    const existingSlugs = new Set(existing.map(row => row.slug));
    const missing = editorialGuides.filter(guide => !existingSlugs.has(guide.slug));

    if (missing.length === 0) {
      return NextResponse.json({ imported: 0 });
    }

    await prisma.$transaction(
      missing.map(guide =>
        prisma.blog.create({
          data: {
            title: guide.title,
            slug: guide.slug,
            excerpt: guide.excerpt,
            content: guide.content,
            featuredImage: guide.featuredImage as Prisma.InputJsonValue,
            category: guide.category,
            tags: guide.tags,
            published: true,
            publishedAt: new Date(guide.publishedAt),
            metaTitle: guide.title,
            metaDescription: guide.excerpt,
            metaKeywords: guide.tags,
            authorId: request.user!.userId,
            authorName: guide.authorName || 'FreshPick',
          },
        })
      )
    );

    revalidateJournal(...missing.map(guide => guide.slug));
    return NextResponse.json({ imported: missing.length });
  } catch (error) {
    console.error('Import editorial guides error:', error);
    return NextResponse.json({ error: 'Failed to import existing blog guides into the CMS' }, { status: 500 });
  }
});
