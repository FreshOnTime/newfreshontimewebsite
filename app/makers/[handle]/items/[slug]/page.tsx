import { SavePick } from '@/components/makers/SavedPicks';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { BatchDetails, MakerPhoto } from '@/components/makers/MakerCards';
import { findPublicMaker, publicItemSelect } from '@/lib/makerQueries';
import { formatMakerPrice, makerImageSrc, makerItemPath, makerWhatsAppLink, openBatches } from '@/lib/makers';
import prisma from '@/lib/prisma';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ handle: string; slug: string }> };
const findItem = cache(async (handle: string, slug: string) => {
  const maker = await findPublicMaker(handle);
  if (!maker) return null;
  const item = await prisma.makerItem.findFirst({
    where: { supplierId: maker.id, slug, published: true },
    select: {
      ...publicItemSelect,
      batches: { where: openBatches(), orderBy: { readyAt: 'asc' } },
    },
  });
  return item ? { maker, item } : null;
});

export async function generateMetadata({ params }: Props) {
  const { handle, slug } = await params;
  const result = await findItem(handle, slug);
  if (!result) return { title: 'Item unavailable', robots: { index: false } };
  return pageMetadata({
    title: `${result.item.name} by ${result.maker.name}`,
    description: result.item.description.slice(0, 160), path: makerItemPath(handle, slug),
    image: makerImageSrc(result.item.image),
  });
}

export default async function MakerItemPage({ params }: Props) {
  const { handle, slug } = await params;
  const result = await findItem(handle, slug);
  if (!result) notFound();
  const { item, maker } = result;
  const enquiry = makerWhatsAppLink(maker.makerWhatsApp, item.name);
  return <main className="editorial-wrap py-10 md:py-16">
    <Link href={`/makers/${handle}`} className="text-sm font-semibold text-brand-green underline">More from {maker.name}</Link>
    <div className="mt-6 grid items-start gap-8 lg:grid-cols-2">
      <MakerPhoto image={item.image} name={item.name} />
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{item.kind} · {maker.makerTown} · {maker.makerFulfilment}</p>
        <h1 className="break-words font-serif text-4xl text-brand-green md:text-5xl">{item.name}</h1>
        <SavePick href={makerItemPath(handle, slug)} title={item.name} kind="Item" />
        <p className="whitespace-pre-wrap break-words leading-7">{item.description}</p>
        {item.madeToOrder && <div className="space-y-2 rounded-xl border border-border p-4">
          <p className="font-semibold text-brand-green">Made to order{item.price && ` · ${formatMakerPrice(item.price)}`}</p>
          {enquiry && <a href={enquiry} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg bg-brand-green px-4 text-sm font-semibold text-white">Ask on WhatsApp</a>}
        </div>}
        <section>
          <h2 className="font-serif text-2xl text-brand-green">Current batches</h2>
          {item.batches.length === 0 && <p className="mt-2 text-sm text-muted-foreground">There are no open batches right now.</p>}
          <div className="mt-3 grid gap-3">
            {item.batches.map(batch => <div key={batch.id} className="rounded-xl border border-border p-4">
              <BatchDetails batch={batch} itemName={item.name} phone={maker.makerWhatsApp} />
            </div>)}
          </div>
        </section>
        <p className="text-sm text-muted-foreground">Ask {maker.name} about payment and collection or delivery.</p>
      </div>
    </div>
  </main>;
}
