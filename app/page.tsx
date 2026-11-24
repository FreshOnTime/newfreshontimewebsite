import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Search, MapPin, ArrowRight } from 'lucide-react';
import { ExperienceChapters } from '@/components/makers/ExperienceChapters';
import { MakerItemCard, BatchDetails } from '@/components/makers/MakerCards';
import { CraftShelf, ReadingShelf } from '@/components/makers/Edition';
import { publicItemSelect } from '@/lib/makerQueries';
import { publicMakerWhere, openBatches, makerItemPath } from '@/lib/makers';
import prisma from '@/lib/prisma';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const metadata = pageMetadata({ path: '/', title: 'FreshPick | Discover Sri Lankan food makers', description: 'Meet independent bakers, home cooks and growers. Explore their items, stories and latest batches.' });

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
    <section className="lux-hero studio-hero" aria-labelledby="home-headline">
      <div className="lux-hero-inner editorial-wrap">
      <div className="lux-hero-copy">
        <p className="fp-kicker" data-studio-intro>FreshPick Sri Lanka</p>
        <h1 id="home-headline" data-studio-intro>Good food.<br/><span>Closer to home.</span></h1>
        <p data-studio-intro>Discover independent food makers across Sri Lanka.</p>
        <form action="/makers" role="search" className="journal-discover"><label htmlFor="home-discover" className="sr-only">Find a food or maker</label><Search size={19} aria-hidden="true"/><input id="home-discover" name="q" maxLength={100} placeholder="Try sourdough or a maker name"/><button type="submit" aria-label="Search makers"><ArrowRight size={19}/></button></form>
        <div className="modern-hero-actions" data-studio-intro><Link href="/makers" className="modern-primary">Explore makers</Link><Link href="/how-it-works" className="modern-link">How it works <ArrowUpRight size={16} aria-hidden="true"/></Link></div>
      </div>
      
      </div>
      <div className="modern-hero-media studio-hero-media"><Image src="/images/editorial/hands-at-work.webp" alt="Hands kneading dough beside a bowl" fill priority sizes="100vw" className="lux-hero-image"/></div>
    </section>
    <CraftShelf/>
    <ExperienceChapters/>
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
    <section className="journal-method studio-method editorial-wrap" data-studio-chapter aria-label="How FreshPick works"><div><p className="fp-kicker">A different kind of market</p><h2>Closer to the people who make it.</h2></div><ol><li><span>01</span><div><h3>Find something good</h3><p>Explore food by craft, maker or town.</p></div></li><li><span>02</span><div><h3>Meet the maker</h3><p>Read their story and see what they make.</p></div></li><li><span>03</span><div><h3>Make it yours</h3><p>Enquire directly and arrange the details together.</p></div></li></ol></section>
    <section className="fp-invite lux-invite studio-invite editorial-wrap" data-studio-chapter><div className="fp-image"><Image src="/images/editorial/restaurant-kitchen.webp" alt="Cooks working at a busy kitchen counter" fill sizes="(max-width:639px) 95vw, 45vw"/></div><div><h2>Your food deserves to be discovered.</h2><p>Give your food a page of its own. Share your next batch, write a story and take enquiries on WhatsApp.</p><Link className="maker-button" href="/join">Start a maker page</Link></div></section>
  </div>;
}
