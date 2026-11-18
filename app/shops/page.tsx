import Link from 'next/link';
import { listShops } from '@/lib/marketplace';
import { ShopList, Pagination, pageNumber } from '@/components/marketplace/Listings';
import { publicPageMetadata } from '@/lib/publicPages';

export const metadata = publicPageMetadata('/shops');
export default async function Shops({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const { page: raw, q = '' } = await searchParams;
  const page = pageNumber(raw);
  const shops = await listShops(page, q.slice(0, 120));
  return <section className="market-wrap"><h1>Shops & hosts</h1><p>Discover the people behind the products and experiences.</p>
    <form className="market-search" action="/shops"><input aria-label="Shop or host name" name="q" defaultValue={q} placeholder="Search by shop or host name" maxLength={120} /><button>Search</button></form>
    <ShopList shops={shops} />{!shops.length && <p>No matching shops with published listings. <Link className="editorial-link" href="/b2b">Become a partner</Link></p>}
    <Pagination path={'/shops?q=' + encodeURIComponent(q)} page={page} more={shops.length === 24} /></section>;
}
