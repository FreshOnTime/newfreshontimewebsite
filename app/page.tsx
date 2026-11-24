import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Search } from 'lucide-react';
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
    <div className="fp-cover editorial-wrap">
      <section className="fp-lead">
        <Image src="/images/home/market-pantry.webp" alt="" fill priority sizes="(max-width: 799px) 100vw, 72vw" />
        <div className="fp-lead-copy">
          <span className="fp-kicker"><MapPin size={15} /> Sri Lanka</span>
          <h1>Good food,<br/><em>closer to home.</em></h1>
          <p>Discover independent bakers, home cooks and growers. Talk to the people who make your food.</p>
          <form action="/makers" className="fp-search"><Search size={18}/><input name="town" aria-label="Search by town" placeholder="Search by town or area"/><button>Explore</button></form>
        </div>
      </section>
      <Link className="fp-cover-note" href="/stories/the-bread-window">
        <div className="fp-image"><Image src="/images/editorial/hands-at-work.webp" alt="Hands shaping fresh dough" fill priority sizes="(max-width:799px) 38vw, 30vw"/></div>
        <div className="fp-cover-caption"><span className="fp-kicker">From the journal</span><h2>The bread <em>window.</em></h2><span className="fp-note-link">Read the field note</span></div>
      </Link>
    </div>
    <CraftShelf/>
    {items.length > 0 && <section className="fp-section editorial-wrap"><div className="fp-section-head"><h2>Fresh from the makers</h2><Link className="fp-inline" href="/makers">Browse items</Link></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{items.map(item => <MakerItemCard key={item.id} handle={item.supplier.makerHandle} item={item}/>)}</div></section>}
    {makers.length > 0 && <section className="fp-people editorial-wrap">
      <div className="fp-section-head"><h2>Meet the makers</h2><Link className="fp-inline" href="/makers">The directory</Link></div>
      <div className="fp-people-grid">{makers.map(maker => <Link key={maker.id} href={`/makers/${maker.makerHandle}`}>
        <span aria-hidden="true">{maker.name.slice(0,1)}</span><div><h3>{maker.name}</h3><p>{maker.makerTown}</p>{maker.makerBio && <p className="line-clamp-2">{maker.makerBio}</p>}</div>
      </Link>)}</div>
    </section>}
    <div className="fp-paper"><ReadingShelf/></div>
    <section className="fp-invite editorial-wrap"><div className="fp-image"><Image src="/images/editorial/restaurant-kitchen.webp" alt="Cooks working at a busy kitchen counter" fill sizes="(max-width:639px) 95vw, 45vw"/></div><div><h2>Made in your kitchen?</h2><p>Give your food a page of its own. Share your next batch, write a story and take enquiries on WhatsApp.</p><Link className="maker-button" href="/join">Start a maker page</Link></div></section>
  </>;
}
