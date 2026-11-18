import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { listSessions, listShops } from '@/lib/marketplace';

export const dateLabel = (date: Date) => date.toLocaleString('en-LK', { timeZone: 'Asia/Colombo', dateStyle: 'medium', timeStyle: 'short' });
export const pageNumber = (input?: string) => Math.max(1, Math.min(1000, Number.parseInt(input || '1', 10) || 1));

export function ShopList({ shops }: { shops: Awaited<ReturnType<typeof listShops>> }) {
  return <div className="shop-directory">{shops.map(shop => (
    <Link className="directory-entry" key={shop.id} href={'/shops/' + encodeURIComponent(shop.id)}>
      <h3>{shop.name}</h3>{shop.city && <span>{shop.city}</span>}<ArrowUpRight size={19} aria-hidden="true" />
    </Link>
  ))}</div>;
}

export function SessionList({ sessions }: { sessions: Awaited<ReturnType<typeof listSessions>> }) {
  return <div className="listing-grid">{sessions.map(s => <Link className="listing-tile" key={s.id} href={'/sessions/' + s.id}>
    <span>{s.occasion} · {s.supplier.name}</span><h3>{s.title}</h3><p>{dateLabel(s.startsAt)} · {s.remaining} places</p>
    <strong>LKR {s.priceLkr.toLocaleString()} per guest <ArrowUpRight size={16} aria-hidden="true" /></strong>
  </Link>)}</div>;
}

export function Pagination({ path, page, more }: { path: string; page: number; more: boolean }) {
  const href = (n: number) => path + (path.includes('?') ? '&' : '?') + 'page=' + n;
  return <nav aria-label="Listing pages" className="mt-5 flex gap-4">
    {page > 1 && <Link className="editorial-link" href={href(page - 1)}>Previous page</Link>}
    {more && <Link className="editorial-link" href={href(page + 1)}>Next page</Link>}
  </nav>;
}
