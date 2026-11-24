import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import styles from './EditorialHome.module.css';

const chapters = [
  { number: '01', title: 'Made by real people.', description: 'Meet independent bakers, home cooks and growers. Get to know the people behind your food.', image: '/images/editorial/restaurant-kitchen.webp', alt: 'Cooks preparing food together', href: '/makers', action: 'Meet the makers' },
  { number: '02', title: 'Discover something different.', description: 'Explore small-batch food, pantry favourites and seasonal creations from local kitchens.', image: '/images/editorial/kitchen-basket.webp', alt: 'A basket of fresh ingredients', href: '/makers', action: 'Explore local food' },
  { number: '03', title: 'Every food has a story.', description: 'Read about the craft, the ingredients and the people behind what we eat.', image: '/images/editorial/pepper-mortar.webp', alt: 'Peppercorns and a mortar', href: '/stories', action: 'Read the journal' },
];

export function ExperienceChapters() {
  return <section className={styles.story} aria-label="The FreshPick experience">
    <header className={styles.storyHeader} data-studio-chapter>
      <p className={styles.eyebrow}>THE FRESHPICK EXPERIENCE / 01—03</p>
      <h2>More than a meal.<br/><em>A story worth knowing.</em></h2>
    </header>
    <div className={styles.chapterGrid}>
      {chapters.map(chapter => <article className={styles.chapter} key={chapter.number} data-studio-feature data-studio-chapter>
        <Link className={styles.chapterPhoto} href={chapter.href} aria-label={chapter.action} data-studio-parallax>
          <Image src={chapter.image} alt={chapter.alt} fill sizes={chapter.number === '01' ? '(max-width: 767px) 100vw, 90vw' : '(max-width: 767px) 100vw, 45vw'}/>
          <span className={styles.chapterNumber} aria-hidden="true">{chapter.number}</span>
        </Link>
        <div className={styles.chapterCopy}>
          <div><h3>{chapter.title}</h3><p>{chapter.description}</p></div>
          <Link href={chapter.href} className={styles.chapterAction} aria-label={chapter.action}><ArrowUpRight size={23} aria-hidden="true"/></Link>
        </div>
      </article>)}
    </div>
  </section>;
}
