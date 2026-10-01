'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';

import { Search, ArrowRight } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';

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

export function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });

  // Debounce search to reduce API calls
  const debouncedSearch = useDebounce(search, 300);

  const fetchBlogs = useCallback(async (searchTerm: string, pageNum: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
      });

      const res = await fetch(`/api/blogs?${params}`);
      if (!res.ok) throw new Error('Failed to fetch blogs');

      const data: BlogsResponse = await res.json();
      setBlogs(data.blogs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs(debouncedSearch, page);
  }, [page, debouncedSearch, fetchBlogs]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-16">
      {/* Search - Premium styled */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-xl border-b border-zinc-200 focus-within:border-emerald-900 transition-colors duration-300">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Search the archives..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 pr-0 py-4 text-xl font-sans text-zinc-900 border-none shadow-none focus:ring-0 bg-transparent placeholder:text-zinc-300 placeholder:font-sans"
          />
        </div>
      </div>

      {/* Blog Grid - Premium styled */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col animate-pulse">
              <div className="w-full aspect-[4/3] bg-background mb-6" />
              <div className="h-4 bg-background w-24 mb-4" />
              <div className="h-8 bg-background w-full mb-3" />
              <div className="h-4 bg-background w-2/3" />
            </div>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-12 border-y border-zinc-100">
          <p className="text-xl font-sans text-muted-foreground not-italic">
            {search ? 'No archives found matching your query.' : 'The journal is currently empty.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {blogs.map((blog) => (
              <Link href={`/blog/${blog.slug}`} key={blog._id} className="group cursor-pointer">
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-background mb-6">
                  {blog.featuredImage?.url && (
                    <Image
                      src={blog.featuredImage.url}
                      alt={blog.featuredImage.alt || blog.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-secondary group-hover:bg-secondary transition-colors duration-500" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs font-bold normal-case text-emerald-900">
                    {blog.category || 'Feature'}
                    <span className="text-zinc-300">•</span>
                    <span className="text-zinc-500">{formatDate(blog.publishedAt)}</span>
                  </div>

                  <h3 className="text-2xl font-sans font-medium text-zinc-900 group-hover:text-emerald-800 transition-colors leading-tight">
                    {blog.title}
                  </h3>

                  <p className="text-zinc-500 font-normal leading-relaxed line-clamp-3">
                    {blog.excerpt}
                  </p>

                  <div className="pt-4 flex items-center text-xs font-bold normal-case text-zinc-900 group-hover:text-emerald-700 transition-colors">
                    Read Article <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination - Minimalist */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-8 mt-10 pt-6 border-t border-zinc-100">
              <Button
                variant="ghost"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="text-zinc-900 hover:text-emerald-700 hover:bg-transparent normal-case text-xs font-bold disabled:opacity-30"
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
                className="text-zinc-900 hover:text-emerald-700 hover:bg-transparent normal-case text-xs font-bold disabled:opacity-30"
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
