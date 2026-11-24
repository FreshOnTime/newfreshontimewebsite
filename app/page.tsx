import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { MakerItemCard } from '@/components/makers/MakerCards';
import { CraftShelf, ReadingShelf } from '@/components/makers/Edition';
import { publicItemSelect } from '@/lib/makerQueries';
import { publicMakerWhere } from '@/lib/makers';
import prisma from '@/lib/prisma';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const metadata = pageMetadata({ path: '/', title: 'FreshPick | Discover Sri Lankan food makers', description: 'Meet independent bakers, home cooks and growers. Explore their items, stories and latest batches.' });

export default async function Home() {
  const [items, makers] = await Promise.all([
    prisma.makerItem.findMany({
    where: { published: true, supplier: publicMakerWhere }, take: 4,
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    select: { ...publicItemSelect, supplier: { select: { makerHandle: true } } },
    }),
    prisma.supplier.findMany({ where: publicMakerWhere, orderBy: [{name: 'asc'}, {id: 'asc'}], take: 4,
      select: { id: true, name: true, makerHandle: true, makerTown: true, makerBio: true } }),
  ]);
  return <>
    <section className="journal-cover editorial-wrap">
      <div className="journal-cover-copy">
        <p className="fp-kicker">A taste of Sri Lanka</p>
        <h1>Good food.<br/><em>Good people.</em></h1>
        <p>Discover Sri Lankan bakers, home cooks, growers and pantry makers. Find something you love and contact the maker directly on WhatsApp.</p>
        <Link href="/makers" className="maker-button">Explore makers <ArrowUpRight size={17}/></Link>
      </div>
      <figure className="journal-cover-photo fp-image"><Image src="/images/editorial/hands-at-work.webp" alt="Hands kneading dough beside a bowl" fill priority sizes="(max-width: 767px) 100vw, 57vw" /></figure>
    </section>
    <div className="journal-first-note editorial-wrap">
      {makers.length > 0 ? <Link href={'/makers/'+makers[0].makerHandle}><span className="fp-kicker">Meet a maker</span><span>{makers[0].name}{makers[0].makerTown ? ' · '+makers[0].makerTown : ''}</span><ArrowUpRight size={18}/></Link> : <Link href="/stories/the-bread-window"><span className="fp-kicker">From the journal</span><span>The bread window</span><ArrowUpRight size={18}/></Link>}
    </div>
    {items.length > 0 && <section className="fp-section editorial-wrap"><div className="fp-section-head"><h2>Fresh from the makers</h2><Link className="fp-inline" href="/makers">Browse items</Link></div><div className="journal-item-grid">{items.map(item => <MakerItemCard key={item.id} handle={item.supplier.makerHandle} item={item}/>)}</div></section>}
    {makers.length > 0 && <section className="fp-people editorial-wrap">
      <div className="fp-section-head"><h2>Meet the makers</h2><Link className="fp-inline" href="/makers">The directory</Link></div>
      <div className="fp-people-grid">{makers.map(maker => <Link key={maker.id} href={`/makers/${maker.makerHandle}`}>
        <span aria-hidden="true">{maker.name.slice(0,1)}</span><div><h3>{maker.name}</h3><p>{maker.makerTown}</p>{maker.makerBio && <p className="line-clamp-2">{maker.makerBio}</p>}</div>
      </Link>)}</div>
    </section>}
    <CraftShelf/>
    <div className="fp-paper"><ReadingShelf/></div>
    <section className="fp-invite editorial-wrap"><div className="fp-image"><Image src="/images/editorial/restaurant-kitchen.webp" alt="Cooks working at a busy kitchen counter" fill sizes="(max-width:639px) 95vw, 45vw"/></div><div><h2>Made in your kitchen?</h2><p>Give your food a page of its own. Share your next batch, write a story and take enquiries on WhatsApp.</p><Link className="maker-button" href="/join">Start a maker page</Link></div></section>
  </>;
}
