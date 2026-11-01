'use client';

import { useState, useEffect } from 'react';
import JournalCard from './JournalCard';
import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';

import { Search } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import type { JournalPage } from '@/models/journal';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: {
    url: string;
    alt?: string;
  };
  category?: string;
  tags: string[];
  publishedAt?: string;
  views: number;
  authorName?: string;
}

interface BlogsResponse {
  blogs: Blog[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export function BlogList({ initialData, featuredSlug }: { initialData?: JournalPage | null; featuredSlug?: string }) {
  const [blogs, setBlogs] = useState<JournalPage['blogs']>(initialData?.blogs || []);
  const [loading, setLoading] = useState(!initialData);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(initialData?.pagination || { page: 1, limit: 12, total: 0, pages: 0 });

  // Debounce search to reduce API calls
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (initialData && page === 1 && !debouncedSearch && retry === 0) { setBlogs(initialData.blogs); setPagination(initialData.pagination); setLoading(false); setError(false); return; }
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const params = new URLSearchParams({ page: String(page), limit: '12', ...(debouncedSearch && { search: debouncedSearch }) });
        const response = await fetch(`/api/blogs?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Failed to fetch blog');
        const data: BlogsResponse = await response.json();
        if (!controller.signal.aborted) { setBlogs(data.blogs); setPagination(data.pagination); }
      } catch (error) {
        if (!controller.signal.aborted) { console.error('Failed to fetch blog:', error); setError(true); }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [page, debouncedSearch, retry, initialData]);

  const visibleBlogs = page === 1 && !debouncedSearch.trim() && featuredSlug
    ? blogs.filter((blog) => blog.slug !== featuredSlug)
    : blogs;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-5 border-b border-brand-green/15 pb-8">
        <div className="relative w-full max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-green h-5 w-5" aria-hidden="true" />
          <Input
            type="search"
            aria-label="Search journal stories"
            placeholder="Search stories and guides"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-14 rounded-2xl border border-brand-green/20 bg-white pl-12 pr-5 text-base text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-brand-green"
          />
        </div>
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">{loading ? "Finding stories…" : pagination.total + " " + (pagination.total === 1 ? "story" : "stories") + (debouncedSearch.trim() ? " found" : " published")}</p>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col animate-pulse rounded-2xl border border-brand-green/10 bg-white p-3 motion-reduce:animate-none">
              <div className="mb-6 aspect-[3/2] w-full rounded-xl bg-secondary" />
              <div className="h-4 bg-background w-24 mb-4" />
              <div className="h-8 bg-background w-full mb-3" />
              <div className="h-4 bg-background w-2/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <section role="alert" className="rounded-2xl border border-brand-green/10 bg-white px-6 py-12 text-center">
          <h3 className="font-heading text-2xl font-semibold text-brand-green-deep">We couldn’t load the stories.</h3>
          <p className="mt-3 text-sm text-muted-foreground">Please try again in a moment.</p>
          <Button className="mt-6" onClick={() => setRetry(value => value + 1)}>Try again</Button>
        </section>
      ) : visibleBlogs.length === 0 ? (
        <div className="rounded-2xl border border-brand-green/10 bg-white px-6 py-12 text-center">
          <p className="text-xl font-sans text-muted-foreground not-italic">
            {search ? 'No stories match your search. Try a shorter phrase.' : 'More stories are on their way. Explore the practical guides above.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleBlogs.map(blog => <JournalCard key={blog._id} post={{ ...blog, id: blog._id }} headingLevel="h3" />)}
          </div>

          {/* Pagination - Minimalist */}
          {pagination.pages > 1 && (
            <nav aria-label="Journal pages" className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-brand-green/15 pt-7">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="min-w-28 text-sm font-semibold"
              >
                Previous
              </Button>
              <span aria-live="polite" className="text-sm font-medium tabular-nums text-brand-green-deep">Page {page} of {pagination.pages}</span>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page >= pagination.pages}
                className="min-w-28 text-sm font-semibold"
              >
                Next
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
