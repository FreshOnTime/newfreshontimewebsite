'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BlogDialog } from '@/components/admin/blogs/BlogDialog';
import { toast } from 'sonner';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category?: string;
  tags: string[];
  published: boolean;
  publishedAt?: string;
  views: number;
  likes: number;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
}

interface BlogsResponse {
  blogs: Blog[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export function BlogsPage() {
  const [items, setItems] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [viewMode, setViewMode] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ 
        page: String(page), 
        limit: '20', 
        ...(search && { search }) 
      });
      const res = await fetch(`/api/admin/blogs?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch blogs');
      const data: BlogsResponse = await res.json();
      setItems(data.blogs);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchItems(); 
  }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEdit = (blog: Blog) => { 
    setEditing(blog); 
    setViewMode(false);
    setIsDialogOpen(true); 
  };
  
  const handleView = (blog: Blog) => { 
    setEditing(blog); 
    setViewMode(true);
    setIsDialogOpen(true); 
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { 
        method: 'DELETE', 
        credentials: 'include' 
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Blog deleted successfully');
      fetchItems();
    } catch {
      toast.error('Failed to delete blog');
    }
  };

  const handleSaved = () => { 
    setIsDialogOpen(false); 
    setEditing(null); 
    setViewMode(false);
    fetchItems(); 
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-2">Create and manage blog content</p>
        </div>
        <Button onClick={() => { 
          setEditing(null); 
          setViewMode(false);
          setIsDialogOpen(true); 
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Blog Post
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
          <CardDescription>View and manage all blog posts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search blogs..." 
                value={search} 
                onChange={(e) => { 
                  setSearch(e.target.value); 
                  setPage(1); 
                }} 
                className="pl-10" 
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[250px]">Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead className="w-[70px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((blog) => (
                      <TableRow key={blog._id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{blog.title}</div>
                            <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {blog.excerpt}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {blog.category ? (
                            <Badge variant="outline">{blog.category}</Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">Uncategorized</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={blog.published ? 'default' : 'secondary'}>
                            {blog.published ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{blog.views}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDate(blog.publishedAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{blog.authorName || 'Unknown'}</span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(blog)}>
                                <Eye className="h-4 w-4 mr-2" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(blog)}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(blog._id)} 
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {items.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No blog posts found. Create your first post to get started!
                </div>
              )}

              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} blog posts
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setPage(page - 1)} 
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setPage(page + 1)} 
                      disabled={page >= pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <BlogDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        blog={editing} 
        onSave={handleSaved}
        readOnly={viewMode}
      />
    </div>
  );
}
