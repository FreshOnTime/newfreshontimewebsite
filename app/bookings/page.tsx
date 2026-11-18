import { marketplaceUser } from '@/lib/marketplaceAccount';
import { listBookings } from '@/lib/experienceBookings';
import { dateLabel, pageNumber, Pagination } from '@/components/marketplace/Listings';
import { cancel } from './actions';
import Link from 'next/link';

export default async function Bookings({searchParams}: {searchParams: Promise<{ page?: string; error?: string }>}) {
  const user = await marketplaceUser('/bookings');
  const params = await searchParams;
  const page = pageNumber(params.page);
  const bookings = await listBookings(user.userId, page);
  return <section className="market-wrap"><h1>My bookings</h1>{params.error && <p role="alert">The booking change could not be completed. Check your reservations below.</p>}
    {!bookings.length && <p>No reservations on this page. <Link href="/experiences" className="editorial-link">Explore experiences</Link></p>}
    {bookings.map(b => <article className="listing-tile" key={b.id}><h3>{b.session.title}</h3><p>{b.session.supplier.name} · {dateLabel(b.session.startsAt)}</p>
      <p>{b.guestName} · {b.seats} places · LKR {b.totalLkr.toLocaleString()} · {b.cancelled ? 'Cancelled' : 'Confirmed'}</p><small>Reference {b.id}</small>
      {!b.cancelled && b.session.startsAt > new Date() && <form action={cancel}><input type="hidden" name="bookingId" value={b.id} /><button className="editorial-link">Cancel reservation</button></form>}</article>)}
    <Pagination path="/bookings" page={page} more={bookings.length === 24} /></section>;
}
