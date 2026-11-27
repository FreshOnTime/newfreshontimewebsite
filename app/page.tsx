import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Search, MapPin, ArrowRight } from 'lucide-react';
import { DiscoveryRail, DiscoveryChapters } from '@/components/discovery/Editorial';
import { MakerItemCard, BatchDetails } from '@/components/makers/MakerCards';
import { ReadingShelf } from '@/components/makers/Edition';
import { publicItemSelect } from '@/lib/makerQueries';
import { publicMakerWhere, openBatches, makerItemPath } from '@/lib/makers';
import prisma from '@/lib/prisma';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const metadata = pageMetadata({ path: '/', title: 'FreshPick | Discover Sri Lankan food, makers and dining', description: 'Discover independent makers, restaurants, cafés, food products and original stories across Sri Lanka.' });

export default async function Home() {
  const [items, makers, batches] = await Promise.all([
    prisma.makerItem.findMany({
    where: { published: true, supplier: publicMakerWhere }, take: 4,
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    select: { ...publicItemSelect, supplier: { select: { makerHandle: true, name: true, makerTown: true } } },
    }),
    prisma.supplier.findMany({ where: publicMakerWhere, orderBy: [{name: 'asc'}, {id: 'asc'}], take: 4,
      select: { id: true, name: true, makerHandle: true, makerTown: true, makerBio: true } }),
    prisma.makerBatch.findMany({where:{...openBatches(),item:{published:true,supplier:publicMakerWhere}},orderBy:[{cutoff:'asc'},{id:'asc'}],take:3,include:{item:{select:{name:true,slug:true,supplier:{select:{name:true,makerHandle:true,makerTown:true,makerWhatsApp:true}}}}}}),
  ]);
  return <div className="lux-home fp-modern-home">
    <section className="fp26-hero" aria-labelledby="home-headline">
      <div className="fp26-hero-copy">
        <div className="fp26-issue"><span>Independent food discovery</span><span>Sri Lanka / No. 01</span></div>
        <h1 id="home-headline">Good food.<br/>Great finds.</h1>
        <div className="fp26-hero-bottom"><p>Discover the people, places and flavours that make Sri Lanka worth tasting.</p>
          <Link href="/discover" className="fp26-textlink">Explore FreshPick <ArrowUpRight size={20} aria-hidden="true"/></Link></div>
        <form action="/discover" role="search" className="fp26-search"><label htmlFor="home-discover" className="sr-only">Find food, makers or places</label><Search size={21} aria-hidden="true"/><input id="home-discover" name="q" maxLength={100} placeholder="Find a dish, product or place"/><button type="submit" aria-label="Search FreshPick"><ArrowRight size={21}/></button></form>
      </div>
      <figure className="fp26-hero-photo"><Image src="/images/editorial/recipe-ingredients.webp" alt="A collection of fresh ingredients for cooking" fill priority sizes="(max-width: 760px) 100vw, 50vw"/><figcaption>FreshPick / The art of eating well</figcaption></figure>
    </section>
    <div className="fp26-shell"><DiscoveryRail/><DiscoveryChapters/></div>
    <div className="journal-first-note studio-note editorial-wrap">
      {makers.length > 0 ? <Link href={'/makers/'+makers[0].makerHandle}><span className="fp-kicker">Meet a maker</span><span>{makers[0].name}{makers[0].makerTown ? ' · '+makers[0].makerTown : ''}</span><ArrowUpRight size={18}/></Link> : <Link href="/stories/the-bread-window"><span className="fp-kicker">From the journal</span><span>The bread window</span><ArrowUpRight size={18}/></Link>}
    </div>
    {batches.length > 0 && <section className="journal-batch-board editorial-wrap" aria-labelledby="home-batches"><div className="fp-section-head"><div><p className="fp-kicker">From the kitchens</p><h2 id="home-batches">Taking preorders.</h2></div><Link className="fp-inline" href="/makers">See the directory</Link></div><div className="journal-batch-board-grid">{batches.map(batch=><article key={batch.id}><span className="fp-kicker">{batch.item.supplier.name}</span><h3><Link href={makerItemPath(batch.item.supplier.makerHandle,batch.item.slug)}>{batch.item.name} <ArrowUpRight size={16} aria-hidden="true"/></Link></h3>{batch.item.supplier.makerTown && <p className="journal-location"><MapPin size={14} aria-hidden="true"/>{batch.item.supplier.makerTown}</p>}<BatchDetails batch={batch} itemName={batch.item.name} phone={batch.item.supplier.makerWhatsApp}/></article>)}</div></section>}
    {items.length > 0 && <section className="fp-section editorial-wrap"><div className="fp-section-head"><h2>Fresh from the makers</h2><Link className="fp-inline" href="/makers">Browse items</Link></div><div className="journal-item-grid" data-studio-grid>{items.map(item => <MakerItemCard key={item.id} handle={item.supplier.makerHandle} item={item} makerName={item.supplier.name} makerTown={item.supplier.makerTown}/>)}</div></section>}
    {makers.length > 0 && <section className="fp-people editorial-wrap">
      <div className="fp-section-head"><h2>Meet the makers</h2><Link className="fp-inline" href="/makers">The directory</Link></div>
      <div className="fp-people-grid" data-studio-grid>{makers.map(maker => <Link key={maker.id} href={`/makers/${maker.makerHandle}`}>
        <span aria-hidden="true">{maker.name.slice(0,1)}</span><div><h3>{maker.name}</h3><p>{maker.makerTown}</p>{maker.makerBio && <p className="line-clamp-2">{maker.makerBio}</p>}</div>
      </Link>)}</div>
    </section>}
    <div className="modern-journal"><ReadingShelf/></div>
    <section className="journal-method studio-method editorial-wrap" data-studio-chapter aria-label="How FreshPick works"><div><p className="fp-kicker">A different kind of market</p><h2>Closer to good food.</h2></div><ol><li><span>01</span><div><h3>Find something good</h3><p>Explore food by maker, dish, product or place.</p></div></li><li><span>02</span><div><h3>Know the food</h3><p>Explore the details and stories behind your choice.</p></div></li><li><span>03</span><div><h3>Make it yours</h3><p>Enquire directly and arrange the details together.</p></div></li></ol></section>
    <section className="fp-invite lux-invite studio-invite editorial-wrap" data-studio-chapter><div className="fp-image"><Image src="/images/editorial/restaurant-kitchen.webp" alt="Cooks working at a busy kitchen counter" fill sizes="(max-width:639px) 95vw, 45vw"/></div><div><h2>Your food deserves to be discovered.</h2><p>Give your food business a free page of its own. Showcase what you make and connect directly with customers.</p><Link className="maker-button" href="/for-businesses">Get discovered</Link></div></section>
  </div>;
}
