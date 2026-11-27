import { SavePick } from '@/components/makers/SavedPicks';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { BatchDetails, MakerPhoto, MakerItemCard } from '@/components/makers/MakerCards';
import { findPublicMaker, publicItemSelect } from '@/lib/makerQueries';
import { formatMakerPrice, makerImageSrc, makerItemPath, makerWhatsAppLink, openBatches } from '@/lib/makers';
import prisma from '@/lib/prisma';
import {isVenueOnly} from '@/lib/businessTypes';
import { pageMetadata,serializeJsonLd,breadcrumbJsonLd } from '@/lib/seo';
import {offeringJsonLd} from '@/lib/searchDiscovery';

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
  const related = await prisma.makerItem.findMany({ where: {supplierId: maker.id, published: true, slug: {not: slug}}, orderBy: [{createdAt: 'desc'}, {id:'asc'}], take: 3, select: publicItemSelect });
  const venue=isVenueOnly(maker.businessType);
  const enquiry = makerWhatsAppLink(maker.makerWhatsApp, item.name);
  return <div className="fp-item-page editorial-wrap py-10 md:py-16"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(breadcrumbJsonLd([{name:venue?"Eat & drink":"Food products",path:venue?"/eat-drink":"/food-products"},{name:maker.name,path:"/makers/"+handle},{name:item.name,path:makerItemPath(handle,slug)}]))}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(offeringJsonLd({path:makerItemPath(handle,slug),name:item.name,description:item.description,kind:item.kind,venue,makerHandle:handle,image:makerImageSrc(item.image)}))}}/>
    <nav aria-label="Breadcrumb" className="journal-breadcrumb"><Link href={venue?"/eat-drink":"/food-products"}>{venue?"Eat & drink":"Products"}</Link><span aria-hidden="true">/</span><Link href={`/makers/${handle}`}>{maker.name}</Link><span aria-hidden="true">/</span><span aria-current="page">{item.name}</span></nav>
    <div className="journal-item-layout mt-5 grid items-start gap-8 lg:grid-cols-2">
      <div className="journal-item-photo lux-item-visual"><MakerPhoto image={item.image} name={item.name} /></div>
      <div className="space-y-4 journal-item-info">
        <p className="fp-kicker">{item.kind}</p><Link href={`/makers/${handle}`} className="journal-text-cta">{venue?"Served by":"Made by"} {maker.name}</Link>
        <h1 className="break-words font-serif text-4xl text-brand-green md:text-5xl">{item.name}</h1>
        <SavePick href={makerItemPath(handle, slug)} title={item.name} kind={venue?"Menu item":"Product"} />
        <div className="journal-item-order lux-order-panel">
          <p className="journal-price">{item.price != null ? formatMakerPrice(item.price) : 'Contact the business for a price'}</p>
          <p>{venue?'Menu item · confirm current availability':item.madeToOrder ? 'Made to order' : item.batches.length ? 'Open for preorders' : 'No open batches right now'}</p>
          <p className="text-sm">{[maker.makerTown, maker.makerFulfilment].filter(Boolean).join(' · ')}</p>
          {enquiry && <a href={enquiry} target="_blank" rel="noopener noreferrer" className="maker-button">Enquire on WhatsApp</a>}
          <p className="text-xs text-muted-foreground">{venue?"Confirm menu prices, availability and reservations directly with the venue.":"Confirm availability and fulfilment directly with the business."}</p>
        </div>
        <details open className="lux-detail"><summary>About this item</summary><p className="whitespace-pre-wrap break-words leading-7">{item.description}</p></details>
        {!venue&&<details open className="lux-detail">
          <summary>Current batches</summary>
          {item.batches.length === 0 && <p className="mt-2 text-sm text-muted-foreground">There are no open batches right now.</p>}
          <div className="mt-3 grid gap-3">
            {item.batches.map(batch => <div key={batch.id} className="rounded-xl border border-border p-4">
              <BatchDetails batch={batch} itemName={item.name} phone={maker.makerWhatsApp} />
            </div>)}
          </div>
        </details>}
        {!venue&&<p className="text-sm text-muted-foreground">Ask {maker.name} about payment and collection or delivery.</p>}
      </div>
    </div>
    {related.length > 0 && <section className="fp-section"><div className="fp-section-head"><h2>More from {maker.name}</h2><Link href={`/makers/${handle}`} className="fp-inline">{venue?"View venue":"View business"}</Link></div><div className="journal-item-grid">{related.map(entry => <MakerItemCard key={entry.id} handle={handle} item={entry} menuItem={venue}/>)}</div></section>}
  </div>;
}
