'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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

export function BlogDialog({ open, onOpenChange, blog, onSave, readOnly }: BlogDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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
  });

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
      setFormData({
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
      });
    }
  }, [blog, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim() || undefined,
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        featuredImage: formData.featuredImageUrl ? {
          url: formData.featuredImageUrl,
          alt: formData.featuredImageAlt || formData.title,
        } : undefined,
        category: formData.category.trim() || undefined,
        tags: formData.tags
          .split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0),
        published: formData.published,
        metaTitle: formData.metaTitle.trim() || undefined,
        metaDescription: formData.metaDescription.trim() || undefined,
        metaKeywords: formData.metaKeywords
          .split(',')
          .map(k => k.trim())
          .filter(k => k.length > 0),
      };

      const url = blog ? `/api/admin/blogs/${blog._id}` : '/api/admin/blogs';
      const method = blog ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
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
    setFormData(prev => ({ ...prev, slug }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {readOnly ? 'View Blog Post' : blog ? 'Edit Blog Post' : 'Create Blog Post'}
          </DialogTitle>
          <DialogDescription>
            {readOnly 
              ? 'View blog post details' 
              : blog 
                ? 'Update blog post information' 
                : 'Fill in the details to create a new blog post'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Short description of the blog post"
                  required
                  disabled={readOnly}
                  maxLength={500}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your blog content here (supports Markdown)"
                  required
                  disabled={readOnly}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">Featured Image</h3>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="featuredImageUrl">Image URL</Label>
                <Input
                  id="featuredImageUrl"
                  value={formData.featuredImageUrl}
                  onChange={(e) => setFormData({ ...formData, featuredImageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  disabled={readOnly}
                  type="url"
                />
              </div>
              <div>
                <Label htmlFor="featuredImageAlt">Image Alt Text</Label>
                <Input
                  id="featuredImageAlt"
                  value={formData.featuredImageAlt}
                  onChange={(e) => setFormData({ ...formData, featuredImageAlt: e.target.value })}
                  placeholder="Description of the image"
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>

          {/* Categorization */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">Categorization</h3>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Recipes, Tips, News"
                  disabled={readOnly}
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Separate tags with commas"
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">SEO Settings</h3>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="SEO title (defaults to blog title)"
                  disabled={readOnly}
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="SEO description for search engines"
                  disabled={readOnly}
                  maxLength={300}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Input
                  id="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                  placeholder="Separate keywords with commas"
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>

          {/* Publishing */}
          <div className="flex items-center space-x-2 pt-4 border-t">
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
              disabled={readOnly}
            />
            <Label htmlFor="published" className="cursor-pointer">
              Published {formData.published && '(visible to public)'}
            </Label>
          </div>

          {/* Actions */}
          {!readOnly && (
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
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
