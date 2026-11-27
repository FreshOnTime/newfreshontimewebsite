"use client";

import { readWorkspace } from '@/lib/api/workspace-read';
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

  const page = Math.max(1,Math.min(100000,Math.floor(Number(searchParams.get('page')))||1));
  const limit = Math.max(1,Math.min(100,Math.floor(Number(searchParams.get('limit')))||20));
  const applied=searchParams.toString();
  const [version,setVersion]=useState(0);
  const resourceTypeSelectValue = resourceType === '' ? 'all' : resourceType;
  useEffect(()=>{const p=new URLSearchParams(applied);setResourceType(p.get('resourceType')||'');setAction(p.get('action')||'');setUserId(p.get('userId')||'');setSearch(p.get('search')||'');},[applied]);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams(applied);
        params.set('page',String(page));params.set('limit',String(limit));
        const data=await readWorkspace<{activities:Activity[];pagination:Pagination}>(`/api/admin/activities?${params}`,controller.signal);
        if(controller.signal.aborted)return;
        if(page>data.pagination.pages){const next=new URLSearchParams(applied);next.set('page',String(data.pagination.pages));router.replace('/admin/audit-logs?'+next.toString());return;}
        setActivities(data.activities || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(e instanceof Error?e.message:'Failed to load audit logs');
      } finally {
        if(!controller.signal.aborted)setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [page, limit, applied,version,router]);

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
    if (t.includes('customer')) return <Badge className="bg-secondary text-brand-green hover:bg-secondary">{t}</Badge>;
    if (t.includes('order')) return <Badge className="bg-secondary text-brand-green hover:bg-secondary">{t}</Badge>;
    if (t.includes('product')) return <Badge className="bg-secondary text-brand-green hover:bg-secondary">{t}</Badge>;
    return <Badge variant="secondary">{t}</Badge>;
  };

  return (
    <div className="space-y-6">
      <header className="fp-workspace-hero"><p>FreshPick / Administration</p><h1>Audit trail.</h1><p>Review recorded administrative actions, separate from account notifications.</p></header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-4 w-4"/> Filters</CardTitle>
          <CardDescription>Filter logs by resource type, action, user, or search.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-1">
              <label className="text-xs text-muted-foreground">Resource Type</label>
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
                  <SelectItem value="auth">Authentication</SelectItem><SelectItem value="notification">Notifications</SelectItem><SelectItem value="blog">Journal articles</SelectItem><SelectItem value="discovery_content">Food &amp; culture</SelectItem><SelectItem value="discovery_prospect">External listings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <label className="text-xs text-muted-foreground">Action</label>
              <Input value={action} onChange={(e) => setAction(e.target.value)} maxLength={200} placeholder="create, update, delete..."/>
            </div>
            <div className="md:col-span-1">
              <label className="text-xs text-muted-foreground">User ID</label>
              <Input value={userId} onChange={(e) => setUserId(e.target.value)} maxLength={200} placeholder="Account ID"/>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Search</label>
              <div className="flex gap-2">
                <Input value={search} onChange={(e) => setSearch(e.target.value)} maxLength={200} placeholder="Search action, resource, IP..."/>
                <Button onClick={applyFilters} aria-label="Apply audit filters" variant="default"><Search className="h-4 w-4"/></Button>
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
          {error && <div role="alert" className="text-red-600 text-sm mb-3">{error}<button className="ml-3 min-h-11 underline" onClick={()=>setVersion(v=>v+1)}>Try again</button></div>}
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> Loading...</div>
                    </TableCell>
                  </TableRow>
                ) : error ? <TableRow><TableCell colSpan={6}>Audit logs unavailable. Retry to load the records.</TableCell></TableRow> : activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="text-sm text-muted-foreground">No activities found.</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  activities.map((a) => (
                    <TableRow key={a._id}>
                      <TableCell className="whitespace-nowrap">{new Date(a.timestamp).toLocaleString('en-LK',{timeZone:'Asia/Colombo'})}</TableCell>
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
            <div className="text-xs text-muted-foreground">Page {pagination.page} of {pagination.pages} • {pagination.total} total</div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={loading||pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>Prev</Button>
              <Button variant="outline" disabled={loading||pagination.page >= pagination.pages} onClick={() => onPageChange(pagination.page + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
