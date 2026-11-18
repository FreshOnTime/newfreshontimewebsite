import { hostShop } from '@/lib/marketplaceAccount';
import prisma from '@/lib/prisma';
import { occasions } from '@/lib/experiences';
import { dateLabel, Pagination, pageNumber } from '@/components/marketplace/Listings';
import { publishSession, closeSession } from './actions';

export default async function HostSessions({searchParams}: {searchParams: Promise<{ error?: string; published?: string; page?: string }>}) {
  const shop = await hostShop();
  if (!shop) return <section className="market-wrap"><h1>Host sessions</h1><p>An approved supplier account is required.</p></section>;
  const params = await searchParams;
  const page = pageNumber(params.page);
  const sessions = await prisma.experienceSession.findMany({ where: { supplierId: shop.id, startsAt: { gt: new Date() } }, orderBy: [{startsAt:'asc'}, {id:'asc'}], take:24, skip:(page-1)*24,
    include: { bookings: { where: { cancelled: false }, select: { id:true, guestName:true, seats:true } } } });
  return <section className="market-wrap"><h1>Host sessions</h1><p>Publish places for {shop.name}. Customers pay at the venue.</p>
    {params.error && <p role="alert">{params.error === 'duplicate' ? 'A session with this title and start time already exists.' : 'Check the details and choose a future start time.'}</p>}
    {params.published && <p role="status">Session published.</p>}
    <form className="market-form" action={publishSession}>
      <label>Experience title<input name="title" minLength={3} maxLength={120} required /></label>
      <label>Location, inclusions and duration<textarea name="details" minLength={10} maxLength={2000} required /></label>
      <label>Occasion<select name="occasion">{occasions.map(o => <option key={o}>{o}</option>)}</select></label>
      <label>Starts at (Colombo time)<input name="startsAt" type="datetime-local" required /></label>
      <label>Price per guest (LKR)<input name="priceLkr" type="number" min="0" max="1000000" required /></label>
      <label>Available places<input name="capacity" type="number" min="1" max="1000" required /></label>
      <button className="editorial-button">Publish session</button>
    </form><h2>Upcoming sessions</h2>{sessions.map(s => <article key={s.id} className="listing-tile"><h3>{s.title}</h3><p>{dateLabel(s.startsAt)} · {s.remaining} places left · {s.closed ? 'Closed' : 'Open'}</p>
      {s.bookings.map(b => <p key={b.id}>{b.guestName} · {b.seats} places · {b.id}</p>)}
      {!s.closed && <form action={closeSession}><input type="hidden" name="id" value={s.id} /><button className="editorial-link">Close to new bookings</button></form>}</article>)}
    <Pagination page={page} path="/dashboard/sessions" more={sessions.length === 24} /></section>;
}
