import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { DiscoveryRail } from './DiscoveryRail';
import { fieldNotes, notePath } from '@/lib/fieldNotes';

const crafts = [
  ['Bakery', 'Bakery', '/images/categories/bakery.webp'],
  ['Home kitchens', 'Prepared food', '/images/categories/cooked-food.webp'],
  ['Pantry', 'Pantry', '/images/categories/pantry-staples.webp'],
  ['Growers', 'Produce', '/images/editorial/kitchen-basket.webp'],
  ['Dairy & eggs', 'Dairy & eggs', '/images/categories/dairy-eggs.webp'],
  ['Drinks', 'Drinks', '/images/categories/beverages.webp'],
];

export function CraftShelf() {
  return <section id="discover-craft" className="fp-section lux-crafts editorial-wrap" aria-labelledby="craft-title">
    <div className="fp-section-head"><div><p className="fp-kicker">Find your next favourite</p><h2 id="craft-title">A world of local food.</h2></div><Link className="fp-inline" href="/makers">All makers</Link></div>
    <DiscoveryRail label="food crafts">{crafts.map(([label, kind, image]) =>
      <Link key={kind} href={`/makers?kind=${encodeURIComponent(kind)}`} className="fp-craft">
        <div className="fp-image"><Image src={image} alt="" fill sizes="(max-width: 639px) 68vw, (max-width: 1023px) 32vw, 24vw" /></div>
        <span>{label}<ArrowUpRight size={16} aria-hidden="true"/></span>
      </Link>)}</DiscoveryRail>
  </section>;
}

export function ReadingShelf({ exclude }: { exclude?: string }) {
  return <section className="fp-section editorial-wrap" aria-label="FreshPick field notes">
    <div className="fp-section-head"><div><p className="fp-kicker">Read slowly</p><h2>Field notes.</h2></div><Link href="/stories" className="fp-inline">The journal</Link></div>
    <div className="fp-reads">{fieldNotes.filter(note => note.slug !== exclude).map(note =>
      <Link key={note.slug} href={notePath(note)} className="fp-read">
        <div className="fp-image"><Image src={note.image} alt={note.alt} fill sizes="(max-width: 639px) 95vw, 33vw" /></div>
        <span className="fp-kicker">{note.category}</span><h3>{note.title}</h3><p>{note.excerpt}</p><span className="journal-read-link">Read the story <ArrowUpRight size={15} aria-hidden="true"/></span>
      </Link>
    )}</div>
  </section>;
}

export function PageBand({ title, intro, image, alt }: { title: string; intro?: string; image?: string; alt?: string }) {
  return <header className={'fp-band' + (image ? ' fp-band-photo' : '')}><div className="editorial-wrap">
    <div><h1>{title}</h1>{intro && <p>{intro}</p>}</div>
    {image && <div className="fp-image"><Image src={image} alt={alt || ''} fill sizes="(max-width:639px) 100vw, 38vw" /></div>}
  </div></header>;
}
