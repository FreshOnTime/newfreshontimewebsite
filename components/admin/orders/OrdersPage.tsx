'use client';

import { useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MoreHorizontal, Eye, Trash2, Plus, ChevronDown, PackageOpen, AlertCircle, RefreshCw, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OrderDialog } from '@/components/admin/orders/OrderDialog';
import { CreateOrderDialog } from '@/components/admin/orders/CreateOrderDialog';
import { toast } from 'sonner';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';

interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  shippingAddress?: {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
  };
  total: number;
  status: 'pending'|'confirmed'|'processing'|'shipped'|'delivered'|'cancelled'|'refunded';
  paymentStatus: 'pending'|'paid'|'failed'|'refunded';
  createdAt: string;
  isRecurring?: boolean;
  scheduleStatus?: 'active'|'paused'|'ended';
  nextDeliveryAt?: string;
}

interface OrdersResponse { orders: Order[]; pagination: { page: number; limit: number; total: number; pages: number } }

const selectStyle = 'h-12 w-full appearance-none rounded-xl border border-brand-green/15 bg-white px-3.5 pr-9 text-sm font-medium text-foreground shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green';
const pillStyles: Record<Order['status'] | Order['paymentStatus'], string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-900',
  confirmed: 'border-sky-200 bg-sky-50 text-sky-900',
  processing: 'border-indigo-200 bg-indigo-50 text-indigo-900',
  shipped: 'border-blue-200 bg-blue-50 text-blue-900',
  delivered: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  cancelled: 'border-slate-200 bg-slate-100 text-slate-700',
  refunded: 'border-violet-200 bg-violet-50 text-violet-900',
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  failed: 'border-rose-200 bg-rose-50 text-rose-900',
};
const scheduleStyles: Record<'active' | 'paused' | 'ended', string> = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  paused: 'border-amber-200 bg-amber-50 text-amber-900',
  ended: 'border-slate-200 bg-slate-100 text-slate-700',
};
function StatusTag({ status, schedule = false }: { status: Order['status'] | Order['paymentStatus'] | 'active' | 'paused' | 'ended'; schedule?: boolean }) {
  const colors = schedule
    ? scheduleStyles[status as 'active' | 'paused' | 'ended']
    : pillStyles[status as Order['status'] | Order['paymentStatus']];
  return <span className={'inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ' + colors}>{status}</span>;
}
function shortDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Colombo' }).format(date)
    : '—';
}
function OrderSchedule({ order }: { order: Order }) {
  if (!order.isRecurring) return <span className="text-sm text-muted-foreground">One-time</span>;
  return <div className="flex flex-col items-start gap-1.5">
    <StatusTag status={order.scheduleStatus || 'active'} schedule />
    {order.nextDeliveryAt && <span className="text-xs text-muted-foreground">Next: {shortDate(order.nextDeliveryAt)}</span>}
  </div>;
}
function OrderMenu({ number, onView, onDelete }: { number: string; onView: () => void; onDelete: () => void }) {
  return <DropdownMenu>
    <DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-xl" aria-label={'Actions for order ' + number}><MoreHorizontal className="h-5 w-5" aria-hidden="true" /></Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5">
      <DropdownMenuItem className="min-h-10 cursor-pointer rounded-lg" onSelect={onView}><Eye className="mr-2 h-4 w-4" aria-hidden="true" />View details</DropdownMenuItem>
      <DropdownMenuItem className="min-h-10 cursor-pointer rounded-lg text-rose-700 focus:text-rose-700" onSelect={onDelete}><Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />Delete order</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (next: string) => void; options: ReadonlyArray<{ value: string; label: string }> }) {
  return <label className="block min-w-0">
    <span className="mb-2 block text-xs font-semibold text-foreground/75">{label}</span>
    <span className="relative block">
      <select className={selectStyle} value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-green" aria-hidden="true" />
    </span>
  </label>;
}

export function OrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const latestRequest = useRef(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [isRecurring, setIsRecurring] = useState<'all'|'true'|'false'>('all');
  const [schedStatus, setSchedStatus] = useState<'all'|'active'|'paused'|'ended'>('all');
  const [sort, setSort] = useState<'created-desc'|'created-asc'|'next-asc'|'next-desc'>('created-desc');
  const [selected, setSelected] = useState<Order | null>(null);
  const [open, setOpen] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [customerId, setCustomerId] = useState<string | ''>('');
  const searchParams = useSearchParams();
  const router = useRouter();

  const fetchItems = async () => {
    const request = ++latestRequest.current;
    try {
      setLoading(true);
      setError(false);
  const params = new URLSearchParams({ page: String(page), limit: '20', ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }), ...(isRecurring !== 'all' && { isRecurring }), ...(schedStatus !== 'all' && { scheduleStatus: schedStatus }), ...(sort && { sort }), ...(customerId ? { customerId } : {}) });
      const res = await authenticatedApiFetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data: OrdersResponse = await res.json();
      if (request !== latestRequest.current) return;
      setItems(data.orders);
      setPagination(data.pagination);
    } catch {
      if (request === latestRequest.current) setError(true);
    } finally {
      if (request === latestRequest.current) setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize customerId from URL once
    setSearch(searchParams.get('search') || '');
    const cid = searchParams.get('customerId');
    if (cid && !customerId) setCustomerId(cid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => { fetchItems(); }, [page, debouncedSearch, isRecurring, schedStatus, sort, customerId, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const view = (o: Order) => { setSelected(o); setOpen(true); };
  const saved = () => { setOpen(false); setSelected(null); fetchItems(); };
  const create = () => { setSelected(null); setOpenCreate(true); };

  const remove = async (id: string) => {
    if (!confirm('Delete this order? This cannot be undone.')) return;
    try {
      const res = await authenticatedApiFetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Order deleted');
      if (page > 1 && items.length === 1) setPage(page - 1);
      else fetchItems();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const currency = (v: number) => 'Rs. ' + new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  const filtersActive = !!(debouncedSearch.trim() || isRecurring !== 'all' || schedStatus !== 'all' || customerId);
  const clearFilters = () => { setSearch(''); setPage(1); setIsRecurring('all'); setSchedStatus('all'); setSort('created-desc'); setCustomerId(''); router.replace('/admin/orders'); };
  const reload = () => setRefreshKey((value) => value + 1);

  return (
    <div className="mx-auto max-w-[1520px] space-y-7 pb-12 sm:space-y-8">
      <header className="flex flex-col gap-5 border-b border-brand-green/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-[clamp(2.35rem,3.6vw,3.45rem)] font-semibold leading-[1.08] tracking-[-.05em] text-brand-green-deep">Orders</h1>
          <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">Review purchases, track fulfilment and manage recurring deliveries.</p>
        </div>
        <Button type="button" onClick={create} className="h-12 w-full shrink-0 rounded-xl bg-brand-green-deep px-6 text-sm font-semibold text-white hover:bg-brand-green sm:w-auto">
          <Plus className="mr-1 h-4 w-4" aria-hidden="true" /> New order
        </Button>
      </header>

      <section aria-labelledby="orders-list-title" className="min-w-0 overflow-hidden rounded-[1.5rem] border border-brand-green/10 bg-white/95 shadow-[0_16px_55px_-36px_rgba(16,46,30,.24)]">
        <div className="border-b border-brand-green/10 px-5 py-6 sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 id="orders-list-title" className="font-heading text-xl font-semibold tracking-[-.035em] text-brand-green-deep sm:text-2xl">Order management</h2>
              <p className="mt-1 text-sm text-muted-foreground">Find and manage customer orders in one place.</p>
            </div>
            {!loading && !error && <span role="status" aria-live="polite" className="rounded-full border border-brand-green/15 bg-brand-cream px-3 py-1.5 text-xs font-semibold text-brand-green">{pagination.total.toLocaleString('en-LK')} {pagination.total === 1 ? 'order' : 'orders'}</span>}
          </div>

          {customerId && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-green/15 bg-brand-cream px-4 py-3 text-sm">
              <p className="min-w-0 break-all text-brand-green">Customer filter: <span className="font-mono font-semibold">{customerId}</span></p>
              <button type="button" onClick={() => { setCustomerId(''); router.replace('/admin/orders'); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 font-semibold text-brand-green hover:bg-brand-green/10"><X className="h-4 w-4" aria-hidden="true" /> Remove</button>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.6fr)_minmax(140px,.85fr)_minmax(150px,.95fr)_minmax(140px,.85fr)]">
            <label className="block min-w-0">
              <span className="mb-2 block text-xs font-semibold text-foreground/75">Search orders</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-green" aria-hidden="true" />
                <Input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search by order number" className="h-12 w-full rounded-xl border-brand-green/15 bg-white pl-11 shadow-sm" />
              </span>
            </label>
            <FilterSelect label="Order type" value={isRecurring} onChange={(value) => { setIsRecurring(value as 'all' | 'true' | 'false'); setPage(1); }} options={[
              { value: 'all', label: 'All orders' }, { value: 'true', label: 'Recurring' }, { value: 'false', label: 'One-time' },
            ]} />
            <FilterSelect label="Schedule" value={schedStatus} onChange={(value) => { setSchedStatus(value as 'all' | 'active' | 'paused' | 'ended'); setPage(1); }} options={[
              { value: 'all', label: 'Any schedule' }, { value: 'active', label: 'Active' }, { value: 'paused', label: 'Paused' }, { value: 'ended', label: 'Ended' },
            ]} />
            <FilterSelect label="Sort by" value={sort} onChange={(value) => { setSort(value as 'created-desc' | 'created-asc' | 'next-asc' | 'next-desc'); setPage(1); }} options={[
              { value: 'created-desc', label: 'Newest first' }, { value: 'created-asc', label: 'Oldest first' },
              { value: 'next-asc', label: 'Next delivery ↑' }, { value: 'next-desc', label: 'Next delivery ↓' },
            ]} />
          </div>
          {filtersActive && <div className="mt-4 flex justify-end"><button type="button" onClick={clearFilters} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-brand-green hover:bg-brand-cream"><X className="h-4 w-4" aria-hidden="true" /> Clear filters</button></div>}
        </div>

        {loading ? (
          <div role="status" aria-label="Loading orders" className="space-y-3 px-5 py-9 sm:px-7">
            {Array.from({ length: 3 }, (_, index) => <div key={index} className="flex items-center gap-5 rounded-xl border border-brand-green/10 p-4"><div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-secondary motion-reduce:animate-none" /><div className="h-4 w-32 animate-pulse rounded-lg bg-secondary motion-reduce:animate-none" /><div className="ml-auto h-4 w-20 animate-pulse rounded-lg bg-secondary motion-reduce:animate-none" /></div>)}
            <p className="sr-only">Loading orders</p>
          </div>
        ) : error ? (
          <div role="alert" className="flex flex-col items-center px-6 py-14 text-center sm:py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-700"><AlertCircle className="h-8 w-8" aria-hidden="true" /></div>
            <h3 className="mt-5 font-heading text-2xl font-semibold text-brand-green-deep">We couldn’t load the orders.</h3>
            <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">Check your connection and try again. No order data has been changed.</p>
            <Button type="button" variant="outline" className="mt-6 rounded-xl" onClick={reload}><RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" /> Try again</Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center sm:py-20">
            <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-brand-green/10 bg-brand-cream text-brand-green"><PackageOpen className="h-9 w-9" strokeWidth={1.5} aria-hidden="true" /></div>
            <h3 className="mt-6 font-heading text-2xl font-semibold tracking-[-.035em] text-brand-green-deep sm:text-3xl">{filtersActive ? 'No matching orders' : 'No orders yet'}</h3>
            <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">{filtersActive ? 'Try changing the search or filters to find what you need.' : 'Customer orders will appear here once they are placed. You can also create an order manually.'}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {filtersActive ? <Button type="button" variant="outline" onClick={clearFilters} className="h-11 rounded-xl">Clear filters</Button>
                : <Button type="button" onClick={create} className="h-11 rounded-xl bg-brand-green-deep text-white hover:bg-brand-green"><Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Create an order</Button>}
            </div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-brand-green/10 xl:hidden">
              {items.map((order) => (
                <article key={order._id} className="px-5 py-5 sm:px-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <button type="button" onClick={() => view(order)} className="text-left text-base font-semibold text-brand-green-deep underline-offset-4 hover:underline">{order.orderNumber}</button>
                      <p className="mt-1 truncate text-sm text-muted-foreground">{order.customerName || order.customerId}</p>
                    </div>
                    <OrderMenu number={order.orderNumber} onView={() => view(order)} onDelete={() => void remove(order._id)} />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-lg font-semibold tabular-nums text-brand-green-deep">{currency(order.total)}</p>
                    <StatusTag status={order.status} />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 border-t border-brand-green/10 pt-4 text-sm">
                    <div><dt className="text-xs text-muted-foreground">Payment</dt><dd className="mt-1"><StatusTag status={order.paymentStatus} /></dd></div>
                    <div><dt className="text-xs text-muted-foreground">Schedule</dt><dd className="mt-1"><OrderSchedule order={order} /></dd></div>
                    <div><dt className="text-xs text-muted-foreground">Placed</dt><dd className="mt-1 text-foreground">{shortDate(order.createdAt)}</dd></div>
                    <div className="min-w-0"><dt className="text-xs text-muted-foreground">Shipping</dt><dd className="mt-1 truncate text-foreground">{order.shippingAddress?.city || order.shippingAddress?.street || '—'}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
            <div className="hidden min-w-0 xl:block">
              <Table className="min-w-[1030px]">
                <TableHeader className="bg-brand-cream/70">
                  <TableRow className="border-b border-brand-green/10 hover:bg-transparent">
                    {['Order', 'Customer / shipping', 'Total', 'Order status', 'Payment', 'Schedule', 'Placed'].map((label) => <TableHead key={label} className="h-12 whitespace-nowrap px-5 text-xs font-semibold text-foreground/65">{label}</TableHead>)}
                    <TableHead className="w-14 px-4"><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((order) => (
                    <TableRow key={order._id} className="border-brand-green/10 hover:bg-brand-cream/45">
                      <TableCell className="px-5 py-5"><button type="button" onClick={() => view(order)} className="whitespace-nowrap text-sm font-semibold text-brand-green-deep underline-offset-4 hover:underline">{order.orderNumber}</button></TableCell>
                      <TableCell className="max-w-[230px] px-5 py-5"><div className="truncate text-sm font-medium text-foreground">{order.customerName || order.customerId}</div><div className="mt-1 truncate text-xs text-muted-foreground">{[order.shippingAddress?.name, order.shippingAddress?.city || order.shippingAddress?.street].filter(Boolean).join(' · ') || 'No shipping address'}</div></TableCell>
                      <TableCell className="whitespace-nowrap px-5 py-5 text-sm font-semibold tabular-nums text-brand-green-deep">{currency(order.total)}</TableCell>
                      <TableCell className="px-5 py-5"><StatusTag status={order.status} /></TableCell>
                      <TableCell className="px-5 py-5"><StatusTag status={order.paymentStatus} /></TableCell>
                      <TableCell className="px-5 py-5"><OrderSchedule order={order} /></TableCell>
                      <TableCell className="whitespace-nowrap px-5 py-5 text-sm text-foreground/75">{shortDate(order.createdAt)}</TableCell>
                      <TableCell className="px-4 py-5"><OrderMenu number={order.orderNumber} onView={() => view(order)} onDelete={() => void remove(order._id)} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-col gap-4 border-t border-brand-green/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <p className="text-sm text-muted-foreground">Showing <span className="font-semibold text-foreground">{((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-foreground">{pagination.total}</span> orders</p>
              {pagination.pages > 1 && <nav aria-label="Order pagination" className="flex items-center gap-3">
                <Button type="button" variant="outline" size="sm" className="h-10 rounded-xl" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}><ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" /> Previous</Button>
                <span className="text-sm font-medium tabular-nums text-brand-green-deep" aria-live="polite">{page} / {pagination.pages}</span>
                <Button type="button" variant="outline" size="sm" className="h-10 rounded-xl" onClick={() => setPage((current) => Math.min(pagination.pages, current + 1))} disabled={page >= pagination.pages}>Next <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" /></Button>
              </nav>}
            </div>
          </>
        )}
      </section>

      <OrderDialog open={open} onOpenChange={setOpen} order={selected} onSave={saved} />
      <CreateOrderDialog open={openCreate} onOpenChange={setOpenCreate} onSaved={() => { setOpenCreate(false); reload(); }} />
    </div>
  );
}
