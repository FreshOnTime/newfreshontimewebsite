import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import styles from './occasionEdit.module.css';

const collections = [
  { name: 'Date nights', image: '/images/experiences/table.webp' },
  { name: 'Birthdays', image: '/images/experiences/celebration-cake.webp' },
  { name: 'Family time', image: '/images/categories/cooked-food.webp' },
] as const;

export default function OccasionEdit() {
  return <section className={styles.edit} aria-labelledby="occasion-heading">
    <div className={styles.heading}><h2 id="occasion-heading">What’s the occasion?</h2><Link href="/gifts">Browse gifts <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
    <div className={styles.collections}>{collections.map(({name, image}) =>
      <Link key={name} className={styles.collection} href={{pathname:'/experiences',query:{occasion:name}}}>
        <Image src={image} alt="" fill unoptimized sizes="(max-width: 640px) 88vw, 33vw" className="object-cover" />
        <span>{name}<ArrowUpRight size={19} aria-hidden="true" /></span>
      </Link>
    )}</div>
  </section>;
}
