import MarketFinder from '@/components/home/MarketFinder';
import ProductImage from '@/components/products/ProductImage';
import { discountedUnitPrice } from '@/lib/commercePricing';
import styles from './home.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { listShops, listSessions } from '@/lib/marketplace';
import prisma from '@/lib/prisma';
import { productCardSelect, serializeProductCardForUi } from '@/lib/productSerializer';
import ProductGrid from '@/components/products/ProductGrid';
import type { Product } from '@/models/product';
import { ShopList, SessionList } from '@/components/marketplace/Listings';
import { publicPageMetadata } from '@/lib/publicPages';

export const metadata = publicPageMetadata('/');
export const dynamic = 'force-dynamic';

export default async function Home() {
  const [shopResult, sessionResult, productResult] = await Promise.allSettled([
    listShops(), listSessions(), prisma.product.findMany({ where: { archived: false, stockQty: { gt: 0 } }, select: { ...productCardSelect, supplier: { select: { id: true, name: true, applicationStatus: true, status: true } } },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }], take: 4 }),
  ]);
  const shops = shopResult.status === 'fulfilled' ? shopResult.value : [];
  const sessions = sessionResult.status === 'fulfilled' ? sessionResult.value : [];
  const products = productResult.status === 'fulfilled' ? productResult.value : [];
  const [lead, ...otherProducts] = products;
  const seller = lead?.supplier;
  const hasListings = Boolean(lead || sessions.length || shops.length);
  const listingsUnavailable = [productResult, shopResult, sessionResult].some(result => result.status === 'rejected');
  return <div>
    <section className="table-cover" aria-labelledby="cover-title">
      <Image src="/images/editorial/restaurant-kitchen.webp" alt="A chef finishing a plate at the kitchen pass" fill priority unoptimized sizes="100vw" />
      <div className="cover-inner">
        <h1 id="cover-title">Food &amp; experiences<br />in Colombo.</h1>
        <div className="cover-links">
          <Link href="/experiences">Explore experiences <ArrowUpRight size={17} aria-hidden="true" /></Link>
          <Link href="/shops">Browse shops &amp; hosts</Link>
        </div>
      </div>
    </section>
    <MarketFinder />
    <div className={styles.content}>
      <div className={styles.spread}>
        {lead && <article className={styles.lead}>
          {(lead.image || lead.images[0]) && <Link className={styles.photo} href={'/products/' + encodeURIComponent(lead.sku)} aria-label={lead.name}>
            <ProductImage src={lead.image || lead.images[0]} alt={lead.name} />
          </Link>}
          <div className={styles.caption}>
            {seller?.applicationStatus === 'approved' && seller.status === 'active' && <Link className={styles.seller} href={'/shops/' + seller.id}>{seller.name}</Link>}
            <h2><Link href={'/products/' + encodeURIComponent(lead.sku)}>{lead.name}</Link></h2>
            <div className={styles.price}><strong>LKR {discountedUnitPrice(Number(lead.price), Number(lead.discountPercentage)).toLocaleString('en-LK')}</strong>
              <Link className="editorial-link" href={'/products/' + encodeURIComponent(lead.sku)}>View product <ArrowUpRight size={16} /></Link></div>
          </div>
        </article>}
        {sessions.length > 0 && <section className={styles.schedule}>
          <header><h2>Next on the calendar</h2><Link href="/experiences">All dates</Link></header>
          <SessionList sessions={sessions.slice(0, 3)} />
        </section>}
      </div>
      {otherProducts.length > 0 && <section><div className="section-line"><h2>More from the market</h2><Link href="/products">All products</Link></div>
        <ProductGrid products={otherProducts.map(serializeProductCardForUi) as Product[]} />
      </section>}
      {shops.length > 0 && <section><div className="section-line"><h2>Shops &amp; hosts</h2><Link href="/shops">View directory</Link></div><ShopList shops={shops.slice(0, 4)} /></section>}
      {listingsUnavailable && <p role="status">Some marketplace listings are temporarily unavailable.</p>}
      {!hasListings && !listingsUnavailable && <section><h2>The marketplace is getting ready</h2><p>Check back for published products and dates, or <Link className="underline" href="/b2b">apply to list your business</Link>.</p></section>}
    </div>
  </div>;
}
