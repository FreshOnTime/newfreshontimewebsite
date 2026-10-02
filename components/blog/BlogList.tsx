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

export function BlogList({ initialData }: { initialData?: JournalPage | null }) {
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
        if (!response.ok) throw new Error('Failed to fetch journal');
        const data: BlogsResponse = await response.json();
        if (!controller.signal.aborted) { setBlogs(data.blogs); setPagination(data.pagination); }
      } catch (error) {
        if (!controller.signal.aborted) { console.error('Failed to fetch journal:', error); setError(true); }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [page, debouncedSearch, retry, initialData]);

  return (
    <div className="space-y-16">
      {/* Search - Premium styled */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-xl border-b border-border focus-within:border-primary transition-colors duration-300">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            aria-label="Search the journal"
            placeholder="Search stories"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 pr-0 py-4 text-xl font-sans text-foreground border-none shadow-none focus:ring-0 bg-transparent placeholder:text-muted-foreground placeholder:font-sans"
          />
        </div>
      </div>

      {/* Blog Grid - Premium styled */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col animate-pulse">
              <div className="w-full aspect-[4/3] bg-secondary mb-6" />
              <div className="h-4 bg-background w-24 mb-4" />
              <div className="h-8 bg-background w-full mb-3" />
              <div className="h-4 bg-background w-2/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <section role="alert" className="border-y border-border py-12 text-center">
          <h2 className="text-xl">We couldn’t load the journal.</h2>
          <p className="mt-3 text-sm text-muted-foreground">Please try again in a moment.</p>
          <Button className="mt-6" onClick={() => setRetry(value => value + 1)}>Try again</Button>
        </section>
      ) : blogs.length === 0 ? (
        <div className="text-center py-12 border-y border-border">
          <p className="text-xl font-sans text-muted-foreground not-italic">
            {search ? 'No stories match your search.' : 'The journal is currently empty.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {blogs.map(blog => <JournalCard key={blog._id} post={{ ...blog, id: blog._id }} headingLevel="h2" />)}
          </div>

          {/* Pagination - Minimalist */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-8 mt-10 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="text-foreground hover:text-brand-green hover:bg-transparent normal-case text-xs font-bold disabled:opacity-30"
              >
                Previous
              </Button>
              <span className="font-sans text-lg text-muted-foreground not-italic">
                {page} / {pagination.pages}
              </span>
              <Button
                variant="ghost"
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page >= pagination.pages}
                className="text-foreground hover:text-brand-green hover:bg-transparent normal-case text-xs font-bold disabled:opacity-30"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
