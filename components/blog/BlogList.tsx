'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Calendar, Eye, ArrowRight } from 'lucide-react';
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
    <div className="space-y-10">
      {/* Search - Premium styled */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-14 pr-6 py-6 text-base border-gray-200 rounded-full shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
          />
        </div>
      </div>

      {/* Blog Grid - Premium styled */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="flex flex-col animate-pulse border border-gray-100 rounded-xl overflow-hidden">
              <div className="w-full h-52 bg-gray-100" />
              <CardHeader className="pb-3">
                <div className="h-5 bg-gray-100 rounded-full w-20 mb-3" />
                <div className="h-6 bg-gray-100 rounded w-4/5" />
              </CardHeader>
              <CardContent className="flex-1 pt-0">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded" />
                  <div className="h-4 bg-gray-100 rounded w-4/5" />
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-50 pt-4">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg text-gray-500">
            {search ? 'No articles found matching your search.' : 'No articles available yet.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {blogs.map((blog) => (
              <Card key={blog._id} className="flex flex-col border border-gray-100 rounded-xl overflow-hidden bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group">
                {blog.featuredImage?.url && (
                  <div className="relative w-full h-52 overflow-hidden bg-gray-50">
                    <Image
                      src={blog.featuredImage.url}
                      alt={blog.featuredImage.alt || blog.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    {blog.category && (
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium text-xs px-3 py-1 rounded-full">
                        {blog.category}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors leading-snug">
                    <Link href={`/blog/${blog.slug}`}>
                      {blog.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 pt-0">
                  <CardDescription className="line-clamp-3 text-gray-500 leading-relaxed">
                    {blog.excerpt}
                  </CardDescription>
                </CardContent>
                
                <CardFooter className="flex justify-between items-center text-sm text-gray-400 border-t border-gray-50 pt-4">
                  <div className="flex items-center gap-4">
                    {blog.publishedAt && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(blog.publishedAt)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      <span>{blog.views}</span>
                    </div>
                  </div>
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
                  >
                    Read
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination - Premium styled */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-12">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="rounded-full px-6 border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500 px-4">
                Page {page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page >= pagination.pages}
                className="rounded-full px-6 border-gray-200 hover:bg-gray-50 disabled:opacity-50"
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
