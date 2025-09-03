'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const schema = z.object({ name: z.string().min(1,'Required').max(100), slug: z.string().optional(), description: z.string().max(500).optional(), sortOrder: z.coerce.number().int().min(0).optional(), isActive: z.boolean().optional() });
type FormData = z.infer<typeof schema>;

interface Category { _id?: string; name: string; slug: string; description?: string; isActive?: boolean; sortOrder?: number; }

export function CategoryDialog({ open, onOpenChange, category, onSave, readOnly = false }: { open: boolean; onOpenChange: (o: boolean) => void; category?: Partial<Category> | null; onSave: () => void; readOnly?: boolean; }) {
  const isEditing = !!category?._id;
  const [loading, setLoading] = useState(false);
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { name: '', slug: '', description: '', sortOrder: 0, isActive: true } });

  useEffect(() => {
    if (category) {
      form.reset({ name: category.name, slug: category.slug, description: category.description || '', sortOrder: category.sortOrder ?? 0, isActive: category.isActive ?? true });
    } else {
      form.reset({ name: '', slug: '', description: '', sortOrder: 0, isActive: true });
    }
  }, [category, form]);

  const submit = async (data: FormData) => {
    try {
      setLoading(true);
      const url = isEditing && category?._id ? `/api/admin/categories/${category._id}` : '/api/admin/categories';
      const method = isEditing && category?._id ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(data) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save category');
      }
      toast.success(`Category ${isEditing ? 'updated' : 'created'} successfully`);
      onSave();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Add Category'}</DialogTitle>
          <DialogDescription>{isEditing ? 'Update category details' : 'Create a new category'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="slug" control={form.control} render={({ field }) => (<FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="Auto-generated if empty" {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="sortOrder" control={form.control} render={({ field }) => (<FormItem><FormLabel>Sort Order</FormLabel><FormControl><Input type="number" {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="isActive" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Active</FormLabel>
                  <FormControl>
                    <input className="h-4 w-4" type="checkbox" checked={!!field.value} onChange={(e)=>field.onChange(e.target.checked)} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField name="description" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea rows={3} {...field} disabled={readOnly} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>{readOnly ? 'Close' : 'Cancel'}</Button>
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
