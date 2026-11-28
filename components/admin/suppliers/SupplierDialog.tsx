'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  contactName: z.string().min(1, 'Required'),
  email: z.union([z.string().email('Invalid email'),z.literal('')]),
  phone: z.string().min(3, 'Invalid'),
  address: z.object({
    street: z.string().max(200),
    city: z.string().min(1, 'Required'),
    state: z.string().max(100),
    zipCode: z.string().max(30),
    country: z.string().min(1, 'Required'),
  }),
  paymentTerms: z.enum(['net-15','net-30','net-60','net-90','cod','prepaid']).default('net-30'),
  status: z.enum(['active','inactive']).default('inactive'),
});

type FormData = z.infer<typeof schema>;

interface Supplier { _id?: string; name: string; contactName: string; email: string; phone: string; address: { street: string; city: string; state: string; zipCode: string; country: string; }; paymentTerms: 'net-15'|'net-30'|'net-60'|'net-90'|'cod'|'prepaid'; status: 'active' | 'inactive'; applicationStatus?:string; reviewVersion?:number; }

export function SupplierDialog({ open, onOpenChange, supplier, onSave, readOnly = false }: { open: boolean; onOpenChange: (o: boolean) => void; supplier?: Partial<Supplier> | null; onSave: () => void; readOnly?: boolean; }) {
  const isEditing = !!supplier?._id;
  const [loading, setLoading] = useState(false);
  type UploadRow = { _id: string; filename: string; originalName?: string; path?: string; createdAt: string };
  const [uploads, setUploads] = useState<UploadRow[] | null>(null);
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { name: '', contactName: '', email: '', phone: '', address: { street: '', city: '', state: '', zipCode: '', country: '' }, paymentTerms: 'net-30', status: 'inactive' } });

  useEffect(() => {
    if (supplier) {
      form.reset({ name: supplier.name, contactName: supplier.contactName, email: supplier.email ?? '', phone: supplier.phone, address: {street:'',city:'',state:'',zipCode:'',country:'Sri Lanka',...supplier.address}, paymentTerms: supplier.paymentTerms || 'net-30', status: supplier.status });
    } else {
      form.reset({ name: '', contactName: '', email: '', phone: '', address: { street: '', city: '', state: '', zipCode: '', country: '' }, paymentTerms: 'net-30', status: 'inactive' });
    }
    if (readOnly && supplier?._id) {
      // fetch uploads for this supplier
      (async () => {
        try {
          const res = await authenticatedApiFetch(`/api/admin/supplier-uploads/by-supplier/${supplier!._id}`, { credentials: 'include' });
          if (!res.ok) return setUploads([]);
          const j = await res.json();
          setUploads(j.data || []);
        } catch {
          setUploads([]);
        }
      })();
    } else {
      setUploads(null);
    }
  }, [supplier, form, readOnly]);

  const submit = async (data: FormData) => {
    if (readOnly || loading) return;
    if (!isEditing && !data.email) {form.setError('email',{message:'Email is required for a new record'});return;}
    try {
      setLoading(true);
      const res = await authenticatedApiFetch(isEditing ? `/api/admin/suppliers/${supplier!._id}` : '/api/admin/suppliers', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({...data,...(isEditing?{reviewVersion:supplier?.reviewVersion}: {})}),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save supplier');
      }
      toast.success(`Supplier ${isEditing ? 'updated' : 'created'} successfully`);
      onSave();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save supplier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
          <DialogDescription>{isEditing ? 'Update supplier details' : 'Create a new supplier'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="contactName" control={form.control} render={({ field }) => (<FormItem><FormLabel>Contact Name *</FormLabel><FormControl><Input {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="email" control={form.control} render={({ field }) => (<FormItem><FormLabel>Email {isEditing?'(optional)':'*'}</FormLabel><FormControl><Input type="email" {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="phone" control={form.control} render={({ field }) => (<FormItem><FormLabel>Phone *</FormLabel><FormControl><Input {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="address.street" control={form.control} render={({ field }) => (<FormItem><FormLabel>Street (optional)</FormLabel><FormControl><Input {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="address.city" control={form.control} render={({ field }) => (<FormItem><FormLabel>City *</FormLabel><FormControl><Input {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="address.state" control={form.control} render={({ field }) => (<FormItem><FormLabel>State / province (optional)</FormLabel><FormControl><Input {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="address.zipCode" control={form.control} render={({ field }) => (<FormItem><FormLabel>Postal code (optional)</FormLabel><FormControl><Input {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="address.country" control={form.control} render={({ field }) => (<FormItem><FormLabel>Country *</FormLabel><FormControl><Input {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField name="paymentTerms" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms</FormLabel>
                  <FormControl>
        <Select disabled={readOnly || loading} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="net-15">Net 15</SelectItem>
                        <SelectItem value="net-30">Net 30</SelectItem>
                        <SelectItem value="net-60">Net 60</SelectItem>
                        <SelectItem value="net-90">Net 90</SelectItem>
                        <SelectItem value="cod">Cash on Delivery</SelectItem>
                        <SelectItem value="prepaid">Prepaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="status" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Account status</FormLabel>{(!isEditing||supplier?.applicationStatus!=='approved')&&<p className="text-xs text-muted-foreground">Approve the business in Business Applications before activating it.</p>}
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active" disabled={!isEditing || supplier?.applicationStatus!=='approved'}>Active (approved businesses only)</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Close</Button>
              {!readOnly && (
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}</Button>
              )}
            </DialogFooter>
          </form>
        </Form>
        {readOnly && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Supplier Uploads</h4>
            {uploads === null ? (
              <div className="text-sm text-muted-foreground">Loading uploads...</div>
            ) : uploads.length === 0 ? (
              <div className="text-sm text-muted-foreground">No uploads found for this supplier.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left">File</th>
                      <th className="text-left">Uploaded</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploads.map((u: UploadRow) => (
                      <tr key={u._id} className="border-t">
                        <td className="py-2">{u.originalName || u.filename}</td>
                        <td className="py-2">{new Date(u.createdAt).toLocaleString()}</td>
                        <td className="py-2"><a className="text-brand-green" href={u.path} download>Download</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
