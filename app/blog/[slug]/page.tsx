import { pageMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { normalizeBlogImage } from '@/lib/blogImages';
import { BlogPost } from '@/components/blog/BlogPost';
import prisma from '@/lib/prisma';
import { publishedJournalWhere } from '@/lib/journalService';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

// ISR: revalidate every 60 seconds so blog content stays fresh without
// re-rendering on every request. `force-dynamic` was removed because it
// contradicts and overrides the `revalidate` directive.
export const revalidate = 60;

const emptyOptionalMetadata = {
  authorName: null as string | null,
  metaTitle: null as string | null,
  metaDescription: null as string | null,
  metaKeywords: [] as string[],
  tags: [] as string[],
};

async function getOptionalBlogMetadata(id: string) {
  try {
    const metadata = await prisma.blog.findUnique({
      where: { id },
      select: {
        authorName: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        tags: true,
      },
    });

    if (!metadata) return emptyOptionalMetadata;

    return {
      authorName: metadata.authorName ?? null,
      metaTitle: metadata.metaTitle ?? null,
      metaDescription: metadata.metaDescription ?? null,
      metaKeywords: Array.isArray(metadata.metaKeywords) ? metadata.metaKeywords : [],
      tags: Array.isArray(metadata.tags) ? metadata.tags : [],
    };
  } catch (error) {
    // Existing deployments can briefly have the core blog table before newer
    // editorial/SEO columns are reconciled. The article itself should still render.
    console.error('[Blog article] Optional metadata query failed; rendering core article data:', error);
    return emptyOptionalMetadata;
  }
}

// Helper function to get blog data (shared between metadata and page).
// Keep the first query limited to long-standing article fields so an optional
// editorial metadata schema mismatch cannot take the whole route down.
const getBlogData = cache(async (slug: string) => {
  const blog = await prisma.blog.findFirst({
    where: {
      slug,
      ...publishedJournalWhere,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      featuredImage: true,
      category: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!blog) return null;

  const optionalMetadata = await getOptionalBlogMetadata(blog.id);

  return {
    ...blog,
    ...optionalMetadata,
    views: 0,
    featuredImage: normalizeBlogImage(blog.featuredImage),
    _id: blog.id,
  };
});

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;

  const blogData = await getBlogData(slug);

  if (!blogData) {
    return {
      title: 'Blog Post Not Found',
      robots: { index: false, follow: false },
    };
  }

  const baseMetadata = pageMetadata({
    title: blogData.metaTitle || blogData.title,
    description: blogData.metaDescription || blogData.excerpt,
    path: `/blog/${encodeURIComponent(blogData.slug)}`,
    image: blogData.featuredImage?.url,
    type: 'article',
  });
  const authorName = blogData.authorName || 'FreshPick Sri Lanka';
  const tags = Array.from(new Set([...(blogData.tags || []), ...(blogData.metaKeywords || [])]));

  return {
    ...baseMetadata,
    authors: [{ name: authorName }],
    creator: authorName,
    publisher: 'FreshPick Sri Lanka',
    category: blogData.category || 'Grocery guides',
    keywords: tags,
    openGraph: {
      ...baseMetadata.openGraph,
      type: 'article',
      publishedTime: blogData.publishedAt?.toISOString(),
      modifiedTime: blogData.updatedAt?.toISOString(),
      authors: [authorName],
      section: blogData.category || 'Grocery guides',
      tags,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blogData = await getBlogData(slug);
  if (!blogData) notFound();

  // Rendering and ISR must not count as reader views or write to the database.
  const serializedBlog = {
    ...blogData,
    category: blogData.category ?? undefined,
    authorName: blogData.authorName ?? undefined,
    createdAt: blogData.createdAt?.toISOString(),
    updatedAt: blogData.updatedAt?.toISOString(),
    publishedAt: blogData.publishedAt?.toISOString(),
  };

  return <BlogPost blog={serializedBlog} />;
}
