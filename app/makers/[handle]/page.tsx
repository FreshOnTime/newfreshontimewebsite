import BusinessMedia from '@/components/makers/BusinessMedia';
import {businessMediaSource,readArticleCover} from '@/lib/businessMedia';
import { SavePick } from '@/components/makers/SavedPicks';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MakerItemCard, MakerPhoto } from '@/components/makers/MakerCards';
import { findPublicMaker, publicItemSelect } from '@/lib/makerQueries';
import prisma from '@/lib/prisma';
import { makerContactLinks } from '@/lib/makerContacts';
import ContactLinks from '@/components/makers/ContactLinks';
import {businessTypeLabel,isVenueOnly} from '@/lib/businessTypes';
import { specialtyLabel } from '@/lib/businessSpecialties';
import { pageMetadata, breadcrumbJsonLd, serializeJsonLd } from '@/lib/seo';
import {businessPresentation,businessDescription,businessJsonLd} from '@/lib/businessPresentation';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props) {
  const maker = await findPublicMaker((await params).handle);
  if (!maker) return { title: 'Maker unavailable', robots: { index: false } };
  return pageMetadata({
    title: [maker.name,businessTypeLabel(maker.businessType),maker.makerTown].filter(Boolean).join(' · '), description: businessDescription(maker),
    path: `/makers/${maker.makerHandle}`,image:businessMediaSource(maker.businessCover)||businessMediaSource(maker.businessLogo),
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
      select: { id: true, slug: true, title: true, excerpt: true, category:true, publishedAt:true, featuredImage:true },
    }),
  ]);

  const links = makerContactLinks(maker, maker.name, `/makers/${handle}`);
  const venue=isVenueOnly(maker.businessType);
  const presentation=businessPresentation(maker.businessType);
  const leadItem = items.find(item => item.image);
  return <div className="fp-maker-profile editorial-wrap space-y-10 py-10 md:py-16" data-business-type={maker.businessType}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(businessJsonLd(maker))}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(breadcrumbJsonLd([{name:presentation.directoryLabel,path:presentation.directory},{name:maker.name,path:`/makers/${handle}`}]))}}/>
    {businessMediaSource(maker.businessCover)&&<BusinessMedia src={maker.businessCover} alt="" className="fp-business-cover"/>}
    <header className={`journal-storefront lux-storefront ${leadItem ? "lux-storefront-photo" : ""}`}><div className="lux-storefront-copy">
      <Link href={presentation.directory} className="text-sm font-semibold text-brand-green underline">{presentation.directoryLabel}</Link>
      {businessMediaSource(maker.businessLogo)&&<BusinessMedia src={maker.businessLogo} alt="" className="fp-business-logo"/>}
      <p className="fp-kicker mt-6">{businessTypeLabel(maker.businessType)}</p><h1 className="mt-3 font-serif text-4xl text-brand-green md:text-6xl">{maker.name}</h1>
      <div className="flex flex-wrap items-center gap-3 mt-4"><a href="#connect-business" className="fp26-action">{presentation.action}</a><SavePick href={`/makers/${handle}`} title={maker.name} kind={businessTypeLabel(maker.businessType)} /></div>
        <p className="mt-3 text-sm font-medium">{[maker.makerTown, maker.makerFulfilment].filter(Boolean).join(' · ')}</p>
      {!!maker.businessOfferingLabels?.length&&<p className="mt-4 text-sm">{maker.businessOfferingLabels.join(' · ')}</p>}
       {!!maker.businessSpecialties?.length && <ul aria-label="Business specialities" className="mt-4 flex flex-wrap gap-2">{maker.businessSpecialties.map(s=><li key={s}><Link className="inline-flex min-h-11 items-center rounded-full border border-border px-3 text-sm text-brand-green hover:underline" href={'/discover?specialty='+encodeURIComponent(s)}>{specialtyLabel(s)}</Link></li>)}</ul>}
      {maker.makerBio && <p className="mt-4 max-w-2xl whitespace-pre-wrap break-words leading-7 text-muted-foreground">{maker.makerBio}</p>}
      </div>{leadItem && <Link href={`/makers/${handle}/items/${leadItem.slug}`} className="lux-storefront-feature"><MakerPhoto image={leadItem.image} name={leadItem.name}/><span>Featured offering · {leadItem.name} <span aria-hidden="true">↗</span></span></Link>}
    </header>
    <section id="connect-business" className="fp26-panel"><h2>{presentation.contact}</h2><p className="fp26-meta mb-4">{presentation.hint}</p><ContactLinks links={links}/></section>
    {(items.length>0||stories.length>0)&&<nav className="lux-result-jump" aria-label="Maker page sections">{items.length>0&&<a href="#maker-items">{presentation.navigation}</a>}{stories.length > 0 && <a href="#maker-stories">Articles</a>}</nav>}
    {items.length>0&&<section id="maker-items">
      <div className="fp-section-head"><h2 className="editorial-title">{presentation.section}</h2><span className="fp-kicker">{items.length} {items.length === 1 ? "item" : "items"}</span></div>
      {[...new Set(items.map(item=>item.kind))].map(kind=><div key={kind} className="mt-6"><h3 className="mb-3 text-lg font-semibold text-brand-green">{kind}</h3><div className="journal-item-grid">{items.filter(item=>item.kind===kind).map(item=><MakerItemCard key={item.id} handle={handle} item={item} menuItem={venue&&item.kind!=='Food gifts'}/>)}</div></div>)}
    </section>}
    {stories.length > 0 && <section id="maker-stories">
      <div className="fp-section-head"><h2 className="editorial-title">Articles from the business</h2></div>
      <div className="mt-4 divide-y divide-border border-y border-border">
        {stories.map(story => <Link key={story.id} href={`/makers/${handle}/stories/${story.slug}`} className="block px-2 py-4 hover:bg-brand-cream">
          {readArticleCover(story.featuredImage)&&<BusinessMedia src={readArticleCover(story.featuredImage)?.url} alt={readArticleCover(story.featuredImage)?.alt||""} className="fp-story-thumbnail"/>}<p className="fp-kicker mb-1">{story.category||"Business journal"}{story.publishedAt?` · ${new Intl.DateTimeFormat("en-LK",{dateStyle:"medium",timeZone:"Asia/Colombo"}).format(story.publishedAt)}`:""}</p><h3 className="font-serif text-xl text-brand-green">{story.title}</h3>
          <p className="mt-1 break-words text-sm text-muted-foreground">{story.excerpt}</p>
        </Link>)}
      </div>
    </section>}
  </div>;
}
