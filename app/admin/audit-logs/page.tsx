"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Search, FileText } from 'lucide-react';
import Spinner from '@/components/spinner';

interface Activity {
  _id: string;
  type: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  orderId?: string;
  productId?: string;
  log?: {
    ip?: string;
    userAgent?: string;
    [key: string]: unknown;
  };
}

interface Pagination { page: number; limit: number; total: number; pages: number }

export default function AuditLogsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });

  const [resourceType, setResourceType] = useState<string>(searchParams.get('resourceType') || '');
  const [action, setAction] = useState<string>(searchParams.get('action') || '');
  const [userId, setUserId] = useState<string>(searchParams.get('userId') || '');
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');

  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || '20');
  const resourceTypeSelectValue = resourceType === '' ? 'all' : resourceType;

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (resourceType) params.set('resourceType', resourceType);
        if (action) params.set('action', action);
        if (userId) params.set('userId', userId);
        if (search) params.set('search', search);
        const res = await fetch(`/api/admin/activities?${params.toString()}`, { credentials: 'include', signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setActivities(data.activities || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
      } catch (e) {
        if ((e as { name?: string } | undefined)?.name === 'AbortError') return;
        setError('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [page, limit, resourceType, action, userId, search]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', String(limit));
    if (resourceType) params.set('resourceType', resourceType);
    if (action) params.set('action', action);
    if (userId) params.set('userId', userId);
    if (search) params.set('search', search);
    router.push(`/admin/audit-logs?${params.toString()}`);
  };

  const clearFilters = () => {
    setResourceType('');
    setAction('');
    setUserId('');
    setSearch('');
    router.push('/admin/audit-logs');
  };

  const onPageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    params.set('limit', String(limit));
    router.push(`/admin/audit-logs?${params.toString()}`);
  };

  const badgeFor = (t: string) => {
    if (t.includes('customer')) return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{t}</Badge>;
    if (t.includes('order')) return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{t}</Badge>;
    if (t.includes('product')) return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">{t}</Badge>;
    return <Badge variant="secondary">{t}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-gray-600">Track changes and actions performed by admins.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-4 w-4"/> Filters</CardTitle>
          <CardDescription>Filter logs by resource type, action, user, or search.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-1">
              <label className="text-xs text-gray-600">Resource Type</label>
        <Select value={resourceTypeSelectValue} onValueChange={(v) => setResourceType(v === 'all' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="All"/></SelectTrigger>
                <SelectContent>
          <SelectItem value="all">All</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="supplier">Supplier</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="auth">Auth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <label className="text-xs text-gray-600">Action</label>
              <Input value={action} onChange={(e) => setAction(e.target.value)} placeholder="create, update, delete..."/>
            </div>
            <div className="md:col-span-1">
              <label className="text-xs text-gray-600">User ID</label>
              <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Mongo ObjectId"/>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">Search</label>
              <div className="flex gap-2">
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search action, resource, IP..."/>
                <Button onClick={applyFilters} variant="default"><Search className="h-4 w-4"/></Button>
                <Button onClick={clearFilters} variant="outline">Reset</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4"/> Logs</CardTitle>
          <CardDescription>{pagination.total} result(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>User Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
        {loading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
          <div className="flex items-center gap-2 text-sm text-gray-600"><Spinner /> Loading...</div>
                    </TableCell>
                  </TableRow>
                ) : activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="text-sm text-gray-600">No activities found.</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  activities.map((a) => (
                    <TableRow key={a._id}>
                      <TableCell className="whitespace-nowrap">{new Date(a.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="whitespace-nowrap">{a.userName || a.userId || '—'}</TableCell>
                      <TableCell className="whitespace-nowrap">{badgeFor(a.type)}</TableCell>
                      <TableCell className="max-w-[520px]"><div className="truncate" title={a.description}>{a.description}</div></TableCell>
                      <TableCell className="whitespace-nowrap">{a.log?.ip || '—'}</TableCell>
                      <TableCell className="max-w-[240px]"><div className="truncate" title={a.log?.userAgent || ''}>{a.log?.userAgent || '—'}</div></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-gray-600">Page {pagination.page} of {pagination.pages} • {pagination.total} total</div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>Prev</Button>
              <Button variant="outline" disabled={pagination.page >= pagination.pages} onClick={() => onPageChange(pagination.page + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
