import { ShareDiscovery } from '@/components/discovery/ShareDiscovery';
import { absoluteUrl } from '@/lib/config/site';
import { SavePick } from '@/components/makers/SavedPicks';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BatchDetails, MakerItemCard } from '@/components/makers/MakerCards';
import { findPublicMaker, publicItemSelect } from '@/lib/makerQueries';
import { makerWhatsAppLink, openBatches } from '@/lib/makers';
import prisma from '@/lib/prisma';
import {businessArticleTopics} from '@/lib/businessSpecialties';
import { pageMetadata, serializeJsonLd, breadcrumbJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ handle: string; slug: string }> };
const findStory = cache(async (handle: string, slug: string) => {
  const maker = await findPublicMaker(handle);
  if (!maker) return null;
  const story = await prisma.blog.findFirst({
    where: { supplierId: maker.id, slug, published: true, isDeleted: false },
    select: {
      title: true, excerpt: true, content: true, category:true,publishedAt:true,updatedAt:true,
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
  return <div className="fp-maker-story editorial-wrap py-10 md:py-16">
    <article className="journal-maker-article">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd({"@context":"https://schema.org","@type":"Article",headline:story.title,description:story.excerpt,url:absoluteUrl(`/makers/${handle}/stories/${slug}`),mainEntityOfPage:absoluteUrl(`/makers/${handle}/stories/${slug}`),inLanguage:"en-LK",author:{"@type":"Organization",name:maker.name,url:absoluteUrl(`/makers/${handle}`)},publisher:{"@type":"Organization",name:"FreshPick",url:absoluteUrl("/")},...(story.publishedAt?{datePublished:story.publishedAt.toISOString()}:{}),dateModified:story.updatedAt.toISOString(),...(story.category?{articleSection:story.category}:{})})}}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(breadcrumbJsonLd([{name:"Journal",path:"/stories"},{name:maker.name,path:`/makers/${handle}`},{name:story.title,path:`/makers/${handle}/stories/${slug}`}]))}}/>
      <header className="journal-story-header">
      <p className="fp-kicker">From the makers · {Math.max(1,Math.ceil(story.content.trim().split(/\s+/).length/220))} min read</p><div className="mt-3"><Link href={`/makers/${handle}`} className="journal-text-cta">{maker.name} · {maker.makerTown}</Link></div>
      {story.category&&businessArticleTopics.some(t=>t===story.category)&&<Link className="journal-text-cta mt-2 inline-block" href={'/stories?topic='+encodeURIComponent('business:'+story.category)}>{story.category}</Link>}
      {story.publishedAt&&<p className="mt-2 text-sm text-muted-foreground"><time dateTime={story.publishedAt.toISOString()}>{new Intl.DateTimeFormat("en-LK",{dateStyle:"long",timeZone:"Asia/Colombo"}).format(story.publishedAt)}</time></p>}
      <h1 className="mt-4 break-words font-serif text-4xl text-brand-green md:text-6xl">{story.title}</h1>
      <div className="flex flex-wrap items-center gap-3"><SavePick href={`/makers/${handle}/stories/${slug}`} title={story.title} kind="Story" /><ShareDiscovery title={story.title} url={absoluteUrl(`/makers/${handle}/stories/${slug}`)}/></div>
        <p className="mt-4 break-words text-lg leading-8 text-muted-foreground">{story.excerpt}</p>
      </header>
      <div className={story.makerItems.length ? "journal-story-columns" : "journal-story-columns journal-story-solo"}>
      <div className="prose max-w-none break-words">
        <ReactMarkdown skipHtml disallowedElements={['img']} remarkPlugins={[remarkGfm]}
          components={{ a: ({ href, children }) => <a href={href} rel="ugc nofollow">{children}</a> }}>{story.content}</ReactMarkdown>
      </div>
      {story.makerItems.length > 0 && <aside className="journal-story-aside">
        <h2 className="editorial-title">Items in this story</h2>
        <div className="mt-4 grid gap-5">
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
      </aside>}
      </div>
    </article>
  </div>;
}
