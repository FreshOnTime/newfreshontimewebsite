import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getShop } from '@/lib/marketplace';
import { pageNumber, Pagination, SessionList } from '@/components/marketplace/Listings';
import ProductGrid from '@/components/products/ProductGrid';
import type { Product } from '@/models/product';

export default async function Shop({ params, searchParams }: { params: Promise<{id: string}>; searchParams: Promise<{ page?: string }> }) {
  const { id } = await params;
  const page = pageNumber((await searchParams).page);
  const shop = await getShop(id, page);
  if (!shop) notFound();
  return <article className="market-wrap"><Link className="editorial-link" href="/shops">← Shops & hosts</Link>
    <h1>{shop.name}</h1><p>{shop.city}</p><h2>Book an experience</h2>
    {shop.sessions.length ? <SessionList sessions={shop.sessions} /> : <p>No upcoming sessions on this page.</p>}
    <h2>Shop products</h2>{shop.products.length ? <ProductGrid products={shop.products as Product[]} /> : <p>No products on this page.</p>}
    <Pagination path={'/shops/' + id} page={page} more={shop.sessions.length === 24 || shop.products.length === 24} /></article>;
}
