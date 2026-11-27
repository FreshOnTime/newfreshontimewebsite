import {ShareDiscovery} from '@/components/discovery/ShareDiscovery';
import {absoluteUrl} from '@/lib/config/site';
import { SavePick } from '@/components/makers/SavedPicks';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MakerItemCard, MakerPhoto } from '@/components/makers/MakerCards';
import { findPublicMaker, publicItemSelect } from '@/lib/makerQueries';
import prisma from '@/lib/prisma';
import { makerWhatsAppLink } from '@/lib/makers';
import {businessTypeLabel,isVenueOnly,officialHttps} from '@/lib/businessTypes';
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
  const venue=isVenueOnly(maker.businessType);
  const website=officialHttps(maker.businessWebsite),instagram=officialHttps(maker.businessInstagram,"instagram.com");
  const leadItem = items.find(item => item.image);
  return <div className="fp-maker-profile editorial-wrap space-y-8 py-8 md:py-12"><nav aria-label="Breadcrumb" className="journal-breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href={venue?"/eat-drink":"/makers"}>{venue?"Dining":"Food brands & makers"}</Link><span aria-hidden="true">/</span><span aria-current="page">{maker.name}</span></nav>
    <header className={`journal-storefront lux-storefront ${leadItem ? "lux-storefront-photo" : ""}`}><div className="lux-storefront-copy">
      <Link href={venue?"/eat-drink":"/makers"} className="text-sm font-semibold text-brand-green underline">{venue?"Explore dining":"Explore food businesses"}</Link>
      <p className="fp-kicker mt-6">{businessTypeLabel(maker.businessType)}</p><h1 className="mt-3 font-serif text-4xl text-brand-green md:text-6xl">{maker.name}</h1>
      <div className="flex flex-wrap items-center gap-3 mt-4"><a href="#connect-business" className="fp26-action">{venue?"Connect with the restaurant":"Connect with the maker"}</a><SavePick href={`/makers/${handle}`} title={maker.name} kind={businessTypeLabel(maker.businessType)} /><ShareDiscovery title={maker.name} url={absoluteUrl(`/makers/${handle}`)}/></div>
        <p className="mt-3 text-sm font-medium">{[maker.makerTown, maker.makerFulfilment].filter(Boolean).join(' · ')}</p>
      {maker.makerBio && <p className="mt-4 max-w-2xl whitespace-pre-wrap break-words leading-7 text-muted-foreground">{maker.makerBio}</p>}
      </div>{leadItem && <Link href={`/makers/${handle}/items/${leadItem.slug}`} className="lux-storefront-feature"><MakerPhoto image={leadItem.image} name={leadItem.name}/><span>Featured offering · {leadItem.name} <span aria-hidden="true">↗</span></span></Link>}
    </header>
    <section id="connect-business" className="fp26-panel fp-maker-contact"><h2>{venue?"Plan your visit":"Get in touch"}</h2><p className="fp26-meta mb-4">{venue?"Ask the venue about seating, opening hours and reservations. Bookings are arranged directly for now.":"Ask the business about products, availability and fulfilment."}</p><div className="fp26-socials">{enquiry&&<a href={enquiry} target="_blank" rel="noopener noreferrer">WhatsApp</a>}{website&&<a href={website} target="_blank" rel="noopener noreferrer">Official website</a>}{instagram&&<a href={instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}</div>{!enquiry&&!website&&!instagram&&<p className="fp26-meta">This business has not published an official contact channel yet.</p>}</section>
    {(items.length>0||stories.length>0)&&<nav className="lux-result-jump" aria-label="Maker page sections">{items.length>0&&<a href="#maker-items">{venue?"Menu":"Products"}</a>}{stories.length > 0 && <a href="#maker-stories">Articles</a>}</nav>}
    <section id="maker-items" className="fp-maker-offerings">
      <div className="fp-section-head"><h2 className="editorial-title">{venue?"Explore the menu":"Explore their products"}</h2><span className="fp-kicker">{items.length} {items.length === 1 ? "item" : "items"}</span></div>
      {items.length>0?<div className="mt-4 journal-item-grid">
        {items.map(item => <MakerItemCard key={item.id} handle={handle} item={item} menuItem={venue} />)}
      </div>:<p className="fp26-meta mt-4">No published {venue?"menu items":"products"} yet. Contact the business for current offerings.</p>}
    </section>
    {stories.length > 0 && <section id="maker-stories" className="fp-maker-offerings">
      <div className="fp-section-head"><h2 className="editorial-title">Articles from the business</h2></div>
      <div className="mt-4 divide-y divide-border border-y border-border">
        {stories.map(story => <Link key={story.id} href={`/makers/${handle}/stories/${story.slug}`} className="block px-2 py-4 hover:bg-brand-cream">
          <h3 className="font-serif text-xl text-brand-green">{story.title}</h3>
          <p className="mt-1 break-words text-sm text-muted-foreground">{story.excerpt}</p>
        </Link>)}
      </div>
    </section>}
  </div>;
}
