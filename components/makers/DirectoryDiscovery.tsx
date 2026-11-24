import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { ReadingShelf } from './Edition';

const collections = [
  { title: 'From the oven.', kind: 'Bakery', image: '/images/categories/bakery.webp', description: 'Bread, bakes and the craft of slow mornings.' },
  { title: 'From the kitchen.', kind: 'Prepared food', image: '/images/categories/cooked-food.webp', description: 'Home cooking and food made in small batches.' },
  { title: 'From the pantry.', kind: 'Pantry', image: '/images/categories/pantry-staples.webp', description: 'Ingredients and preserves with a story.' },
];

export function DirectoryDiscovery() {
  return <>
    <section className="directory-discovery editorial-wrap" aria-labelledby="discover-food-heading" data-studio-chapter>
      <div className="directory-discovery-heading">
        <div><p className="studio-overline">A taste of Sri Lanka</p><h2 id="discover-food-heading">Find your kind of food.</h2></div>
        <p>Browse the crafts we welcome into FreshPick. These are discovery categories, not available listings.</p>
      </div>
      <div className="directory-discovery-grid" data-studio-grid>
        {collections.map(collection => <Link key={collection.kind} className="directory-discovery-card" href={'/makers?kind='+encodeURIComponent(collection.kind)}>
          <div className="directory-discovery-photo"><Image src={collection.image} alt="" fill sizes="(max-width:767px) 90vw, 30vw"/></div>
          <div className="directory-discovery-copy"><h3>{collection.title}</h3><p>{collection.description}</p><span className="directory-circle"><ArrowUpRight size={21} aria-hidden="true"/></span></div>
        </Link>)}
      </div>
    </section>
    <div className="directory-launch editorial-wrap" data-studio-chapter>
      <div className="directory-launch-copy studio-chapter-copy">
        <p className="studio-overline">For the people who make</p>
        <h2>Good things start in your kitchen.</h2>
        <p>We’re opening the directory to independent food makers. Create your own page, share what you make, and connect with people directly.</p>
        <Link className="modern-primary" href="/join">Start a maker page <ArrowRight size={17} aria-hidden="true"/></Link>
      </div>
      <div className="directory-launch-image" data-studio-parallax><Image src="/images/editorial/hands-at-work.webp" alt="Hands kneading dough" fill sizes="(max-width:767px) 100vw, 50vw"/></div>
    </div>
    <div className="modern-journal"><ReadingShelf/></div>
  </>;
}
