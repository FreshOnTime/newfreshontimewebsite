'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MoreHorizontal, Eye, Trash2, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { OrderDialog } from '@/components/admin/orders/OrderDialog';
import { CreateOrderDialog } from '@/components/admin/orders/CreateOrderDialog';
import { toast } from 'sonner';

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

export function OrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
    try {
      setLoading(true);
  const params = new URLSearchParams({ page: String(page), limit: '20', ...(search && { search }), ...(isRecurring !== 'all' && { isRecurring }), ...(schedStatus !== 'all' && { scheduleStatus: schedStatus }), ...(sort && { sort }), ...(customerId ? { customerId } : {}) });
      const res = await fetch(`/api/admin/orders?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const data: OrdersResponse = await res.json();
      setItems(data.orders);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize customerId from URL once
    const cid = searchParams.get('customerId');
    if (cid && !customerId) setCustomerId(cid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => { fetchItems(); }, [page, search, isRecurring, schedStatus, sort, customerId]); // eslint-disable-line react-hooks/exhaustive-deps

  const view = (o: Order) => { setSelected(o); setOpen(true); };
  const saved = () => { setOpen(false); setSelected(null); fetchItems(); };
  const create = () => { setSelected(null); setOpenCreate(true); };

  const remove = async (id: string) => {
    if (!confirm('Delete this order? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Order deleted');
      fetchItems();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const currency = (v: number) => `Rs. ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-2">Review and manage orders</p>
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
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-800 rounded-md px-3 py-2 mb-3 text-sm">
              <div>
                Filtering by customer ID: <span className="font-mono">{customerId}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setCustomerId(''); router.push('/admin/orders'); }}>Clear</Button>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
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
            <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
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
                          <div className="text-sm text-gray-700 truncate">
                            {o.shippingAddress.name || '—'}
                            { (o.shippingAddress.city || o.shippingAddress.street) && (
                              <span className="text-gray-500"> • {(o.shippingAddress.city || o.shippingAddress.street) as string}</span>
                            )}
                          </div>
                        ) : '—'}
                      </TableCell>
                      <TableCell>{currency(o.total)}</TableCell>
                      <TableCell><Badge variant="secondary">{o.status}</Badge></TableCell>
                      <TableCell><Badge variant={o.paymentStatus === 'paid' ? 'secondary' : 'outline'}>{o.paymentStatus}</Badge></TableCell>
                      <TableCell>
                        {o.isRecurring ? <Badge variant="secondary">{o.scheduleStatus || 'active'}</Badge> : <span className="text-xs text-gray-500">—</span>}
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

              {items.length === 0 && <div className="text-center py-8 text-gray-500">No orders found</div>}

              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders</div>
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
