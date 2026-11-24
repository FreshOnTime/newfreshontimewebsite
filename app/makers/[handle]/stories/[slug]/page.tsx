import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BatchDetails, MakerItemCard } from '@/components/makers/MakerCards';
import { findPublicMaker, publicItemSelect } from '@/lib/makerQueries';
import { makerWhatsAppLink, openBatches } from '@/lib/makers';
import prisma from '@/lib/prisma';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ handle: string; slug: string }> };
const findStory = cache(async (handle: string, slug: string) => {
  const maker = await findPublicMaker(handle);
  if (!maker) return null;
  const story = await prisma.blog.findFirst({
    where: { supplierId: maker.id, slug, published: true, isDeleted: false },
    select: {
      title: true, excerpt: true, content: true,
      makerItems: {
        where: { item: { supplierId: maker.id, published: true } },
        select: { item: { select: {
          ...publicItemSelect,
          batches: { where: openBatches(), orderBy: { readyAt: 'asc' }, take: 1 },
        } } },
      },
    },
  });
  return story ? { maker, story } : null;
});

export async function generateMetadata({ params }: Props) {
  const { handle, slug } = await params;
  const result = await findStory(handle, slug);
  if (!result) return { title: 'Story unavailable', robots: { index: false } };
  return pageMetadata({
    title: result.story.title, description: result.story.excerpt, path: `/makers/${handle}/stories/${slug}`, type: 'article',
  });
}

export default async function MakerStoryPage({ params }: Props) {
  const { handle, slug } = await params;
  const result = await findStory(handle, slug);
  if (!result) notFound();
  const { maker, story } = result;
  return <main className="editorial-wrap py-10 md:py-16">
    <article className="mx-auto max-w-3xl">
      <Link href={`/makers/${handle}`} className="text-sm font-semibold text-brand-green underline">{maker.name} · {maker.makerTown}</Link>
      <h1 className="mt-4 break-words font-serif text-4xl text-brand-green md:text-6xl">{story.title}</h1>
      <p className="mt-4 break-words text-lg leading-8 text-muted-foreground">{story.excerpt}</p>
      <div className="prose mt-8 max-w-none break-words">
        <ReactMarkdown skipHtml disallowedElements={['img']} remarkPlugins={[remarkGfm]}
          components={{ a: ({ href, children }) => <a href={href} rel="ugc nofollow">{children}</a> }}>{story.content}</ReactMarkdown>
      </div>
      {story.makerItems.length > 0 && <section className="mt-10 border-t border-border pt-6">
        <h2 className="editorial-title">Items in this story</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {story.makerItems.map(({ item }) => {
            const batch = item.batches[0];
            const enquiry = item.madeToOrder && makerWhatsAppLink(maker.makerWhatsApp, item.name);
            return <div key={item.id} className="space-y-3">
              <MakerItemCard handle={handle} item={item} />
              {batch ? <div className="px-3"><BatchDetails batch={batch} itemName={item.name} phone={maker.makerWhatsApp} /></div>
                : enquiry && <a href={enquiry} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-brand-green underline">Ask on WhatsApp</a>}
            </div>;
          })}
        </div>
      </section>}
    </article>
  </main>;
}
