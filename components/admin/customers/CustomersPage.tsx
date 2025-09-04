'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, ListOrdered } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CustomerDialog } from './CustomerDialog';
import { toast } from 'sonner';

// Admin Customer stored in our Customer collection
type AdminCustomer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders?: number;
  totalSpent?: number;
  createdAt: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
};

// Fallback user mapped from Users collection when Customer collection is empty
type FallbackUserCustomer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders?: number;
  totalSpent?: number;
  createdAt: string;
  address?: {
    city: string;
    state: string;
    country: string;
  };
  source: 'user';
};

type ListCustomer = (AdminCustomer & { source?: 'customer' }) | FallbackUserCustomer;

interface CustomersResponse {
  customers: ListCustomer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function CustomersPage() {
  const [customers, setCustomers] = useState<ListCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<AdminCustomer | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/customers?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data: CustomersResponse = await response.json();
      setCustomers(data.customers);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleEdit = (customer: ListCustomer) => {
    if (customer.source === 'user') return; // cannot edit fallback users
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleView = (customer: ListCustomer) => {
    if (customer.source === 'user') return;
    setEditingCustomer(customer);
    setIsViewOpen(true);
  };

  const handleDelete = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }

      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    }
  };

  const handleCustomerSaved = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
    fetchCustomers();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-2">Manage your customer base</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            View and manage all registered customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{customer.name}</span>
                          {customer.source === 'user' && (
                            <Badge variant="outline">App user</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || '-'}</TableCell>
                      <TableCell>
                        {customer.address ? 
                          `${customer.address.city}, ${customer.address.state}` : 
                          '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {customer.totalOrders || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(customer.totalSpent || 0)}
                      </TableCell>
                      <TableCell>
                        {formatDate(customer.createdAt)}
                      </TableCell>
                      <TableCell>
                        {customer.source !== 'user' ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(customer)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              {'_id' in customer && (
                                <Link href={`/admin/orders?customerId=${customer._id}`}>
                                  <DropdownMenuItem>
                                    <ListOrdered className="h-4 w-4 mr-2" />
                                    View Orders
                                  </DropdownMenuItem>
                                </Link>
                              )}
                              <DropdownMenuItem onClick={() => handleEdit(customer)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(customer._id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {customers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No customers found
                </div>
              )}

              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} customers
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

      <CustomerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customer={editingCustomer}
        onSave={handleCustomerSaved}
      />
      <CustomerDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        customer={editingCustomer}
        onSave={handleCustomerSaved}
        readOnly
      />
    </div>
  );
}
