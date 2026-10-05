'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ProductDialog } from '@/components/admin/products/ProductDialog';
import { toast } from 'sonner';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  stockQty: number;
  minStockLevel?: number;
  archived?: boolean;
  createdAt: string;
}

interface ProductsResponse {
  products: Product[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '20', ...(search && { search }) });
      const res = await authenticatedApiFetch(`/api/admin/products?${params}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data: ProductsResponse = await res.json();
      setItems(data.products);
      setPagination(data.pagination);
    } catch {
  toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEdit = (p: Product) => { setEditing(p); setIsDialogOpen(true); };
  const handleView = (p: Product) => { setEditing(p); setIsViewOpen(true); };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await authenticatedApiFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed');
      }
      toast.success('Product deleted');
      fetchItems();
  } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete product');
    }
  };

  const handleSaved = () => { setIsDialogOpen(false); setEditing(null); fetchItems(); };

  const currency = (v: number) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(v);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-normal text-foreground">Products</h1>
          <p className="text-muted-foreground mt-2">Manage products and inventory</p>
        </div>
  <Button onClick={() => { setEditing(null); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>View and manage products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.sku}</TableCell>
                      <TableCell>{currency(p.price)}</TableCell>
                      <TableCell>
                        <Badge variant={p.stockQty <= (p.minStockLevel ?? 5) ? 'destructive' : 'secondary'}>
                          {p.stockQty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.archived ? 'outline' : 'secondary'}>{p.archived ? 'Archived' : 'Active'}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(p)}>
                              <Eye className="h-4 w-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(p)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(p._id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {items.length === 0 && <div className="text-center py-8 text-muted-foreground">No products found</div>}

              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
                  </div>
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

  <ProductDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} product={editing} onSave={handleSaved} />
  <ProductDialog open={isViewOpen} onOpenChange={setIsViewOpen} product={editing} onSave={handleSaved} readOnly />
    </div>
  );
}
