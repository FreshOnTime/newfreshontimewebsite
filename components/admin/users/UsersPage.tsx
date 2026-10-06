'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { UserDialog } from '@/components/admin/users/UserDialog';

type IUser = {
  _id: string;
  userId: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  role: string;
  isBanned?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
};

interface UsersResponse {
  users: IUser[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export function UsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [readOnlyOpen, setReadOnlyOpen] = useState(false);
  const [editing, setEditing] = useState<IUser | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(search ? { search } : {}),
        ...(role ? { role } : {}),
      });
      const res = await fetch(`/api/admin/users?${params}`, { credentials: 'include' });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error || 'Failed to fetch users');

      const data = response as UsersResponse;
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, role]);

  const onSaved = () => {
    setIsDialogOpen(false);
    setEditing(null);
    fetchUsers();
  };

  const roles = useMemo(
    () => [
      'customer',
      'supplier',
      'admin',
      'manager',
      'delivery_staff',
      'customer_support',
      'marketing_specialist',
      'order_processor',
      'inventory_manager',
    ],
    []
  );

  const deleteUser = async (user: IUser) => {
    if (!confirm(`Delete ${user.firstName} ${user.lastName || ''}? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error || 'Delete failed');

      toast.success('User deleted');
      if (users.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        fetchUsers();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-normal text-foreground">Users</h1>
          <p className="mt-2 text-muted-foreground">
            Manage every account on the platform, including customers, suppliers, staff and administrators.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add user
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
          <CardDescription>
            {pagination.total} account{pagination.total === 1 ? '' : 's'} across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name, email, phone or account ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">All roles</option>
              {roles.map((item) => (
                <option key={item} value={item}>
                  {item.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[70px]">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="max-w-[150px] truncate font-mono text-xs" title={user.userId}>
                        {user.userId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName || ''}
                      </TableCell>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>{user.phoneNumber || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.role.replaceAll('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.isBanned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge>Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open user actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditing(user);
                                setReadOnlyOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditing(user);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => deleteUser(user)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {users.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">No users found</div>
              )}

              {pagination.pages > 1 && (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage((current) => current - 1)}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage((current) => current + 1)}
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

      <UserDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditing(null);
        }}
        user={editing ?? undefined}
        onSave={onSaved}
      />
      <UserDialog
        open={readOnlyOpen}
        onOpenChange={(open) => {
          setReadOnlyOpen(open);
          if (!open) setEditing(null);
        }}
        user={editing ?? undefined}
        onSave={onSaved}
        readOnly
      />
    </div>
  );
}
