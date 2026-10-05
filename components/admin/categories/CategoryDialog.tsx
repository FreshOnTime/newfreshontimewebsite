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
import { ImageUpload } from '@/components/ui/image-upload';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(1,'Required').max(100),
  slug: z.string().optional(),
  description: z.string().max(500).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export function CategoryDialog({ open, onOpenChange, category, onSave, readOnly = false }: { open: boolean; onOpenChange: (o: boolean) => void; category?: Partial<Category> | null; onSave: () => void; readOnly?: boolean; }) {
  const isEditing = !!category?._id;
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', description: '', sortOrder: 0, isActive: true },
  });

  useEffect(() => {
    setImageFile(null);
    if (category) {
      form.reset({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        sortOrder: category.sortOrder ?? 0,
        isActive: category.isActive ?? true,
      });
    } else {
      form.reset({ name: '', slug: '', description: '', sortOrder: 0, isActive: true });
    }
  }, [category, form, open]);

  const submit = async (data: FormData) => {
    try {
      setLoading(true);

      let imageUrl = category?.imageUrl ?? null;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const upload = await authenticatedApiFetch('/api/upload/images/categories', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await upload.json().catch(() => ({}));
        if (!upload.ok || !uploadData?.data?.url) {
          throw new Error(uploadData?.error || 'Failed to upload category image');
        }
        imageUrl = uploadData.data.url;
      }

      const url = isEditing && category?._id ? `/api/admin/categories/${category._id}` : '/api/admin/categories';
      const method = isEditing && category?._id ? 'PUT' : 'POST';
      const payload = { ...data, imageUrl };
      const res = await authenticatedApiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save category');
      }
      toast.success(`Category ${isEditing ? 'updated' : 'created'} successfully`);
      onSave();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Add Category'}</DialogTitle>
          <DialogDescription>{isEditing ? 'Update category details and replace its image if needed.' : 'Create a new category and upload its image.'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField name="name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="slug" control={form.control} render={({ field }) => (<FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="Auto-generated if empty" {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="sortOrder" control={form.control} render={({ field }) => (<FormItem><FormLabel>Sort Order</FormLabel><FormControl><Input type="number" {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="isActive" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Active</FormLabel>
                  <FormControl>
                    <input className="h-4 w-4" type="checkbox" checked={!!field.value} onChange={(event)=>field.onChange(event.target.checked)} disabled={readOnly} />
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

            <div className="space-y-3 rounded-md border p-4">
              <div>
                <h4 className="font-semibold">Category image</h4>
                <p className="mt-1 text-xs text-muted-foreground">Upload an image directly. It is used on category cards and category pages.</p>
              </div>
              <ImageUpload
                value={imageFile}
                onChange={setImageFile}
                existingUrl={category?.imageUrl || null}
                disabled={readOnly || loading}
                aspectRatio={1}
              />
            </div>

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
