'use client';

import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ui/image-upload';

type NamedId = { _id: string; name: string };
const isNamedId = (x: unknown): x is NamedId => {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as { _id?: unknown; name?: unknown };
  return typeof o._id === 'string' && typeof o.name === 'string';
};

const schema = z.object({
  name: z.string().min(1, 'Required').max(200),
  sku: z.string().min(1, 'Required').max(100),
  slug: z.string().optional(),
  description: z.string().max(2000).optional(),
  price: z.number({ invalid_type_error: 'Enter a number' }).nonnegative(),
  costPrice: z.number({ invalid_type_error: 'Enter a number' }).nonnegative(),
  categoryId: z.string().min(1, 'Required'),
  supplierId: z.string().min(1, 'Required'),
  stockQty: z.number({ invalid_type_error: 'Enter a number' }).int().nonnegative().default(0),
  minStockLevel: z.number({ invalid_type_error: 'Enter a number' }).int().nonnegative().default(5),
  unitOptions: z
    .array(
      z.object({
        label: z.string().min(1, 'Label required'),
        quantity: z.number({ invalid_type_error: 'Enter a number' }).positive('Must be > 0'),
        unit: z.enum(['g','kg','ml','l','ea','lb']),
        price: z.number({ invalid_type_error: 'Enter a number' }).min(0, 'Must be >= 0'),
      })
    )
    .optional(),
});

type FormData = z.infer<typeof schema>;

interface Product { _id?: string; name: string; sku: string; slug?: string; description?: string; price: number; costPrice: number; categoryId: string; supplierId: string; stockQty: number; minStockLevel?: number; attributes?: Record<string, unknown>; }

export function ProductDialog({ open, onOpenChange, product, onSave, readOnly = false }: { open: boolean; onOpenChange: (o: boolean) => void; product?: Partial<Product> | null; onSave: () => void; readOnly?: boolean; }) {
  const isEditing = !!product?._id;
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ _id: string; name: string }[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  defaultValues: { name: '', sku: '', slug: '', description: '', price: 0, costPrice: 0, categoryId: '', supplierId: '', stockQty: 0, minStockLevel: 5, unitOptions: [] },
  });

  const { fields, append, remove, replace } = useFieldArray({ control: form.control, name: 'unitOptions' });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [catRes, supRes] = await Promise.all([
          fetch('/api/admin/categories?limit=1000', { credentials: 'include' }),
          fetch('/api/admin/suppliers?limit=1000', { credentials: 'include' }),
        ]);
        const catsJson: unknown = catRes.ok ? await catRes.json() : {};
        const supsJson: unknown = supRes.ok ? await supRes.json() : {};
        const catsSource = catsJson as { categories?: unknown; data?: unknown };
        const supsSource = supsJson as { suppliers?: unknown; data?: unknown };
        const rawCats: unknown[] = Array.isArray(catsSource.categories)
          ? catsSource.categories
          : Array.isArray(catsSource.data)
          ? catsSource.data
          : [];
        const rawSups: unknown[] = Array.isArray(supsSource.suppliers)
          ? supsSource.suppliers
          : Array.isArray(supsSource.data)
          ? supsSource.data
          : [];
        setCategories(rawCats.filter(isNamedId).map((c) => ({ _id: c._id, name: c.name })));
        setSuppliers(rawSups.filter(isNamedId).map((s) => ({ _id: s._id, name: s.name })));
      } catch {}
    };
    if (open) loadOptions();
  }, [open]);

  useEffect(() => {
  if (product) {
      const attrs = (product.attributes || {}) as { unitOptions?: unknown };
      const raw = Array.isArray(attrs.unitOptions) ? attrs.unitOptions : [];
      const mapped = raw
        .map((opt) => {
          const o = opt as Partial<{ label: unknown; quantity: unknown; unit: unknown; price: unknown }>;
          const unit = typeof o.unit === 'string' && ['g','kg','ml','l','ea','lb'].includes(o.unit) ? (o.unit as 'g'|'kg'|'ml'|'l'|'ea'|'lb') : undefined;
          const quantity = typeof o.quantity === 'number' && isFinite(o.quantity) && o.quantity > 0 ? o.quantity : undefined;
          const price = typeof o.price === 'number' && isFinite(o.price) && o.price >= 0 ? o.price : undefined;
          const label = typeof o.label === 'string' && o.label.trim().length > 0 ? o.label : undefined;
          if (!unit || !quantity || price === undefined) return null;
          return { label: label || `${quantity}${unit}`, quantity, unit, price };
        })
        .filter(Boolean) as FormData['unitOptions'];
  form.reset({ name: product.name, sku: product.sku, slug: product.slug || '', description: product.description || '', price: product.price, costPrice: product.costPrice, categoryId: product.categoryId, supplierId: product.supplierId, stockQty: product.stockQty, minStockLevel: product.minStockLevel ?? 5, unitOptions: mapped });
      // Reset image inputs when switching product
      setImageFile(null);
      setImageUrl("");
      replace(mapped || []);
    } else {
  form.reset({ name: '', sku: '', slug: '', description: '', price: 0, costPrice: 0, categoryId: '', supplierId: '', stockQty: 0, minStockLevel: 5, unitOptions: [] });
      setImageFile(null);
      setImageUrl("");
      replace([]);
    }
  }, [product, form, replace]);

  const submit = async (data: FormData) => {
    try {
      setLoading(true);
  const body: Record<string, unknown> = {
        ...data,
        slug: data.slug && data.slug.trim().length > 0 ? data.slug.trim() : undefined,
        price: Number(data.price),
        costPrice: Number(data.costPrice),
        stockQty: Number(data.stockQty),
        minStockLevel: Number(data.minStockLevel),
        ...(Array.isArray(data.unitOptions) && data.unitOptions.length > 0 ? { unitOptions: data.unitOptions } : {}),
      };

      // Optional image handling: prefer uploaded file, else URL, else none
      try {
        if (imageFile) {
          const fd = new FormData();
          fd.append('image', imageFile);
          const uploadRes = await fetch('/api/upload/images/products', { method: 'POST', body: fd, credentials: 'include' });
          if (!uploadRes.ok) {
            const err = await uploadRes.json().catch(() => ({}));
            throw new Error(err?.message || 'Image upload failed');
          }
          const uploadJson = await uploadRes.json();
          const url = uploadJson?.data?.url as string | undefined;
          if (url) {
            body.images = [url];
            body.image = url;
          }
        } else if (imageUrl && imageUrl.trim().length > 0) {
          body.images = [imageUrl.trim()];
          body.image = imageUrl.trim();
        }
      } catch (imgErr) {
        // Non-fatal if user provided an image but upload failed; surface the error
        throw imgErr instanceof Error ? imgErr : new Error('Image handling failed');
      }
      const res = await fetch(isEditing ? `/api/admin/products/${product!._id}` : '/api/admin/products', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save product');
      }
      toast.success(`Product ${isEditing ? 'updated' : 'created'} successfully`);
      onSave();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogDescription>{isEditing ? 'Update product details' : 'Create a new product'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="sku" control={form.control} render={({ field }) => (<FormItem><FormLabel>SKU *</FormLabel><FormControl><Input {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="slug" control={form.control} render={({ field }) => (<FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="Auto-generated if empty" {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
      <FormField name="description" control={form.control} render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
        <Textarea rows={4} placeholder="Short description to show on the product page" {...field} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="price" control={form.control} render={({ field }) => (<FormItem><FormLabel>Price *</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e)=>field.onChange(Number(e.target.value))} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="costPrice" control={form.control} render={({ field }) => (<FormItem><FormLabel>Cost Price *</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e)=>field.onChange(Number(e.target.value))} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />

      <FormField name="categoryId" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <FormControl>
        <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger showArrow>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
          <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

      <FormField name="supplierId" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier *</FormLabel>
                  <FormControl>
        <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger showArrow>
                        <SelectValue placeholder="Select a supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((s) => (
          <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="stockQty" control={form.control} render={({ field }) => (<FormItem><FormLabel>Stock Qty *</FormLabel><FormControl><Input type="number" {...field} onChange={(e)=>field.onChange(Number(e.target.value))} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="minStockLevel" control={form.control} render={({ field }) => (<FormItem><FormLabel>Min Stock Level</FormLabel><FormControl><Input type="number" {...field} onChange={(e)=>field.onChange(Number(e.target.value))} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            <div className="space-y-3 border rounded-md p-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Pack Sizes / Unit Options (optional)</h4>
                {!readOnly && (
                  <Button type="button" variant="outline" onClick={() => append({ label: '1ea', quantity: 1, unit: 'ea', price: Number(form.getValues('price') || 0) })}>
                    Add Option
                  </Button>
                )}
              </div>
              {fields.length === 0 && <div className="text-sm text-gray-500">No unit options added.</div>}
              <div className="space-y-2">
                {fields.map((f, index) => (
                  <div key={f.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                    <FormField name={`unitOptions.${index}.label`} control={form.control} render={({ field }) => (
                      <FormItem className="md:col-span-3"><FormLabel>Label</FormLabel><FormControl><Input placeholder="e.g., 1kg" {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name={`unitOptions.${index}.quantity`} control={form.control} render={({ field }) => (
                      <FormItem className="md:col-span-3"><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} onChange={(e)=>field.onChange(Number(e.target.value))} disabled={readOnly} /></FormControl><FormMessage /></FormItem>
                    )} />
          <FormField name={`unitOptions.${index}.unit`} control={form.control} render={({ field }) => (
                      <FormItem className="md:col-span-2"><FormLabel>Unit</FormLabel><FormControl>
            <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="l">l</SelectItem>
                            <SelectItem value="ea">ea</SelectItem>
                            <SelectItem value="lb">lb</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name={`unitOptions.${index}.price`} control={form.control} render={({ field }) => (
                      <FormItem className="md:col-span-3"><FormLabel>Price</FormLabel><FormControl><Input type="number" {...field} onChange={(e)=>field.onChange(Number(e.target.value))} disabled={readOnly} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="md:col-span-1 flex md:justify-end">
                      {!readOnly && (
                        <Button type="button" variant="destructive" onClick={() => remove(index)}>Remove</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional image section */}
            <div className="space-y-3 border rounded-md p-3">
              <h4 className="font-semibold">Product Image (optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload image file</label>
                  <ImageUpload value={imageFile} onChange={setImageFile} disabled={readOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">or Image URL</label>
                  <Input
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={readOnly}
                  />
                  <p className="text-xs text-gray-500 mt-1">Provide a direct image URL if not uploading a file.</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">You can leave both empty. One image is optional for creating a product.</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Close</Button>
              {!readOnly && (
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}</Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
