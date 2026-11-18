import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/marketplace';
import { dateLabel } from '@/components/marketplace/Listings';
import ReserveForm from './ReserveForm';

export const dynamic = 'force-dynamic';
export default async function Session({ params, searchParams }: { params: Promise<{id: string}>; searchParams: Promise<{error?: string}> }) {
  const s = await getSession((await params).id);
  if (!s) notFound();
  const available = s.startsAt > new Date() && !s.closed && s.remaining > 0;
  return <article className="market-wrap"><Link className="editorial-link" href={'/shops/' + s.supplier.id}>{s.supplier.name} ↗</Link>
    <h1>{s.title}</h1><p className="whitespace-pre-line">{s.details}</p><h2>{dateLabel(s.startsAt)}</h2>
    <p>Colombo time · LKR {s.priceLkr.toLocaleString()} per guest · Pay at the venue.</p>
    {(await searchParams).error && <p role="alert">Availability changed. Review the remaining places.</p>}
    {available ? <ReserveForm sessionId={s.id} requestId={randomUUID()} remaining={s.remaining} price={s.priceLkr} /> : <p>Booking is closed for this session.</p>}</article>;
}
