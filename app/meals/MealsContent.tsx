import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import ProductGrid from '@/components/products/ProductGrid';
import type { Product } from '@/models/product';
import styles from './meals.module.css';

const foodLinks = [
  { href: '/homemade', name: 'Home kitchens', photo: '/images/editorial/hands-at-work.webp' },
  { href: '/search?q=bakery', name: 'Bakery', photo: '/images/categories/bakery.webp' },
];

export default function MealsContent({ products }: { products: Product[] }) {
  const available = products.filter(product => !product.isOutOfStock);
  const soldOut = products.filter(product => product.isOutOfStock);

  return (
    <div className={styles.page}>
      <header className={styles.cover}>
        <Image src="/images/categories/cooked-food.webp" alt="Rice served on a clay plate with curries and sliced red onions" fill priority unoptimized sizes="100vw" />
        <div className={styles.coverText}>
          <h1 className="section-masthead">Order food</h1>
          <p>Ready meals, home kitchens and bakery in Colombo.</p>
          <a href={available.length ? '#menu' : '#food-counter'}>{available.length ? 'See the menu' : 'Explore food'} <ArrowDown size={16} aria-hidden="true" /></a>
        </div>
      </header>

      <div className={styles.content}>
        <section id="menu" aria-labelledby="menu-heading">
          <div className={styles.heading}>
            <h2 id="menu-heading">Ready meals</h2>
            {available.length > 0 && <span>{available.length} {available.length === 1 ? 'dish' : 'dishes'} available</span>}
          </div>
          {available.length > 0 ? <ProductGrid products={available} /> : <p className={styles.empty}>No ready meals are available to order right now.</p>}
          {soldOut.length > 0 && <details className={styles.soldOut}>
            <summary>Currently sold out ({soldOut.length})</summary>
            <ProductGrid products={soldOut} />
          </details>}
        </section>

        <section id="food-counter" aria-labelledby="counter-heading">
          <div className={styles.heading}><h2 id="counter-heading">More food to explore</h2><Link href="/shops">All shops <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
          <div className={styles.counter}>
            {foodLinks.map(({ href, name, photo }) => (
              <Link key={href} href={href} className={styles.foodLink}>
                <div className={styles.photo}><Image src={photo} alt="" fill sizes="(max-width: 600px) 44vw, 47vw" className="object-cover" /></div>
                <div>{name}<ArrowUpRight size={20} aria-hidden="true" /></div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
