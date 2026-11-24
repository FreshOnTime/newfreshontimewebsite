import { SavePick } from '@/components/makers/SavedPicks';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MakerItemCard } from '@/components/makers/MakerCards';
import { findPublicMaker, publicItemSelect } from '@/lib/makerQueries';
import prisma from '@/lib/prisma';
import { makerWhatsAppLink } from '@/lib/makers';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props) {
  const maker = await findPublicMaker((await params).handle);
  if (!maker) return { title: 'Maker unavailable', robots: { index: false } };
  return pageMetadata({
    title: maker.name, description: maker.makerBio || `Explore items and stories from ${maker.name}.`,
    path: `/makers/${maker.makerHandle}`,
  });
}

export default async function MakerPage({ params }: Props) {
  const { handle } = await params;
  const maker = await findPublicMaker(handle);
  if (!maker) notFound();

  const [items, stories] = await Promise.all([
    prisma.makerItem.findMany({
      where: { supplierId: maker.id, published: true }, orderBy: { createdAt: 'desc' }, select: publicItemSelect,
    }),
    prisma.blog.findMany({
      where: { supplierId: maker.id, published: true, isDeleted: false }, orderBy: { publishedAt: 'desc' },
      select: { id: true, slug: true, title: true, excerpt: true },
    }),
  ]);

  const enquiry = makerWhatsAppLink(maker.makerWhatsApp, maker.name);
  return <div className="fp-maker-profile editorial-wrap space-y-10 py-10 md:py-16">
    <header className="journal-storefront">
      <Link href="/makers" className="text-sm font-semibold text-brand-green underline">Explore makers</Link>
      <h1 className="mt-3 font-serif text-4xl text-brand-green md:text-6xl">{maker.name}</h1>
      <div className="flex flex-wrap items-center gap-3 mt-4">{enquiry && <a className="maker-button" href={enquiry} target="_blank" rel="noopener noreferrer">Contact on WhatsApp</a>}<SavePick href={`/makers/${handle}`} title={maker.name} kind="Maker" /></div>
        <p className="mt-3 text-sm font-medium">{[maker.makerTown, maker.makerFulfilment].filter(Boolean).join(' · ')}</p>
      {maker.makerBio && <p className="mt-4 max-w-2xl whitespace-pre-wrap break-words leading-7 text-muted-foreground">{maker.makerBio}</p>}
    </header>
    <section>
      <div className="fp-section-head"><h2 className="editorial-title">From this kitchen</h2><span className="fp-kicker">{items.length} {items.length === 1 ? "item" : "items"}</span></div>
      {items.length === 0 && <p className="mt-3 text-muted-foreground">This maker hasn’t published any items yet.</p>}
      <div className="mt-4 journal-item-grid">
        {items.map(item => <MakerItemCard key={item.id} handle={handle} item={item} />)}
      </div>
    </section>
    {stories.length > 0 && <section>
      <div className="fp-section-head"><h2 className="editorial-title">The maker’s journal</h2></div>
      <div className="mt-4 divide-y divide-border border-y border-border">
        {stories.map(story => <Link key={story.id} href={`/makers/${handle}/stories/${story.slug}`} className="block px-2 py-4 hover:bg-brand-cream">
          <h3 className="font-serif text-xl text-brand-green">{story.title}</h3>
          <p className="mt-1 break-words text-sm text-muted-foreground">{story.excerpt}</p>
        </Link>)}
      </div>
    </section>}
  </div>;
}
