import { notFound, permanentRedirect } from 'next/navigation';
import { BlogPost } from '@/components/blog/BlogPost';
import { editorialGuides, findEditorialGuide, guidePath } from '@/lib/editorialGuides';
import { pageMetadata } from '@/lib/seo';
import prisma from '@/lib/prisma';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return editorialGuides.map(({ slug }) => ({ slug }));
}

async function managedGuide(slug: string) {
  return prisma.blog.findUnique({
    where: { slug },
    select: { slug: true, published: true, isDeleted: true },
  });
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
