'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const schema = z.object({
  status: z.enum(['pending','confirmed','processing','shipped','delivered','cancelled','refunded']),
  paymentStatus: z.enum(['pending','paid','failed','refunded']),
  trackingNumber: z.string().optional(),
  notes: z.string().max(1000).optional(),
  scheduleStatus: z.enum(['active','paused','ended']).optional(),
  nextDeliveryAt: z.string().optional(),
  shippingAddress: z.object({
    name: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
  billingAddress: z.object({
    name: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

type FormData = z.infer<typeof schema>;

interface Order { _id?: string; status: FormData['status']; paymentStatus: FormData['paymentStatus']; trackingNumber?: string; notes?: string; orderNumber?: string; total?: number; isRecurring?: boolean; scheduleStatus?: 'active'|'paused'|'ended'; nextDeliveryAt?: string; bagId?: string; bagName?: string; items?: Array<{ productId?: string; sku?: string; name?: string; qty: number; price: number; total?: number }>; shippingAddress?: { name?: string; street?: string; city?: string; state?: string; zipCode?: string; country?: string; phone?: string; }; billingAddress?: { name?: string; street?: string; city?: string; state?: string; zipCode?: string; country?: string; }; recurrence?: { startDate?: string; endDate?: string; daysOfWeek?: number[]; includeDates?: string[]; excludeDates?: string[]; selectedDates?: string[]; }; }

export function OrderDialog({ open, onOpenChange, order, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; order?: Order | null; onSave: () => void; }) {
  const isEditing = !!order?._id;
  const [loading, setLoading] = useState(false);
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { status: 'pending', paymentStatus: 'pending', trackingNumber: '', notes: '', scheduleStatus: undefined, nextDeliveryAt: '', shippingAddress: undefined, billingAddress: undefined } });

  // Editable items state
  type SelectedItem = { productId: string; sku: string; name: string; price: number; qty: number };
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [searchProducts, setSearchProducts] = useState('');
  const [productResults, setProductResults] = useState<Array<{ _id: string; name: string; sku: string; price: number }>>([]);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const computedTotal = Math.max(0, subtotal + (shippingFee || 0) + (tax || 0) - (discount || 0));

  useEffect(() => {
    if (order) {
      form.reset({
        status: order.status,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber || '',
        notes: order.notes || '',
        scheduleStatus: order.scheduleStatus,
        nextDeliveryAt: order.nextDeliveryAt ? order.nextDeliveryAt.substring(0,10) : '',
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
      });

      // initialize editable items and charges from order
      const initItems = (order.items || []).map((it) => ({
        productId: String(it.productId || ''),
        sku: String(it.sku || ''),
        name: String(it.name || ''),
        price: Number(it.price || 0),
        qty: Number(it.qty || 1),
      }));
      setItems(initItems);
      setShippingFee(typeof order.shipping === 'number' ? order.shipping : 0);
      setTax(typeof order.tax === 'number' ? order.tax : 0);
      setDiscount(typeof order.discount === 'number' ? order.discount! : 0);
    } else {
      // Reset to clean defaults when creating a new order so previous values don't leak
      form.reset({
        status: 'pending',
        paymentStatus: 'pending',
        trackingNumber: '',
        notes: '',
        scheduleStatus: undefined,
        nextDeliveryAt: '',
        shippingAddress: undefined,
        billingAddress: undefined,
      });
      setItems([]);
      setShippingFee(0);
      setTax(0);
      setDiscount(0);
    }
  }, [order, form]);

  // Load products for search
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const params = new URLSearchParams({ limit: '20', ...(searchProducts && { search: searchProducts }) });
        const res = await fetch(`/api/admin/products?${params}`, { credentials: 'include' });
        if (!res.ok) return;
        const data: unknown = await res.json();
        const anyObj = data as { products?: unknown };
        const rows = Array.isArray(anyObj.products)
          ? (anyObj.products as Array<Record<string, unknown>>)
              .map((p) => {
                const id = typeof p._id === 'string' ? p._id : String(p._id ?? '');
                const name = typeof p.name === 'string' ? p.name : '';
                const sku = typeof p.sku === 'string' ? p.sku : '';
                const price = typeof p.price === 'number' ? p.price : Number(p.price || 0);
                if (!id || !name || !sku) return null;
                return { _id: id, name, sku, price };
              })
              .filter(Boolean) as Array<{ _id: string; name: string; sku: string; price: number }>
          : [];
        if (!cancelled) setProductResults(rows);
      } catch {}
    };
    if (open) run();
    return () => {
      cancelled = true;
    };
  }, [open, searchProducts]);

  const addItem = (p: { _id: string; name: string; sku: string; price: number }) => {
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.productId === p._id);
      if (idx >= 0) {
        const cp = [...prev];
        cp[idx] = { ...cp[idx], qty: cp[idx].qty + 1 };
        return cp;
      }
      return [...prev, { productId: p._id, sku: p.sku, name: p.name, price: p.price, qty: 1 }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    setItems((prev) => prev.map((it) => (it.productId === productId ? { ...it, qty: Math.max(1, Math.floor(qty || 1)) } : it)));
  };

  const removeItem = (productId: string) => setItems((prev) => prev.filter((it) => it.productId !== productId));

  const submit = async (data: FormData) => {
    if (!isEditing) return onOpenChange(false);
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders/${order!._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          // Items & totals
          items: items.map((it) => ({
            productId: it.productId,
            sku: it.sku,
            name: it.name,
            qty: it.qty,
            price: it.price,
            total: Number((it.price * it.qty).toFixed(2)),
          })),
          subtotal: Number(subtotal.toFixed(2)),
          tax: Number((tax || 0).toFixed(2)),
          shipping: Number((shippingFee || 0).toFixed(2)),
          discount: Number((discount || 0).toFixed(2)),
          total: Number(computedTotal.toFixed(2)),
          nextDeliveryAt: data.nextDeliveryAt ? new Date(data.nextDeliveryAt).toISOString() : undefined,
          shippingAddress: data.shippingAddress,
          billingAddress: data.billingAddress,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update order');
      }
      toast.success('Order updated');
      onSave();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Order {order?.orderNumber}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="status" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="paymentStatus" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Status</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField name="trackingNumber" control={form.control} render={({ field }) => (<FormItem><FormLabel>Tracking Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField name="notes" control={form.control} render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />

            {(order?.isRecurring || order?.nextDeliveryAt || order?.scheduleStatus || order?.recurrence) && (
              <div className="mt-4 border rounded p-3">
                <h3 className="text-sm font-medium">Recurring schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  <FormField name="scheduleStatus" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule Status</FormLabel>
                      <FormControl>
                        <select className="border rounded px-2 py-1 w-full" {...field}>
                          <option value="">Unchanged</option>
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="ended">Ended</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="nextDeliveryAt" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next delivery date</FormLabel>
                      <FormControl>
                        <input type="date" className="border rounded px-2 py-1 w-full" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Current</label>
                    <div className="text-sm text-gray-700">{order.nextDeliveryAt ? new Date(order.nextDeliveryAt).toLocaleDateString() : '—'}</div>
                  </div>
                </div>
                {order.recurrence && (
                  <div className="grid grid-cols-1 gap-3 mt-3 text-xs text-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>Start: {order.recurrence.startDate ? new Date(order.recurrence.startDate).toLocaleDateString() : '—'}</div>
                      <div>End: {order.recurrence.endDate ? new Date(order.recurrence.endDate).toLocaleDateString() : '—'}</div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Days of week</div>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(order.recurrence.daysOfWeek) && order.recurrence.daysOfWeek.length ? order.recurrence.daysOfWeek : []).map((d) => {
                          const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                          const label = names[d] ?? String(d);
                          return <span key={`dow-${d}`} className="px-2 py-0.5 rounded border bg-gray-50 text-gray-700">{label}</span>;
                        })}
                        {!(order.recurrence.daysOfWeek && order.recurrence.daysOfWeek.length) && (
                          <span className="text-gray-500">—</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Selected dates</div>
                      <div className="flex flex-wrap gap-2">
                        {(order.recurrence.selectedDates || []).map((d, idx) => (
                          <span key={`sel-${idx}`} className="px-2 py-0.5 rounded border bg-blue-50 text-blue-700">{new Date(d as string).toLocaleDateString()}</span>
                        ))}
                        {!(order.recurrence.selectedDates && order.recurrence.selectedDates.length) && (
                          <span className="text-gray-500">—</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Include dates</div>
                      <div className="flex flex-wrap gap-2">
                        {(order.recurrence.includeDates || []).map((d, idx) => (
                          <span key={`inc-${idx}`} className="px-2 py-0.5 rounded border bg-green-50 text-green-700">{new Date(d as string).toLocaleDateString()}</span>
                        ))}
                        {!(order.recurrence.includeDates && order.recurrence.includeDates.length) && (
                          <span className="text-gray-500">—</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Exclude dates</div>
                      <div className="flex flex-wrap gap-2">
                        {(order.recurrence.excludeDates || []).map((d, idx) => (
                          <span key={`exc-${idx}`} className="px-2 py-0.5 rounded border bg-red-50 text-red-700">{new Date(d as string).toLocaleDateString()}</span>
                        ))}
                        {!(order.recurrence.excludeDates && order.recurrence.excludeDates.length) && (
                          <span className="text-gray-500">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bag / Items summary */}
            <div className="mt-2 border rounded p-3">
              <h3 className="text-sm font-medium">Items</h3>
              {(order?.bagName || order?.bagId) && (
                <div className="text-xs text-gray-600 mt-1 mb-2">
                  Bag: <span className="font-medium">{order?.bagName || order?.bagId}</span>
                </div>
              )}

              {/* Product search */}
              <div className="flex gap-2 mb-3">
                <Input placeholder="Search products..." value={searchProducts} onChange={(e)=>setSearchProducts(e.target.value)} />
              </div>
              <div className="max-h-40 overflow-y-auto border rounded mb-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="w-[100px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productResults.map((p) => (
                      <TableRow key={p._id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.sku}</TableCell>
                        <TableCell>Rs. {Number(p.price).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button type="button" variant="outline" size="sm" onClick={() => addItem(p)}>Add</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {productResults.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-sm text-gray-500">No products</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Selected items */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Unit price</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Line total</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it) => (
                    <TableRow key={it.productId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{it.name}</span>
                          <Badge variant="outline">{it.sku}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>Rs. {Number(it.price).toFixed(2)}</TableCell>
                      <TableCell>
                        <Input type="number" className="w-24" value={it.qty} onChange={(e)=>updateQty(it.productId, parseInt(e.target.value))} />
                      </TableCell>
                      <TableCell>Rs. {Number(it.price * it.qty).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(it.productId)}>Remove</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-sm text-gray-500">No items</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Charges & total */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <div className="border rounded p-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">Rs. {subtotal.toFixed(2)}</span></div>
                    <div className="flex items-center justify-between"><span className="text-gray-600">Shipping</span><Input type="number" className="w-28" value={shippingFee} onChange={(e)=>setShippingFee(Number(e.target.value||0))} /></div>
                    <div className="flex items-center justify-between"><span className="text-gray-600">Tax</span><Input type="number" className="w-28" value={tax} onChange={(e)=>setTax(Number(e.target.value||0))} /></div>
                    <div className="flex items-center justify-between"><span className="text-gray-600">Discount</span><Input type="number" className="w-28" value={discount} onChange={(e)=>setDiscount(Number(e.target.value||0))} /></div>
                    <div className="flex items-center justify-between pt-2 border-t font-semibold"><span>Total</span><span>Rs. {computedTotal.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address Section */}
            <div className="mt-4 border rounded p-3">
              <h3 className="text-sm font-medium">Delivery Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <FormField name="shippingAddress.name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="shippingAddress.phone" control={form.control} render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="shippingAddress.street" control={form.control} render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Street</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="shippingAddress.city" control={form.control} render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="shippingAddress.state" control={form.control} render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="shippingAddress.zipCode" control={form.control} render={({ field }) => (<FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="shippingAddress.country" control={form.control} render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <div className="mt-3">
                <div className="text-xs text-gray-600 mb-1">Billing address (optional)</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField name="billingAddress.name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField name="billingAddress.street" control={form.control} render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Street</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField name="billingAddress.city" control={form.control} render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField name="billingAddress.state" control={form.control} render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField name="billingAddress.zipCode" control={form.control} render={({ field }) => (<FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField name="billingAddress.country" control={form.control} render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Close</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
