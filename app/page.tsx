import Image from 'next/image';
import styles from '@/components/makers/EditorialHome.module.css';
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
  return <div className={styles.home}>
    <section className={styles.hero} data-studio-hero aria-labelledby="home-headline">
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow} data-studio-intro><span/> THE LOCAL FOOD EDIT · SRI LANKA</p>
        <h1 id="home-headline" data-studio-intro>Good food.<br/><em>Closer to home.</em></h1>
        <p className={styles.intro} data-studio-intro>Discover independent food makers across Sri Lanka. Find something extraordinary in an everyday kitchen.</p>
        <form action="/makers" role="search" className={`journal-discover ${styles.search}`}><label htmlFor="home-discover" className="sr-only">Find a food or maker</label><Search size={19} aria-hidden="true"/><input id="home-discover" name="q" maxLength={100} placeholder="Try sourdough or a maker name"/><button type="submit" aria-label="Search makers"><ArrowRight size={19}/></button></form>
        <div className={styles.actions} data-studio-intro><Link href="/makers" className={styles.primary}>Explore makers <ArrowUpRight size={17} aria-hidden="true"/></Link><Link href="/how-it-works" className={styles.textLink}>How it works <ArrowUpRight size={15} aria-hidden="true"/></Link></div>
        <div className={styles.heroFooter}><span>Independent makers. Real stories.</span><span>01 / DISCOVER</span></div>
      </div>
      <figure className={styles.heroMedia} data-studio-hero-media>
        <Image src="/images/editorial/hands-at-work.webp" alt="Hands kneading dough beside a bowl" fill priority sizes="(max-width: 767px) 100vw, 55vw" />
        <figcaption>THE ART OF MAKING <span>FRESHPICK JOURNAL</span></figcaption>
      </figure>
    </section>
    <CraftShelf/>
    {makers.length === 0 && items.length === 0 && batches.length === 0 && <section className={styles.launch} aria-label="Directory opening"><div><p className={styles.eyebrow}>A MARKET IN THE MAKING</p><h2>Something good is taking shape.</h2><p>Our independent maker directory is opening. Explore the food journal or introduce your own kitchen.</p></div><Link className={styles.textLink} href="/join">Become a maker <ArrowUpRight size={18} aria-hidden="true"/></Link></section>}
    {batches.length > 0 && <section className="journal-batch-board editorial-wrap" aria-labelledby="home-batches"><div className="fp-section-head"><div><p className="fp-kicker">From the kitchens</p><h2 id="home-batches">Taking preorders.</h2></div><Link className="fp-inline" href="/makers">See the directory</Link></div><div className="journal-batch-board-grid">{batches.map(batch=><article key={batch.id}><span className="fp-kicker">{batch.item.supplier.name}</span><h3><Link href={makerItemPath(batch.item.supplier.makerHandle,batch.item.slug)}>{batch.item.name} <ArrowUpRight size={16} aria-hidden="true"/></Link></h3>{batch.item.supplier.makerTown && <p className="journal-location"><MapPin size={14} aria-hidden="true"/>{batch.item.supplier.makerTown}</p>}<BatchDetails batch={batch} itemName={batch.item.name} phone={batch.item.supplier.makerWhatsApp}/></article>)}</div></section>}
    {items.length > 0 && <section className="fp-section editorial-wrap"><div className="fp-section-head"><h2>Fresh from the makers</h2><Link className="fp-inline" href="/makers">Browse items</Link></div><div className="journal-item-grid" data-studio-grid>{items.map(item => <MakerItemCard key={item.id} handle={item.supplier.makerHandle} item={item} makerName={item.supplier.name} makerTown={item.supplier.makerTown}/>)}</div></section>}
    {makers.length > 0 && <section className="fp-people editorial-wrap">
      <div className="fp-section-head"><h2>Meet the makers</h2><Link className="fp-inline" href="/makers">The directory</Link></div>
      <div className="fp-people-grid" data-studio-grid>{makers.map(maker => <Link key={maker.id} href={`/makers/${maker.makerHandle}`}>
        <span aria-hidden="true">{maker.name.slice(0,1)}</span><div><h3>{maker.name}</h3><p>{maker.makerTown}</p>{maker.makerBio && <p className="line-clamp-2">{maker.makerBio}</p>}</div>
      </Link>)}</div>
    </section>}
    <ExperienceChapters/>
    <div className="modern-journal"><ReadingShelf/></div>
    <section className="journal-method studio-method editorial-wrap" data-studio-chapter aria-label="How FreshPick works"><div><p className="fp-kicker">A different kind of market</p><h2>Closer to the people who make it.</h2></div><ol><li><span>01</span><div><h3>Find something good</h3><p>Explore food by craft, maker or town.</p></div></li><li><span>02</span><div><h3>Meet the maker</h3><p>Read their story and see what they make.</p></div></li><li><span>03</span><div><h3>Make it yours</h3><p>Enquire directly and arrange the details together.</p></div></li></ol></section>
    <section className="fp-invite lux-invite studio-invite editorial-wrap" data-studio-chapter><div className="fp-image"><Image src="/images/editorial/restaurant-kitchen.webp" alt="Cooks working at a busy kitchen counter" fill sizes="(max-width:639px) 95vw, 45vw"/></div><div><h2>Your food deserves to be discovered.</h2><p>Give your food a page of its own. Share your next batch, write a story and take enquiries on WhatsApp.</p><Link className="maker-button" href="/join">Start a maker page</Link></div></section>
  </div>;
}
