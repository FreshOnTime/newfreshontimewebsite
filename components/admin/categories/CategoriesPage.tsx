'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, MoreHorizontal, Edit, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CategoryDialog } from '@/components/admin/categories/CategoryDialog';
import { toast } from 'sonner';

interface Category { _id: string; name: string; slug: string; isActive: boolean; sortOrder: number; createdAt: string; }
interface CategoriesResponse { categories: Category[]; pagination: { page: number; limit: number; total: number; pages: number } }

export function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '20', ...(search && { search }) });
      const res = await fetch(`/api/admin/categories?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const data: CategoriesResponse = await res.json();
      setItems(data.categories);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const saved = () => { setOpen(false); setEditing(null); fetchItems(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-2">Manage product categories</p>
        </div>
  <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category List</CardTitle>
          <CardDescription>Organize your catalog</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search categories..." value={search} onChange={(e)=>{ setSearch(e.target.value); setPage(1); }} className="pl-10" />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sort</TableHead>
                    <TableHead className="w-[70px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((c) => (
                    <TableRow key={c._id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.slug}</TableCell>
                      <TableCell>{c.isActive ? 'Active' : 'Inactive'}</TableCell>
                      <TableCell>{c.sortOrder}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditing(c); setIsViewOpen(true);} }>
                              <Eye className="h-4 w-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setEditing(c); setOpen(true);} }>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            {/* Optional: Delete category endpoint could be added later */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {items.length === 0 && <div className="text-center py-8 text-gray-500">No categories yet</div>}

              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} categories</div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page <= 1}>Previous</Button>
                    <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page >= pagination.pages}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CategoryDialog open={open} onOpenChange={setOpen} category={editing} onSave={saved} />
  <CategoryDialog open={isViewOpen} onOpenChange={setIsViewOpen} category={editing} onSave={saved} readOnly />
    </div>
  );
}
