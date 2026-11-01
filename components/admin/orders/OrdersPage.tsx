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
      fetchItems();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const currency = (v: number) => 'Rs. ' + new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  const filtersActive = !!(debouncedSearch.trim() || isRecurring !== 'all' || schedStatus !== 'all' || customerId);
  const clearFilters = () => { setSearch(''); setPage(1); setIsRecurring('all'); setSchedStatus('all'); setSort('created-desc'); setCustomerId(''); router.replace('/admin/orders'); };
  const reload = () => setRefreshKey((value) => value + 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-normal text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-2">Review and manage orders</p>
        </div>
  <Button onClick={create}>
          <Plus className="h-4 w-4 mr-1" /> New Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Recent orders</CardDescription>
        </CardHeader>
        <CardContent>
          {customerId && (
            <div className="flex items-center justify-between bg-secondary border border-border text-brand-green rounded-md px-3 py-2 mb-3 text-sm">
              <div>
                Filtering by customer ID: <span className="font-mono">{customerId}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setCustomerId(''); router.push('/admin/orders'); }}>Clear</Button>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search by order number..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
            </div>
            <select className="border rounded px-2 py-1" value={isRecurring} onChange={(e) => { setIsRecurring(e.target.value as 'all'|'true'|'false'); setPage(1); }}>
              <option value="all">All</option>
              <option value="true">Recurring</option>
              <option value="false">One-time</option>
            </select>
            <select className="border rounded px-2 py-1" value={schedStatus} onChange={(e) => { setSchedStatus(e.target.value as 'all'|'active'|'paused'|'ended'); setPage(1); }}>
              <option value="all">Any schedule</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="ended">Ended</option>
            </select>
            <select className="border rounded px-2 py-1" value={sort} onChange={(e) => { setSort(e.target.value as 'created-desc'|'created-asc'|'next-asc'|'next-desc'); setPage(1); }}>
              <option value="created-desc">Newest</option>
              <option value="created-asc">Oldest</option>
              <option value="next-asc">Next delivery ↑</option>
              <option value="next-desc">Next delivery ↓</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Shipping</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Recurring</TableHead>
                    <TableHead>Next delivery</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[70px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((o) => (
                    <TableRow key={o._id}>
                      <TableCell className="font-medium">{o.orderNumber}</TableCell>
                      <TableCell>{o.customerName || o.customerId}</TableCell>
                      <TableCell className="max-w-[260px]">
                        {o.shippingAddress ? (
                          <div className="text-sm text-foreground truncate">
                            {o.shippingAddress.name || '—'}
                            { (o.shippingAddress.city || o.shippingAddress.street) && (
                              <span className="text-muted-foreground"> • {(o.shippingAddress.city || o.shippingAddress.street) as string}</span>
                            )}
                          </div>
                        ) : '—'}
                      </TableCell>
                      <TableCell>{currency(o.total)}</TableCell>
                      <TableCell><Badge variant="secondary">{o.status}</Badge></TableCell>
                      <TableCell><Badge variant={o.paymentStatus === 'paid' ? 'secondary' : 'outline'}>{o.paymentStatus}</Badge></TableCell>
                      <TableCell>
                        {o.isRecurring ? <Badge variant="secondary">{o.scheduleStatus || 'active'}</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>{o.nextDeliveryAt ? new Date(o.nextDeliveryAt).toLocaleDateString() : '—'}</TableCell>
                      <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => view(o)}>
                              <Eye className="h-4 w-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => remove(o._id)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {items.length === 0 && <div className="text-center py-8 text-muted-foreground">No orders found</div>}

              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-foreground">Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders</div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page <= 1}>Previous</Button>
                    <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page >= pagination.pages}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

  <OrderDialog open={open} onOpenChange={setOpen} order={selected} onSave={saved} />
  <CreateOrderDialog open={openCreate} onOpenChange={setOpenCreate} onSaved={() => { setOpenCreate(false); fetchItems(); }} />
    </div>
  );
}
