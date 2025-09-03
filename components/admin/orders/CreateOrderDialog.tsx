'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type ProductRow = { _id: string; name: string; sku: string; price: number };
type CustomerRow = { _id: string; name: string; email?: string };

type SelectedItem = { productId: string; sku: string; name: string; price: number; qty: number };

export function CreateOrderDialog({ open, onOpenChange, onSaved }: { open: boolean; onOpenChange: (o: boolean) => void; onSaved: () => void; }) {
  const [loading, setLoading] = useState(false);
  const [searchProducts, setSearchProducts] = useState('');
  const [productResults, setProductResults] = useState<ProductRow[]>([]);
  const [items, setItems] = useState<SelectedItem[]>([]);

  const [searchCustomer, setSearchCustomer] = useState('');
  const [customerResults, setCustomerResults] = useState<CustomerRow[]>([]);
  const [customerId, setCustomerId] = useState<string>('');

  const [shipName, setShipName] = useState('');
  const [shipStreet, setShipStreet] = useState('');
  const [shipCity, setShipCity] = useState('');
  const [shipState, setShipState] = useState('');
  const [shipZip, setShipZip] = useState('');
  const [shipCountry, setShipCountry] = useState('LK');
  const [shipPhone, setShipPhone] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'cash'|'card'|'bank_transfer'|'digital_wallet'>('cash');
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [tax, setTax] = useState(0);

  // derived
  const subtotal = useMemo(() => items.reduce((s, it) => s + it.price * it.qty, 0), [items]);
  const total = useMemo(() => Math.max(0, subtotal + shippingFee + tax - discount), [subtotal, shippingFee, tax, discount]);

  // Load products on search
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const params = new URLSearchParams({ limit: '20', ...(searchProducts && { search: searchProducts }) });
        const res = await fetch(`/api/admin/products?${params}`, { credentials: 'include' });
        if (!res.ok) return;
        const data: unknown = await res.json();
        const anyObj = data as { products?: unknown };
        const rows: ProductRow[] = Array.isArray(anyObj.products)
          ? anyObj.products
              .map((p: unknown) => {
                const o = p as { _id?: unknown; name?: unknown; sku?: unknown; price?: unknown };
                const id = typeof o._id === 'string' ? o._id : undefined;
                const name = typeof o.name === 'string' ? o.name : undefined;
                const sku = typeof o.sku === 'string' ? o.sku : undefined;
                const price = typeof o.price === 'number' ? o.price : Number(o.price || 0);
                if (!id || !name || !sku) return null;
                return { _id: id, name, sku, price } as ProductRow;
              })
              .filter(Boolean) as ProductRow[]
          : [];
        if (!cancelled) setProductResults(rows);
      } catch {}
    };
    if (open) run();
    return () => { cancelled = true; };
  }, [open, searchProducts]);

  // Load customers on search
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const params = new URLSearchParams({ limit: '20', ...(searchCustomer && { search: searchCustomer }) });
        const res = await fetch(`/api/admin/customers?${params}`, { credentials: 'include' });
        if (!res.ok) return;
        const data: unknown = await res.json();
        const anyObj = data as { customers?: unknown };
        const rows: CustomerRow[] = Array.isArray(anyObj.customers)
          ? anyObj.customers
              .map((c: unknown) => {
                const o = c as { _id?: unknown; name?: unknown; email?: unknown };
                const id = typeof o._id === 'string' ? o._id : undefined;
                const name = typeof o.name === 'string' ? o.name : undefined;
                const email = typeof o.email === 'string' ? o.email : undefined;
                if (!id || !name) return null;
                return { _id: id, name, email } as CustomerRow;
              })
              .filter(Boolean) as CustomerRow[]
          : [];
        if (!cancelled) setCustomerResults(rows);
      } catch {}
    };
    if (open) run();
    return () => { cancelled = true; };
  }, [open, searchCustomer]);

  const addItem = (p: ProductRow) => {
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

  const resetAll = () => {
    setSearchProducts(''); setProductResults([]); setItems([]);
    setSearchCustomer(''); setCustomerResults([]); setCustomerId('');
    setShipName(''); setShipStreet(''); setShipCity(''); setShipState(''); setShipZip(''); setShipCountry('LK'); setShipPhone('');
    setPaymentMethod('cash'); setDiscount(0); setShippingFee(0); setTax(0);
  };

  useEffect(() => { if (!open) resetAll(); }, [open]);

  const submit = async () => {
    if (!customerId) return toast.error('Select a customer');
    if (items.length === 0) return toast.error('Add at least one item');
    if (!shipName || !shipStreet || !shipCity || !shipZip || !shipCountry) return toast.error('Fill shipping address');

    try {
      setLoading(true);
      const body = {
        customerId,
        items: items.map((it) => ({ productId: it.productId, sku: it.sku, name: it.name, qty: it.qty, price: it.price, total: Number((it.price * it.qty).toFixed(2)) })),
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        shipping: Number(shippingFee.toFixed(2)),
        discount: Number(discount.toFixed(2)),
        total: Number(total.toFixed(2)),
        paymentMethod,
        paymentStatus: 'pending',
        shippingAddress: { name: shipName, street: shipStreet, city: shipCity, state: shipState, zipCode: shipZip, country: shipCountry, phone: shipPhone },
      };
      const res = await fetch('/api/admin/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create order');
      }
      toast.success('Order created');
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const currency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Create Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer selector */}
          <div className="border rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Customer</div>
              <div className="text-xs text-gray-500">Search and pick a customer</div>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Search customers..." value={searchCustomer} onChange={(e)=>setSearchCustomer(e.target.value)} />
              <select className="border rounded px-2 py-1 min-w-[240px]" value={customerId} onChange={(e)=>setCustomerId(e.target.value)}>
                <option value="">Select...</option>
                {customerResults.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}{c.email ? ` • ${c.email}` : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product picker */}
          <div className="border rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Products</div>
              <div className="text-xs text-gray-500">Search and add products</div>
            </div>
            <div className="flex gap-2 mb-3">
              <Input placeholder="Search products..." value={searchProducts} onChange={(e)=>setSearchProducts(e.target.value)} />
            </div>
            <div className="max-h-48 overflow-y-auto border rounded">
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
                      <TableCell>{currency(p.price)}</TableCell>
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
          </div>

          {/* Selected items */}
          <div className="border rounded p-3">
            <div className="text-sm font-medium mb-2">Items in order</div>
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
                    <TableCell>{currency(it.price)}</TableCell>
                    <TableCell>
                      <Input type="number" className="w-24" value={it.qty} onChange={(e)=>updateQty(it.productId, parseInt(e.target.value))} />
                    </TableCell>
                    <TableCell>{currency(it.price * it.qty)}</TableCell>
                    <TableCell>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(it.productId)}>Remove</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-sm text-gray-500">No items added</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="border rounded p-3">
              <div className="text-sm font-medium mb-2">Charges</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Subtotal</span><span className="font-medium">{currency(subtotal)}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Shipping</span><Input type="number" className="w-28" value={shippingFee} onChange={(e)=>setShippingFee(Number(e.target.value||0))} /></div>
                <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Tax</span><Input type="number" className="w-28" value={tax} onChange={(e)=>setTax(Number(e.target.value||0))} /></div>
                <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Discount</span><Input type="number" className="w-28" value={discount} onChange={(e)=>setDiscount(Number(e.target.value||0))} /></div>
                <div className="flex items-center justify-between pt-2 border-t"><span className="text-sm">Total</span><span className="font-semibold">{currency(total)}</span></div>
              </div>
            </div>
            <div className="border rounded p-3 md:col-span-2">
              <div className="text-sm font-medium mb-2">Shipping address</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div><label className="block text-xs text-gray-600 mb-1">Recipient name</label><Input value={shipName} onChange={(e)=>setShipName(e.target.value)} /></div>
                <div><label className="block text-xs text-gray-600 mb-1">Phone</label><Input value={shipPhone} onChange={(e)=>setShipPhone(e.target.value)} /></div>
                <div className="md:col-span-2"><label className="block text-xs text-gray-600 mb-1">Street</label><Input value={shipStreet} onChange={(e)=>setShipStreet(e.target.value)} /></div>
                <div><label className="block text-xs text-gray-600 mb-1">City</label><Input value={shipCity} onChange={(e)=>setShipCity(e.target.value)} /></div>
                <div><label className="block text-xs text-gray-600 mb-1">State</label><Input value={shipState} onChange={(e)=>setShipState(e.target.value)} /></div>
                <div><label className="block text-xs text-gray-600 mb-1">Postal Code</label><Input value={shipZip} onChange={(e)=>setShipZip(e.target.value)} /></div>
                <div><label className="block text-xs text-gray-600 mb-1">Country</label><Input value={shipCountry} onChange={(e)=>setShipCountry(e.target.value)} /></div>
              </div>
              <div className="mt-3">
                <label className="block text-xs text-gray-600 mb-1">Payment method</label>
                <select className="border rounded px-2 py-1" value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value as 'cash'|'card'|'bank_transfer'|'digital_wallet')}>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="digital_wallet">Digital Wallet</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button type="button" onClick={submit} disabled={loading}>Create Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
