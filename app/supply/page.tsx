'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Demand = { id: string; product: string; remaining: string; unit: string; pickup: string; grade: string; area: string; deadline: string };
export default function SupplyPage() {
  const [requests, setRequests] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState<Demand | null>(null);
  const [open, setOpen] = useState(false);
  const [repeat, setRepeat] = useState({ product: '', unit: '', quantity: '', price: '', area: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const retry = useRef({ body: '', key: '' });
  const form = useRef<HTMLFormElement>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/supply', { cache: 'no-store' });
      if (!response.ok) throw Error();
      setRequests((await response.json()).requests);
      setLoadError(false);
    } catch { setLoadError(true); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    void load();
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (params.get('product')) {
      setRepeat({ product: params.get('product') || '', unit: params.get('unit') || '', quantity: params.get('quantity') || '', price: params.get('price') || '', area: params.get('area') || '' });
      setOpen(true);
    }
  }, [load]);

  function choose(demand: Demand | null) {
    setSelected(demand); setOpen(true); setError('');
    requestAnimationFrame(() => form.current?.scrollIntoView({ block: 'start' }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError('');
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget));
      if (!values.photoUrl) delete values.photoUrl;
      const body = JSON.stringify({ ...values, requestId: selected?.id });
      if (retry.current.body !== body) retry.current = { body, key: crypto.randomUUID() };
      const response = await fetch('/api/supply', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, requestId: selected?.id, submissionId: retry.current.key }) });
      if (!response.ok) {
        if (response.status === 409) void load();
        throw Error((await response.json()).error || 'Please retry.');
      }
      setDone(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Please retry.'); }
    finally { setBusy(false); }
  }

  if (done) return <main className="mx-auto max-w-xl px-5 py-16"><h1 className="text-3xl font-semibold">Offer received</h1><p className="my-5">FreshPick will contact you at the number you provided. Wait for both sides to agree on quantity, price, packing, pickup and payment before preparing your produce. You can share a produce photo when the team contacts you.</p><Link className="underline" href="/">Back to FreshPick</Link></main>;
  return <main className="mx-auto max-w-3xl space-y-8 px-5 py-12">
    <header><h1 className="text-4xl font-semibold text-brand-green">What can you supply this week?</h1><p className="mt-3">Offer part of a request or tell us what you have ready for pickup.</p></header>
    <section className="space-y-3"><h2 className="text-xl font-semibold">Open buying requests</h2>
      {loading ? <p role="status">Loading requests…</p> : loadError ? <p role="alert">Couldn’t load the requests. <button className="underline" onClick={load}>Retry</button></p> : !requests.length && <p>No open requests today. You can still offer your harvest below.</p>}
      {requests.map(d => <article key={d.id} className="rounded-xl border p-5"><h3 className="text-lg font-semibold">{d.product} · {d.remaining} {d.unit} needed</h3><p>{d.grade}</p><p className="my-2 text-sm">{d.area} · Pickup {d.pickup} · Offers close {d.deadline}</p><Button onClick={() => choose(d)}>I can supply this</Button></article>)}
      <Button variant="outline" onClick={() => choose(null)}>Offer something else</Button>
    </section>
    {open && <form key={selected?.id || 'harvest'} ref={form} onSubmit={submit} className="grid gap-4 rounded-xl border p-5 sm:grid-cols-2">
      <h2 className="text-xl font-semibold sm:col-span-2">{selected ? 'Offer ' + selected.product : 'Offer your harvest'}</h2>
      <label>Product<Input name="product" required maxLength={140} readOnly={!!selected} defaultValue={selected?.product || repeat.product} /></label>
      <label>Unit (kg, bundles, boxes)<Input name="unit" required maxLength={140} readOnly={!!selected} defaultValue={selected?.unit || repeat.unit} /></label>
      <label>Available quantity<Input name="quantity" type="number" min="0.01" step="0.01" max={selected?.remaining} defaultValue={selected ? '' : repeat.quantity} required /></label>
      <label>Asking price per unit (LKR)<Input name="price" type="number" min="0.01" step="0.01" defaultValue={selected ? '' : repeat.price} required /></label>
      <label>Pickup area<Input name="area" maxLength={140} defaultValue={repeat.area} required /></label>
      <label>Ready date<Input name="ready" type="date" max={selected?.pickup} required /></label>
      <label>Produce photo link (optional)<Input name="photoUrl" type="url" placeholder="https://" /></label>
      <label>Contact number<Input name="phone" autoComplete="tel" type="tel" placeholder="0771234567" required /></label>
      <p className="text-sm self-center">FreshPick may call or message you about this offer.</p>
      {error && <p role="alert" className="sm:col-span-2">{error}</p>}
      <Button disabled={busy}>{busy ? 'Sending…' : 'Send offer'}</Button>
    </form>}
    <Link className="inline-block underline" href="/auth/signup/supplier?catalogue=1">Apply with a full supplier catalogue</Link>
  </main>;
}
