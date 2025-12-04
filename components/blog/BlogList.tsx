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
    <div className="space-y-8">
      {/* Search */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search blog posts..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-12 py-6 text-lg"
          />
        </div>
      </div>

      {/* Blog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="flex flex-col animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-t-lg" />
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600">
            {search ? 'No blog posts found matching your search.' : 'No blog posts available yet.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Card key={blog._id} className="flex flex-col hover:shadow-lg transition-shadow">
                {blog.featuredImage?.url && (
                  <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={blog.featuredImage.url}
                      alt={blog.featuredImage.alt || blog.title}
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {blog.category && (
                      <Badge variant="secondary">{blog.category}</Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 hover:text-green-600 transition-colors">
                    <Link href={`/blog/${blog.slug}`}>
                      {blog.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <CardDescription className="line-clamp-3">
                    {blog.excerpt}
                  </CardDescription>
                </CardContent>
                
                <CardFooter className="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
                  <div className="flex items-center gap-4">
                    {blog.publishedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(blog.publishedAt)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{blog.views}</span>
                    </div>
                  </div>
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                  >
                    Read More
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page >= pagination.pages}
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
