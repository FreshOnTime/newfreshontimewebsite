import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const chapters = [
  { number: '01', title: 'Made by real people.', description: 'Meet independent bakers, home cooks and growers. Get to know the people behind your food.', image: '/images/editorial/restaurant-kitchen.webp', alt: 'Cooks preparing food together', href: '/makers', action: 'Meet the makers' },
  { number: '02', title: 'Discover something different.', description: 'Explore small-batch food, pantry favourites and seasonal creations from local kitchens.', image: '/images/editorial/kitchen-basket.webp', alt: 'A basket of fresh ingredients', href: '/makers', action: 'Explore local food' },
  { number: '03', title: 'Every food has a story.', description: 'Read about the craft, the ingredients and the people behind what we eat.', image: '/images/editorial/pepper-mortar.webp', alt: 'Peppercorns and a mortar', href: '/stories', action: 'Read the journal' },
];

export function ExperienceChapters() {
  return <section className="studio-experience" aria-label="The FreshPick experience">
    <div className="studio-experience-heading editorial-wrap" data-studio-chapter>
      <p className="studio-overline">The FreshPick experience</p>
      <h2>Food worth<br/>getting to know.</h2>
    </div>
    <div className="editorial-wrap studio-chapter-list">
      {chapters.map(chapter => <article className="studio-story-panel" key={chapter.number} data-studio-chapter>
        <div className="studio-story-image" data-studio-parallax><Image src={chapter.image} alt={chapter.alt} fill sizes="(max-width: 767px) 100vw, 58vw"/></div>
        <div className="studio-chapter-copy">
          <p className="studio-overline">{chapter.number} / 03</p>
          <h2>{chapter.title}</h2>
          <p>{chapter.description}</p>
          <Link href={chapter.href} className="studio-text-action">{chapter.action}<ArrowUpRight size={18} aria-hidden="true"/></Link>
        </div>
      </article>)}
    </div>
  </section>;
}
