import { notFound } from 'next/navigation';
import { BlogPost } from '@/components/blog/BlogPost';
import { editorialGuides, findEditorialGuide, guidePath } from '@/lib/editorialGuides';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return editorialGuides.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props) {
  const guide = findEditorialGuide((await params).slug);
  if (!guide) notFound();
  return pageMetadata({ title: guide.title, description: guide.excerpt, path: guidePath(guide.slug), image: guide.featuredImage.url, type: 'article' });
}
export default async function GuidePage({ params }: Props) {
  const guide = findEditorialGuide((await params).slug);
  if (!guide) notFound();
  return <BlogPost blog={guide} path={guidePath(guide.slug)} />;
}
