'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ImagePlus, Loader2, X } from 'lucide-react';
import BlogImage from '@/components/blog/BlogImage';
import { MarkdownEditor } from '@/components/admin/blogs/MarkdownEditor';
import { uploadBlogImage } from '@/components/admin/blogs/blogImageClient';

interface BlogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog: Blog | null;
  onSave: () => void;
  readOnly?: boolean;
}

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: {
    url: string;
    alt?: string;
  };
  category?: string;
  tags: string[];
  published: boolean;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featuredImageUrl: '',
  featuredImageAlt: '',
  category: '',
  tags: '',
  published: false,
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
};

export function BlogDialog({ open, onOpenChange, blog, onSave, readOnly }: BlogDialogProps) {
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        slug: blog.slug || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        featuredImageUrl: blog.featuredImage?.url || '',
        featuredImageAlt: blog.featuredImage?.alt || '',
        category: blog.category || '',
        tags: blog.tags?.join(', ') || '',
        published: blog.published || false,
        metaTitle: blog.metaTitle || '',
        metaDescription: blog.metaDescription || '',
        metaKeywords: blog.metaKeywords?.join(', ') || '',
      });
    } else {
      setFormData(emptyForm);
    }
  }, [blog, open]);

  const handleFeaturedImageUpload = async (file?: File) => {
    if (!file || readOnly) return;
    setImageUploading(true);
    try {
      const url = await uploadBlogImage(file);
      setFormData(previous => ({
        ...previous,
        featuredImageUrl: url,
        featuredImageAlt: previous.featuredImageAlt || previous.title || file.name.replace(/\.[^.]+$/, ''),
      }));
      toast.success('Featured image uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (readOnly) return;

    setLoading(true);
    try {
      const featuredImage = formData.featuredImageUrl
        ? {
            url: formData.featuredImageUrl,
            alt: formData.featuredImageAlt || formData.title,
          }
        : blog
          ? null
          : undefined;

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim() || undefined,
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        featuredImage,
        category: formData.category.trim() || (blog ? null : undefined),
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean),
        published: formData.published,
        metaTitle: formData.metaTitle.trim() || (blog ? null : undefined),
        metaDescription: formData.metaDescription.trim() || (blog ? null : undefined),
        metaKeywords: formData.metaKeywords
          .split(',')
          .map(keyword => keyword.trim())
          .filter(Boolean),
      };

      const url = blog ? `/api/admin/blogs/${blog._id}` : '/api/admin/blogs';
      const method = blog ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save blog');
      }

      toast.success(blog ? 'Blog updated successfully' : 'Blog created successfully');
      onSave();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    if (!formData.title) return;
    const slug = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setFormData(previous => ({ ...previous, slug }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {readOnly ? 'View Blog Post' : blog ? 'Edit Blog Post' : 'Create Blog Post'}
          </DialogTitle>
          <DialogDescription>
            {readOnly
              ? 'View the story exactly as it is stored in the CMS.'
              : 'Write, format, add images and publish from one editor.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                placeholder="Enter blog title"
                required
                disabled={readOnly}
                maxLength={200}
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <div className="flex gap-2">
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(event) => setFormData({ ...formData, slug: event.target.value })}
                  placeholder="blog-post-slug (auto-generated if empty)"
                  disabled={readOnly}
                  maxLength={250}
                />
                {!readOnly && (
                  <Button type="button" variant="outline" onClick={generateSlug}>
                    Generate
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(event) => setFormData({ ...formData, excerpt: event.target.value })}
                placeholder="Short description shown on blog cards and search results"
                required
                disabled={readOnly}
                maxLength={500}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div>
                <Label>Article content *</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Use the toolbar for headings, lists, links and inline images. Preview before publishing.
                </p>
              </div>
              <MarkdownEditor
                value={formData.content}
                onChange={(content) => setFormData(previous => ({ ...previous, content }))}
                disabled={readOnly}
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-5">
            <div>
              <h3 className="font-semibold">Featured image</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload JPEG, PNG, WebP or AVIF. The file is stored in the dedicated blog-images storage area.
              </p>
            </div>

            {formData.featuredImageUrl && (
              <div className="relative aspect-[3/2] max-w-xl overflow-hidden rounded-lg border bg-secondary">
                <BlogImage
                  src={formData.featuredImageUrl}
                  alt={formData.featuredImageAlt || formData.title || 'Blog featured image'}
                  sizes="(max-width: 768px) 100vw, 640px"
                  contain
                />
              </div>
            )}

            {!readOnly && (
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={imageUploading}
                    onChange={(event) => handleFeaturedImageUpload(event.target.files?.[0])}
                  />
                  <span className="inline-flex h-10 items-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                    {imageUploading
                      ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      : <ImagePlus className="mr-2 h-4 w-4" />}
                    {formData.featuredImageUrl ? 'Replace image' : 'Upload image'}
                  </span>
                </label>
                {formData.featuredImageUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setFormData(previous => ({ ...previous, featuredImageUrl: '', featuredImageAlt: '' }))}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            )}

            <div className="max-w-xl">
              <Label htmlFor="featuredImageAlt">Image alt text</Label>
              <Input
                id="featuredImageAlt"
                value={formData.featuredImageAlt}
                onChange={(event) => setFormData({ ...formData, featuredImageAlt: event.target.value })}
                placeholder="Describe the image for accessibility and search"
                disabled={readOnly}
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-5">
            <h3 className="font-semibold">Categorization</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                  placeholder="e.g. Ordering guide"
                  disabled={readOnly}
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(event) => setFormData({ ...formData, tags: event.target.value })}
                  placeholder="Separate tags with commas"
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-5">
            <h3 className="font-semibold">SEO settings</h3>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="metaTitle">Meta title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(event) => setFormData({ ...formData, metaTitle: event.target.value })}
                  placeholder="SEO title (defaults to blog title)"
                  disabled={readOnly}
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="metaDescription">Meta description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(event) => setFormData({ ...formData, metaDescription: event.target.value })}
                  placeholder="SEO description for search engines"
                  disabled={readOnly}
                  maxLength={300}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="metaKeywords">Meta keywords</Label>
                <Input
                  id="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={(event) => setFormData({ ...formData, metaKeywords: event.target.value })}
                  placeholder="Separate keywords with commas"
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 border-t pt-5">
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(published) => setFormData({ ...formData, published })}
              disabled={readOnly}
            />
            <Label htmlFor="published" className="cursor-pointer">
              Published {formData.published && '(visible to public)'}
            </Label>
          </div>

          {!readOnly && (
            <div className="flex justify-end space-x-2 border-t pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading || imageUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || imageUploading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {blog ? 'Update' : 'Create'} Blog Post
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
