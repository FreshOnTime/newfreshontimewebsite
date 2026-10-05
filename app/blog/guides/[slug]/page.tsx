import { notFound, permanentRedirect } from 'next/navigation';
import { BlogPost } from '@/components/blog/BlogPost';
import { editorialGuides, findEditorialGuide, guidePath } from '@/lib/editorialGuides';
import { pageMetadata } from '@/lib/seo';
import prisma from '@/lib/prisma';

type Props = { params: Promise<{ slug: string }> };

// This route must not contact PostgreSQL while Vercel/Netlify are building a preview.
// Whether a legacy guide has moved into the CMS is runtime state.
export const dynamic = 'force-dynamic';

async function managedGuide(slug: string) {
  try {
    return await prisma.blog.findUnique({
      where: { slug },
      select: { slug: true, published: true, isDeleted: true },
    });
  } catch (error) {
    console.error('[Blog guide] Failed to check CMS ownership:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const slug = (await params).slug;
  const managed = await managedGuide(slug);
  if (managed) {
    if (!managed.published || managed.isDeleted) notFound();
    const guide = findEditorialGuide(slug);
    if (!guide) notFound();
    return pageMetadata({
      title: guide.title,
      description: guide.excerpt,
      path: `/blog/${encodeURIComponent(slug)}`,
      image: guide.featuredImage.url,
      type: 'article',
    });
  }

  const guide = findEditorialGuide(slug);
  if (!guide) notFound();
  return pageMetadata({
    title: guide.title,
    description: guide.excerpt,
    path: guidePath(guide.slug),
    image: guide.featuredImage.url,
    type: 'article',
  });
}

export default async function GuidePage({ params }: Props) {
  const slug = (await params).slug;
  const managed = await managedGuide(slug);

  if (managed) {
    if (!managed.published || managed.isDeleted) notFound();
    permanentRedirect(`/blog/${encodeURIComponent(slug)}`);
  }

  const guide = findEditorialGuide(slug);
  if (!guide) notFound();
  return <BlogPost blog={guide} path={guidePath(guide.slug)} />;
}
