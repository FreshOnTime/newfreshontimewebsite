import ExploreMarket from '@/components/home/ExploreMarket';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Search } from 'lucide-react';
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
    listShops(), listSessions(), prisma.product.findMany({ where: { archived: false, stockQty: { gt: 0 } }, select: productCardSelect,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }], take: 4 }),
  ]);
  const shops = shopResult.status === 'fulfilled' ? shopResult.value : [];
  const sessions = sessionResult.status === 'fulfilled' ? sessionResult.value : [];
  const products = productResult.status === 'fulfilled' ? productResult.value : [];
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
    <div className="market-tools">
      <nav aria-label="Marketplace sections"><Link href="/meals">Order food</Link><Link href="/gifts">Send a gift</Link><Link href="/products">Shop products</Link></nav>
      <form action="/search" role="search"><Search aria-hidden="true" size={17} /><input name="q" aria-label="Search the marketplace" placeholder="Search the marketplace" required /><button aria-label="Submit marketplace search"><ArrowUpRight size={18} /></button></form>
    </div>
    <ExploreMarket />
    <div className="market-wrap space-y-8 !py-8">
      {products.length > 0 && <section>
        <div className="section-line"><h2>Shop products</h2><Link href="/products" className="inline-flex items-center gap-1">All products <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
        <ProductGrid products={products.map(serializeProductCardForUi) as Product[]} />
      </section>}
      {sessions.length > 0 && <section>
        <div className="section-line"><h2>Upcoming experiences</h2><Link href="/experiences" className="inline-flex items-center gap-1">All dates <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
        <SessionList sessions={sessions.slice(0, 4)} />
      </section>}
      {shops.length > 0 && <section>
        <div className="section-line"><h2>Shops &amp; hosts</h2><Link href="/shops" className="inline-flex items-center gap-1">View directory <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
        <ShopList shops={shops.slice(0, 4)} />
      </section>}
      {[productResult, shopResult, sessionResult].some(result => result.status === 'rejected') && <p className="text-sm text-muted-foreground">Some marketplace listings are temporarily unavailable.</p>}
      <Link href="/b2b" className="editorial-link">List your business <ArrowUpRight size={16} aria-hidden="true" /></Link>
    </div>
  </div>;
}
