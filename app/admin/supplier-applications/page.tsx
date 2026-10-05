'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAdminQueue } from '@/components/admin/useAdminQueue';
import { QueueFeedback, QueuePager } from '@/components/admin/QueueFeedback';
import { authenticatedApiFetch as apiFetch } from '@/lib/api/authenticated-fetch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Application {
  id: string;
  name: string;
  contactName: string;
  email: string | null;
  phone: string;
  notes: string | null;
  proposedProducts: string[];
  applicationStatus: string;
  reviewNotes: string;
  reviewVersion: number;
}

function ReviewCard({ application, saved }: { application: Application; saved: () => void }) {
  const [notes, setNotes] = useState(application.reviewNotes);
  const [status, setStatus] = useState(application.applicationStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await apiFetch('/api/admin/supplier-applications', {
        method: 'PATCH',
        body: JSON.stringify({ id: application.id, version: application.reviewVersion, status, notes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save review');
      saved();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Unable to save review');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-5 pt-6">
        <div>
          <h2 className="text-xl font-semibold">{application.name}</h2>
          <p className="mt-1 break-words text-sm text-muted-foreground">
            {application.contactName} · {application.phone}{application.email ? ` · ${application.email}` : ''}
          </p>
        </div>

        <section className="rounded-lg border border-border bg-secondary/40 p-4">
          <h3 className="text-sm font-semibold text-foreground">Proposed products</h3>
          {application.proposedProducts.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {application.proposedProducts.map(product => (
                <Badge key={product} variant="secondary" className="max-w-full whitespace-normal text-left">
                  {product}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No product details supplied.</p>
          )}
          {application.notes && (
            <details className="mt-4">
              <summary className="cursor-pointer text-xs font-medium text-brand-green">View original supplier note</summary>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">{application.notes}</p>
            </details>
          )}
        </section>

        <form onSubmit={event => { event.preventDefault(); void save(); }}>
          <fieldset disabled={busy} className="space-y-4">
            <label className="block text-sm">
              Application status
              <select
                aria-label="Application status"
                value={status}
                onChange={event => setStatus(event.target.value)}
                className="ml-3 min-h-11 rounded-lg border bg-background px-3"
              >
                {['pending','approved','rejected'].map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              Private review notes
              <Textarea className="mt-2" maxLength={5000} value={notes} onChange={event => setNotes(event.target.value)} />
            </label>
            <p className="text-xs leading-6 text-muted-foreground">
              Approval activates catalogue upload. The supplier receives an in-app notification when the application status changes.
            </p>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button disabled={busy || (status === application.applicationStatus && notes === application.reviewNotes)}>
              {busy ? 'Saving…' : 'Save review'}
            </Button>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ApplicationsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('pending');
  const queue = useAdminQueue<Application>(`/api/admin/supplier-applications?page=${page}${status ? `&status=${status}` : ''}`, 'applications');

  return (
    <div className="space-y-6">
      <Link href="/admin/suppliers" className="text-sm text-brand-green underline">Supplier records</Link>
      <h1 className="text-3xl font-semibold">Supplier applications</h1>
      <p className="text-sm text-muted-foreground">Review supplier details and the proposed products they entered during registration.</p>
      <div className="flex flex-wrap justify-between gap-3">
        <label className="flex items-center gap-3 text-sm">
          Review status
          <select
            aria-label="Review status filter"
            value={status}
            onChange={event => { setPage(1); setStatus(event.target.value); }}
            className="min-h-11 rounded-lg border bg-background px-3"
          >
            <option value="">All</option>
            {['pending','approved','rejected'].map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <Button variant="outline" disabled={queue.loading} onClick={queue.reload}>Refresh</Button>
      </div>
      <QueueFeedback loading={queue.loading} error={queue.error} retry={queue.reload} />
      {!queue.loading && !queue.error && (
        <>
          <p role="status" className="text-sm">{queue.total} applications in this view</p>
          <div className="grid gap-5 xl:grid-cols-2">
            {queue.items.map(application => (
              <ReviewCard key={`${application.id}:${application.reviewVersion}`} application={application} saved={queue.reload} />
            ))}
          </div>
          {!queue.items.length && <p className="py-8 text-muted-foreground">No applications in this view.</p>}
          <QueuePager page={page} pages={queue.pages} change={setPage} />
        </>
      )}
    </div>
  );
}
