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
    <section className="discovery-hero"><div className="editorial-wrap grid items-center gap-8 py-12 md:grid-cols-[1fr_.9fr] md:py-20">
      <div><p className="city-mark">Colombo, Sri Lanka</p>
        <h1>Discover your<br /><em>local favourites.</em></h1>
        <p>Shop independent makers, find food gifts and book time with local hosts.</p>
        <form className="market-search" action="/search"><Search aria-hidden="true" size={20} /><input name="q" aria-label="Search the marketplace" placeholder="Search shops, products and experiences" required /><button>Search</button></form>
        <nav aria-label="Browse marketplace" className="flex flex-wrap gap-x-5 gap-y-2">{[['Shops & hosts','/shops'],['Experiences','/experiences'],['Gifts','/gifts']].map(([name,href]) => <Link key={href} href={href}>{name} ↗</Link>)}</nav>
      </div>
      <div className="hero-mosaic"><Image src="/images/experiences/table.webp" alt="Flowers and glassware at a dinner table" fill priority sizes="(max-width: 767px) 90vw, 45vw" />
        <Link href="/experiences">Explore dining & experiences <ArrowUpRight size={20} /></Link>
      </div></div></section>
    <div className="market-wrap">
      <div className="section-line"><h2>Shops & hosts</h2><Link href="/shops">View directory ↗</Link></div>
      {shopResult.status === 'rejected' ? <p>Shop listings are temporarily unavailable.</p> : shops.length ? <ShopList shops={shops.slice(0, 4)} /> : <p>Partner shops appear here when their first listing is available. <Link className="editorial-link" href="/b2b">List your business</Link></p>}
      <div className="section-line"><h2>Shop products</h2><Link href="/products">All products ↗</Link></div>
      {productResult.status === 'rejected' ? <p>The product catalogue is temporarily unavailable.</p> : products.length ? <ProductGrid products={products.map(serializeProductCardForUi) as Product[]} /> : <Link className="editorial-link" href="/meals">Browse food categories</Link>}
      <div className="section-line"><h2>Upcoming experiences</h2><Link href="/experiences">Explore occasions ↗</Link></div>
      {sessionResult.status === 'rejected' ? <p>The experience calendar is temporarily unavailable.</p> : sessions.length ? <SessionList sessions={sessions.slice(0, 4)} /> : <p>Browse occasion ideas while hosts prepare their next dates.</p>}
      <nav className="mt-10 flex flex-wrap gap-5" aria-label="Food and gifting"><Link className="editorial-link" href="/gifts">Send a gift</Link><Link className="editorial-link" href="/meals">Order food</Link><Link className="editorial-link" href="/market">Grocery market</Link></nav>
    </div>
  </div>;
}
