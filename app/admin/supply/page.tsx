'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Demand = { id: string; product: string; remaining: string; quantity: string; unit: string; area: string; pickup: string; deadline: string };
type Offer = { id: string; photoUrl: string | null; product: string; unit: string; quantity: string; price: string; area: string; ready: string; phone: string; status: string; terms: string; agreedQty: string | null; agreedPrice: string | null; request: Demand | null };
type Queue = { requests: Demand[]; offers: Offer[]; more: boolean; metrics: { growers: number; repeated: number; hours: number | null } };

function message(offer: Offer) {
  const amount = (offer.agreedQty || offer.quantity) + ' ' + offer.unit + ' of ' + offer.product;
  switch (offer.status) {
    case 'proposed': return 'FreshPick can take ' + amount + ' at LKR ' + offer.agreedPrice + ' per ' + offer.unit + '. ' + offer.terms + ' Please reply to confirm or decline.';
    case 'declined': return 'Thank you for offering ' + offer.product + '. We are passing on this offer. ' + offer.terms;
    case 'confirmed': return 'FreshPick confirms ' + amount + ' at LKR ' + offer.agreedPrice + ' per ' + offer.unit + '. ' + offer.terms;
    case 'handed_over': {
      const params = new URLSearchParams({ product: offer.product, unit: offer.unit, quantity: offer.agreedQty || offer.quantity, price: offer.agreedPrice || offer.price, area: offer.area });
      return 'Can you supply ' + amount + ' again next week? Confirm or change your quantity and ready date here: ' + window.location.origin + '/supply#' + params + ' . Reply skip if you are unavailable.';
    }
    default: return 'FreshPick received your offer of ' + amount + '. When can we discuss pickup?';
  }
}

export default function SupplyQueue() {
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<Queue | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    const response = await authenticatedApiFetch('/api/admin/supply?offset=' + offset, { cache: 'no-store' });
    if (!response.ok) throw Error('Could not load the supply queue.');
    setData(await response.json());
  }, [offset]);
  useEffect(() => { setData(null); setError(''); void load().catch(e => setError(e.message)); }, [load]);
  async function save(method: string, payload: Record<string, unknown>, form?: HTMLFormElement) {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const response = await authenticatedApiFetch('/api/admin/supply', { method, body: JSON.stringify(payload) });
      if (!response.ok) throw Error((await response.json()).error || 'Please retry.');
      form?.reset(); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Please retry.'); }
    finally { setBusy(false); }
  }
  function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save('POST', Object.fromEntries(new FormData(event.currentTarget)), event.currentTarget);
  }
  return <main className="mx-auto max-w-5xl space-y-7 p-5">
    <h1 className="text-3xl font-semibold">Weekly supply</h1>
    {error && <div role="alert">{error} <button className="underline" onClick={() => { setError(''); void load().catch(e => setError(e.message)); }}>Refresh queue</button></div>}
    <form onSubmit={publish} className="grid gap-3 rounded-xl border p-5 sm:grid-cols-3">
      <h2 className="text-xl font-semibold sm:col-span-3">Publish a buying request</h2>
      <label>Product<Input name="product" required /></label><label>Unit<Input name="unit" required placeholder="kg" /></label>
      <label>Quantity needed<Input name="quantity" type="number" min=".01" step=".01" required /></label>
      <label>Grade or quality standard<Input name="grade" required /></label><label>Pickup area<Input name="area" required /></label>
      <label>Offer deadline<Input name="deadline" type="date" required /></label><label>Pickup date<Input name="pickup" type="date" required /></label>
      <Button disabled={busy}>Publish request</Button>
    </form>
    {data && <>
      <section><h2 className="text-xl font-semibold">Pilot results</h2><p>{data.metrics.growers} growers completed a first handover · {data.metrics.repeated} supplied again the following week · {data.metrics.hours == null ? 'No decisions yet' : data.metrics.hours.toFixed(1) + ' hours to first decision on average'}</p></section>
      <section><h2 className="text-xl font-semibold">Upcoming pickups</h2>{data.requests.map(r => <p key={r.id}>{r.pickup} · {r.product} · {r.remaining} of {r.quantity} {r.unit} still needed · {r.area}</p>)}</section>
      <section className="space-y-4"><h2 className="text-xl font-semibold">Grower offers</h2>
        {!data.offers.length && <p>No offers received yet.</p>}
        {data.offers.map(o => <article key={o.id} className="space-y-3 rounded-xl border p-5">
          <h3 className="font-semibold">{o.quantity} {o.unit} of {o.product} · {o.status.replace('_', ' ')}</h3>
          <p>LKR {o.price}/{o.unit} · {o.area} · Ready {o.ready} · {o.phone}</p>
          <p>{o.request ? 'For pickup ' + o.request.pickup + ' in ' + o.request.area : 'Independent harvest offer'}</p>
          {o.photoUrl && <a className="underline" href={o.photoUrl} target="_blank" rel="noreferrer">View supplier photo</a>}
          {o.agreedQty && <p>Proposed quantity {o.agreedQty} {o.unit} at LKR {o.agreedPrice}/{o.unit}</p>}
          {o.terms && <p>{o.terms}</p>}
          {o.status === 'received' && <form className="grid gap-3 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); void save('PATCH', { ...Object.fromEntries(new FormData(e.currentTarget)), id: o.id, action: 'propose' }); }}>
            <label>Quantity to accept<Input name="agreedQty" type="number" min=".01" max={o.quantity} step=".01" defaultValue={o.quantity} required /></label>
            <label>LKR per unit<Input name="agreedPrice" type="number" min=".01" step=".01" defaultValue={o.price} required /></label>
            <label>Packing, pickup and payment terms<Input name="terms" required maxLength={1000} /></label><Button disabled={busy}>Save terms for supplier</Button>
          </form>}
          {['received', 'proposed'].includes(o.status) && <form className="flex flex-wrap items-end gap-2" onSubmit={e => { e.preventDefault(); void save('PATCH', { id: o.id, action: 'decline', terms: new FormData(e.currentTarget).get('reason') }); }}>
            <label>Reason for declining<Input name="reason" maxLength={1000} required /></label><Button variant="outline" disabled={busy}>Decline offer</Button>
          </form>}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => window.open('https://wa.me/' + o.phone.replace(/\D/g, '') + '?text=' + encodeURIComponent(message(o)), '_blank', 'noopener,noreferrer')}>{o.status === 'handed_over' ? 'Invite to supply again' : 'Open WhatsApp draft'}</Button>
            {o.status === 'proposed' && <Button disabled={busy} onClick={() => save('PATCH', { id: o.id, action: 'confirm' })}>Record grower’s confirmation</Button>}
            {o.status === 'confirmed' && <Button disabled={busy} onClick={() => save('PATCH', { id: o.id, action: 'handover' })}>Record completed handover</Button>}
          </div>
        </article>)}
        <Button variant="outline" disabled={!offset || busy} onClick={() => setOffset(offset - 25)}>Previous</Button>{' '}
        <Button variant="outline" disabled={!data.more || busy} onClick={() => setOffset(offset + 25)}>Next</Button>
      </section>
    </>}
  </main>;
}
