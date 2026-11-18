'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';

type RequestRow = {
  id: string; status: string; items: { productId: string; sku: string; name: string; qty: number }[];
  createdAt: string; settledAt: string | null; settlementAmount: string | null; settlementReference: string | null;
  order: { orderNumber: string; status: string; estimatedDelivery: string | null };
  supplier?: { name: string; phone: string; status: string; applicationStatus: string };
};
const date = (value: string) => new Intl.DateTimeFormat('en-LK', { dateStyle: 'medium', timeZone: 'Asia/Colombo' }).format(new Date(value));
const closed = (status: string) => ['cancelled', 'refunded', 'delivered', 'shipped'].includes(status);
function whatsapp(row: RequestRow) {
  const digits = (row.supplier?.phone || '').replace(/\D/g, '');
  const phone = digits.startsWith('0') ? `94${digits.slice(1)}` : digits;
  if (!/^\d{8,15}$/.test(phone)) return null;
  const message = `FreshPick supply request ${row.order.orderNumber}\n${row.items.map(i => `${i.name} (${i.sku}) × ${i.qty}`).join('\n')}\nPlease confirm availability in your partner workspace: https://freshpick.lk/dashboard?section=orders`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export default function SupplierOrders({ admin = false }: { admin?: boolean }) {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const endpoint = admin ? '/api/admin/supplier-orders' : '/api/suppliers/orders';
  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await authenticatedApiFetch(`${endpoint}?page=${page}`, { cache: 'no-store', signal });
      const data = await res.json();
      if (!res.ok) throw Error(data.error || 'Could not load requests.');
      if (signal?.aborted) return;
      setRows(data.requests); setHasNext(data.hasNext); setError('');
    } catch (e) { if (!signal?.aborted) setError(e instanceof Error ? e.message : 'Could not load requests.'); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [endpoint, page]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); void load(controller.signal);
    const timer = setInterval(() => { if (document.visibilityState === 'visible') void load(controller.signal); }, 30000);
    return () => { clearInterval(timer); controller.abort(); };
  }, [load]);
  async function act(id: string, action: string, extra?: { amount: number; reference: string }) {
    if (busy) return;
    setBusy(id); setError('');
    try {
      const res = await authenticatedApiFetch(endpoint, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action, ...extra }) });
      const data = await res.json();
      if (!res.ok) throw Error(data.error || 'Could not update this request.');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not update this request.'); }
    finally { setBusy(null); }
  }

  return <section className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold text-brand-green">Supply requests</h2><p className="mt-1 text-sm text-muted-foreground">{admin ? 'Coordinate availability, collection and recorded supplier payments.' : 'Confirm availability and mark your products ready for FreshPick collection.'}</p></div><Button variant="outline" onClick={() => void load()} disabled={loading || !!busy}>Refresh</Button></div>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {loading ? <p role="status">Loading requests…</p> : rows.length === 0 ? <p className="rounded-lg border p-6 text-muted-foreground">No supply requests on this page yet.</p> : rows.map(row => {
      const isClosed = closed(row.order.status);
      const wa = admin && !isClosed ? whatsapp(row) : null;
      return <article key={row.id} className="space-y-4 rounded-xl border bg-background p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{row.order.orderNumber}</h3><p className="text-sm text-muted-foreground">{date(row.createdAt)}{row.supplier ? ` · ${row.supplier.name}` : ''}</p>{row.order.estimatedDelivery && <p className="text-sm text-muted-foreground">Customer delivery: {date(row.order.estimatedDelivery)} · Confirm collection separately.</p>}</div><div className="flex flex-wrap gap-2"><span className="rounded-full border px-3 py-1 text-xs font-semibold capitalize">{row.status}</span>{isClosed && <span className="rounded-full border px-3 py-1 text-xs capitalize">Order {row.order.status}</span>}</div></div>
        {row.supplier && (row.supplier.status !== 'active' || row.supplier.applicationStatus !== 'approved') && <p className="text-sm text-amber-700">Supplier is not active and approved. Contact the team before fulfilling.</p>}
        <ul className="divide-y rounded-lg border px-4">{row.items.map(item => <li key={item.productId} className="flex justify-between gap-3 py-3 text-sm"><span>{item.name} <span className="text-muted-foreground">({item.sku})</span></span><span className="font-semibold">× {item.qty}</span></li>)}</ul>
        {row.settledAt ? <p className="text-sm text-brand-green">Payment recorded: LKR {Number(row.settlementAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })} · {date(row.settledAt)} · {row.settlementReference}</p> : row.status === 'collected' && <p className="text-sm text-muted-foreground">Collected · Settlement not recorded yet</p>}
        <div className="flex flex-wrap gap-2">
          {!isClosed && row.status === 'pending' && <Button disabled={!!busy} onClick={() => void act(row.id, 'accept')}>{admin ? 'Record supplier acceptance' : 'Accept request'}</Button>}
          {!isClosed && ['pending','accepted'].includes(row.status) && <Button variant="outline" disabled={!!busy} onClick={() => void act(row.id, 'unavailable')}>{admin ? 'Record unavailable' : 'Report unavailable'}</Button>}
          {!isClosed && row.status === 'accepted' && <Button disabled={!!busy} onClick={() => void act(row.id, 'ready')}>{admin ? 'Record ready for collection' : 'Mark ready for collection'}</Button>}
          {admin && !isClosed && row.status === 'ready' && <Button disabled={!!busy} onClick={() => void act(row.id, 'collect')}>Record collection</Button>}
          {wa && <a className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-semibold" href={wa} target="_blank" rel="noopener noreferrer">Open WhatsApp draft</a>}
        </div>
        {admin && row.status === 'collected' && !row.settledAt && <form className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2" onSubmit={event => { event.preventDefault(); const fields = new FormData(event.currentTarget); void act(row.id, 'settle', { amount: Number(fields.get('amount')), reference: String(fields.get('reference')) }); }}><label className="text-sm">Amount paid (LKR)<Input name="amount" type="number" min="0.01" step="0.01" max="9999999999.99" required /></label><label className="text-sm">Payment reference<Input name="reference" maxLength={200} required /></label><p className="text-xs text-muted-foreground sm:col-span-2">Record a completed external payment only. This does not transfer money.</p><Button type="submit" disabled={!!busy}>Record settlement</Button></form>}
      </article>;
    })}
    <div className="flex items-center gap-3"><Button variant="outline" disabled={page === 1 || loading || !!busy} onClick={() => setPage(p => p-1)}>Previous</Button><span className="text-sm">Page {page}</span><Button variant="outline" disabled={!hasNext || loading || !!busy} onClick={() => setPage(p => p+1)}>Next</Button></div>
  </section>;
}
