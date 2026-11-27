import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { DiscoveryRail } from './DiscoveryRail';
import { fieldNotes } from '@/lib/fieldNotes';
import { EditorialHeader,GuideShelf } from '@/components/discovery/Editorial';

const crafts = [
  ['Bakery', 'Bakery', '/images/categories/bakery.webp'],
  ['Home kitchens', 'Prepared food', '/images/categories/cooked-food.webp'],
  ['Pantry', 'Pantry', '/images/categories/pantry-staples.webp'],
  ['Growers', 'Produce', '/images/editorial/kitchen-basket.webp'],
  ['Dairy & eggs', 'Dairy & eggs', '/images/categories/dairy-eggs.webp'],
  ['Drinks', 'Drinks', '/images/categories/beverages.webp'],
];

export function CraftShelf() {
  return <section id="discover-craft" className="fp-section lux-crafts editorial-wrap" data-studio-chapter aria-labelledby="craft-title">
    <div className="fp-section-head"><div><h2 id="craft-title">Explore local food.</h2></div><Link className="fp-inline" href="/makers">All makers</Link></div>
    <DiscoveryRail label="food crafts">{crafts.map(([label, kind, image]) =>
      <Link key={kind} href={`/makers?kind=${encodeURIComponent(kind)}`} className="fp-craft">
        <div className="fp-image"><Image src={image} alt="" fill sizes="(max-width: 639px) 68vw, (max-width: 1023px) 32vw, 24vw" /></div>
        <span>{label}<ArrowUpRight size={19} aria-hidden="true"/></span>
      </Link>)}</DiscoveryRail>
  </section>;
}

export function ReadingShelf({exclude}:{exclude?:string}){return <div className="fp26-shell"><GuideShelf slugs={fieldNotes.filter(note=>note.slug!==exclude).slice(0,3).map(note=>note.slug)} heading="Keep reading" compact/></div>}
export function PageBand({title,intro,image,alt,eyebrow}:{title:string;intro?:string;image?:string;alt?:string;eyebrow?:string}){return <div className="fp26-shell"><EditorialHeader title={title} description={intro} photo={image} alt={alt} eyebrow={eyebrow}/></div>}