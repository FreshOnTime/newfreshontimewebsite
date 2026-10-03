'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Inbox, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { enquiryStatuses, enquirySources, enquiryTypes, enquiryStatusLabels, enquirySourceLabels, enquiryReference, type Enquiry, type EnquiryStatus } from '@/lib/contactEnquiries';

function EnquiryCard({ enquiry, onSaved }: { enquiry: Enquiry; onSaved: () => void }) {
  const [status, setStatus] = useState(enquiry.status);
  const [notes, setNotes] = useState(enquiry.internalNotes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const changed = status !== enquiry.status || notes !== enquiry.internalNotes;
  async function save(event: FormEvent) {
    event.preventDefault();
    if (saving || !changed) return;
    setSaving(true); setError('');
    try {
      const response = await apiFetch('/api/admin/enquiries', { method: 'PATCH', body: JSON.stringify({ id: enquiry.id, version: enquiry.version, status, internalNotes: notes }) });
      const data = await response.json();
      if (!response.ok || !data.enquiry) throw new Error(data.error || 'Unable to save this enquiry.');
      onSaved();
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to save this enquiry.'); }
    finally { setSaving(false); }
  }
  return <Card>
    <CardHeader className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3"><p className="text-xs font-semibold text-brand-clay">{enquiryReference(enquiry.id)} · {enquirySourceLabels[enquiry.source]}</p><span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-brand-green">{enquiryStatusLabels[enquiry.status]}</span></div>
      <CardTitle className="break-words text-xl leading-7">{enquiry.subject || 'General enquiry'}</CardTitle>
      <div className="space-y-1 text-sm text-muted-foreground"><p className="break-words">{enquiry.name} · <a href={`mailto:${encodeURIComponent(enquiry.email)}`} className="break-all text-brand-green underline underline-offset-4">{enquiry.email}</a></p><p>{new Date(enquiry.createdAt).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' })} · {enquiry.type} · {enquiry.priority} priority</p>{enquiry.orderId && <p className="break-all">Order reference: {enquiry.orderId}</p>}</div>
    </CardHeader>
    <CardContent><p className="whitespace-pre-wrap break-words rounded-lg bg-secondary/50 p-4 text-sm leading-7">{enquiry.message}</p>
      <form onSubmit={save} className="mt-5 space-y-4"><fieldset disabled={saving} className="min-w-0 space-y-4"><legend className="sr-only">Manage {enquiryReference(enquiry.id)}</legend>
        <label className="flex flex-wrap items-center justify-between gap-3 text-sm font-medium">Enquiry status<select className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm" value={status} onChange={event => setStatus(event.target.value as EnquiryStatus)}>{enquiryStatuses.map(value => <option key={value} value={value}>{enquiryStatusLabels[value]}</option>)}</select></label>
        <label className="block text-sm font-medium">Private admin notes<Textarea className="mt-2 min-h-28" rows={4} maxLength={5000} value={notes} onChange={event => setNotes(event.target.value)} placeholder="Record follow-up details for the team" /></label>
        <p className="text-xs leading-6 text-muted-foreground">Notes stay in the admin inbox. Saving here does not send a reply to the customer.</p>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={!changed || saving} className="min-h-11">{saving ? 'Saving…' : 'Save enquiry'}</Button>
      </fieldset></form>
    </CardContent>
  </Card>;
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [type, setType] = useState('');
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set('status', status);
  if (source) params.set('source', source);
  if (type) params.set('type', type);
  if (search) params.set('q', search);
  const query = params.toString();

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true); setError('');
      try {
        const response = await apiFetch(`/api/admin/enquiries?${query}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.enquiries)) throw new Error(data.error || 'Unable to load enquiries.');
        if (active) { setEnquiries(data.enquiries); setTotal(data.total); setPages(data.pages); }
      } catch (failure) { if (active) setError(failure instanceof Error ? failure.message : 'Unable to load enquiries.'); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; controller.abort(); };
  }, [query, version]);

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-brand-green">Customer & producer support</p><h1 className="mt-2 text-3xl font-semibold">Enquiry inbox</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">Questions submitted through Contact and Our Producers. Review the message, record follow-up and keep its status up to date.</p></div><Button variant="outline" disabled={loading} onClick={() => setVersion(value => value+1)}><RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />Refresh</Button></div>
    <form onSubmit={event => { event.preventDefault(); setPage(1); setSearch(searchText.trim()); setVersion(value => value+1); }} className="flex flex-wrap gap-3"><label className="min-w-0 flex-1"><span className="sr-only">Search enquiries</span><Input value={searchText} onChange={event => setSearchText(event.target.value)} maxLength={200} placeholder="Name, email, subject, message or reference" className="min-h-11 bg-background" /></label><Button type="submit" className="min-h-11">Search</Button></form>
    <div className="flex flex-wrap gap-4">{[
      { label: 'Status', value: status, change: setStatus, choices: enquiryStatuses.map(value => [value,enquiryStatusLabels[value]]) },
      { label: 'Source', value: source, change: setSource, choices: enquirySources.map(value => [value,enquirySourceLabels[value]]) },
      { label: 'Enquiry type', value: type, change: setType, choices: enquiryTypes.map(value => [value,value[0].toUpperCase()+value.slice(1)]) },
    ].map(filter => <label key={filter.label} className="flex items-center gap-2 text-sm font-medium">{filter.label}<select value={filter.value} onChange={event => { setPage(1); filter.change(event.target.value); }} className="min-h-11 rounded-lg border border-border bg-background px-3"> <option value="">All</option>{filter.choices.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>)}</div>
    {loading ? <p role="status" className="py-12 text-center text-muted-foreground">Loading enquiries…</p> : error ? <div role="alert" className="rounded-xl border border-destructive/30 bg-background p-6"><p className="text-destructive">{error}</p><Button variant="outline" className="mt-4" onClick={() => setVersion(value => value+1)}>Try again</Button></div> : <>
      <p role="status" className="text-sm text-muted-foreground">{total} {total === 1 ? 'enquiry' : 'enquiries'} in this view</p>
      {enquiries.length === 0 ? <Card><CardContent className="py-12 text-center"><Inbox className="mx-auto mb-4 h-7 w-7 text-brand-green" aria-hidden="true" /><h2 className="text-xl font-semibold">No enquiries in this view</h2><p className="mt-3 text-sm text-muted-foreground">Try another filter or refresh to check for new messages.</p></CardContent></Card> : <div className="grid items-start gap-5 xl:grid-cols-2">{enquiries.map(enquiry => <EnquiryCard key={`${enquiry.id}:${enquiry.version}`} enquiry={enquiry} onSaved={() => setVersion(value => value+1)} />)}</div>}
      <nav aria-label="Enquiry pages" className="flex flex-wrap items-center justify-between gap-3"><Button variant="outline" disabled={page<=1} onClick={() => setPage(value => value-1)}>Previous</Button><p className="text-sm text-muted-foreground">Page {page} of {pages}</p><Button variant="outline" disabled={page>=pages} onClick={() => setPage(value => value+1)}>Next</Button></nav>
    </>}
  </div>;
}
