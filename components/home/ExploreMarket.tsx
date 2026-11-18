import { occasions } from '@/lib/experiences';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import styles from './exploreMarket.module.css';

const features = [
  { title: 'Dinner for two', href: '/experiences/dinner-for-two', image: '/images/experiences/table.webp' },
  { title: 'Ready meals', href: '/meals', image: '/images/categories/cooked-food.webp' },
  { title: 'Bake together', href: '/experiences/baking-together', image: '/images/editorial/hands-at-work.webp' },
];

export default function ExploreMarket() {
  return <section className={styles.section} aria-labelledby="explore-market-title">
    <div className={styles.heading}>
      <h2 id="explore-market-title">Around the table</h2>
      <Link href="/experiences">All experiences <ArrowUpRight size={16} aria-hidden="true" /></Link>
    </div>
    <div className={styles.features}>
      {features.map(({ title, href, image }, index) => (
        <Link key={href} href={href} className={styles.feature}>
          <div className={styles.picture}><Image src={image} alt="" fill unoptimized sizes={index === 0 ? '(max-width: 650px) 100vw, 46vw' : '(max-width: 650px) 45vw, 24vw'} /></div>
          <span>{title}<ArrowUpRight size={18} aria-hidden="true" /></span>
        </Link>
      ))}
    </div>
    <nav className={styles.occasions} aria-label="Browse by occasion">
      <span>Plan an occasion</span>
      {occasions.map(name => <Link key={name} href={{ pathname: '/experiences', query: { occasion: name } }}>{name}</Link>)}
      <Link href="/gifts">Food gifts</Link>
    </nav>
  </section>;
}
