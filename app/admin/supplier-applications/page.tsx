'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAdminQueue } from '@/components/admin/useAdminQueue';
import { QueueFeedback, QueuePager } from '@/components/admin/QueueFeedback';
import { authenticatedApiFetch as apiFetch } from '@/lib/api/authenticated-fetch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {specialtyLabel} from '@/lib/businessSpecialties';
import {businessTypeLabel} from '@/lib/businessTypes';
import { Badge } from '@/components/ui/badge';

interface Application {
  id: string;
  name: string;
  businessType?:string;
  businessSpecialties?:string[];
  businessOfferingLabels?:string[];
  contactName: string;
  city?: string | null;
  country?: string | null;
  email: string | null;
  phone: string;
  notes: string | null;
  proposedProducts: string[];
  applicationStatus: string;
  reviewNotes: string;
  reviewVersion: number;
  status?:string; makerPublished?:boolean; linkedAccounts?:number; verifiedAccounts?:number; reviewedAt?:string|null;
}

function ReviewCard({ application, saved }: { application: Application; saved: () => void }) {
  const [notes, setNotes] = useState(application.reviewNotes);
  const [status, setStatus] = useState(application.applicationStatus);
  const [confirmed,setConfirmed]=useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const needsVerification = status === 'approved' && application.applicationStatus !== 'approved';
  const unchanged = status === application.applicationStatus && notes.trim() === application.reviewNotes.trim();

  async function save() {
    if (busy || unchanged) return;
    if (needsVerification && (!confirmed || !notes.trim())) {
      setError('To approve this business, enter your review evidence and confirm that you checked its identity, ownership and contact details.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await apiFetch('/api/admin/supplier-applications', {
        method: 'PATCH',
        body: JSON.stringify({ id: application.id, version: application.reviewVersion, status, notes, confirmed }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success || data.application?.applicationStatus !== status) throw new Error(data?.error || 'The review was not confirmed by the server. Refresh and try again.');
      toast.success(`${application.name}: application ${data.application.applicationStatus}.`);
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
          <h2 className="text-xl font-semibold">{application.name}</h2><p className="text-xs font-semibold text-brand-green">{businessTypeLabel(application.businessType)}</p>
          {!!application.businessSpecialties?.length && <p className="mt-1 text-sm text-muted-foreground">{application.businessSpecialties.map(specialtyLabel).join(' · ')}</p>}
          <div className="mt-3 flex flex-wrap gap-2 text-xs"><Badge variant="outline">{application.applicationStatus==="pending"?"Awaiting review":application.applicationStatus}</Badge><Badge variant="outline">{application.makerPublished&&application.status==="active"&&application.applicationStatus==="approved"?"Page published":"Page private"}</Badge><Badge variant="outline">{application.linkedAccounts??0} linked account(s) · {application.verifiedAccounts??0} email verified</Badge></div><p className="mt-2 text-xs text-muted-foreground">Stored business record. A linked account does not establish the owner’s identity. {application.reviewedAt?"Previously reviewed.":"No recorded review yet."}</p><p className="mt-1 break-words text-sm text-muted-foreground">
            {[application.city,application.country].filter(Boolean).join(', ')}{(application.city||application.country)&&' · '}{application.contactName} · {application.phone}{application.email ? ` · ${application.email}` : ''}
          </p>
        </div>

        {!!application.businessOfferingLabels?.length && <section className="rounded-lg border border-border bg-secondary/40 p-4"><h3 className="text-sm font-semibold text-foreground">Declared offerings</h3><p className="mt-2 text-sm break-words">{application.businessOfferingLabels.join(" · ")}</p><p className="mt-2 text-xs text-muted-foreground">Review these specialties before approving the business.</p></section>}

        {!!application.notes && <section className="rounded-lg border border-border bg-secondary/40 p-4">
          <h3 className="text-sm font-semibold text-foreground">Proposed offerings</h3>
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
        </section>}

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
              Private review evidence / notes {needsVerification && <span className="text-destructive">(required for approval)</span>}
              <Textarea className="mt-2" maxLength={5000} value={notes} placeholder={needsVerification ? 'Record how you verified this business (e.g. owner contact and official page).' : 'Optional review notes'} onChange={event => setNotes(event.target.value)} />
            </label>
            {needsVerification&&<label className="flex gap-2 items-start text-sm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> I checked the business identity, ownership and contact details and recorded the evidence above.</label>}<p className="text-xs leading-6 text-muted-foreground">
              Approval opens Business Studio for publishing. The business receives an in-app notification when the application status changes.
            </p>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            {needsVerification && (!confirmed || !notes.trim()) && <p className="text-sm text-muted-foreground">Approval requires both review evidence and the confirmation checkbox. Selecting a status alone does not save it.</p>}
            <Button type="submit" disabled={busy || unchanged}>
              {busy ? 'Saving…' : status === 'approved' && needsVerification ? 'Approve business' : 'Save review'}
            </Button>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ApplicationsPage() {
  return <Suspense fallback={<p role="status">Loading applications…</p>}><ApplicationQueue /></Suspense>;
}

function ApplicationQueue() {
  const business = useSearchParams().get('business');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('pending');
  const params = new URLSearchParams({ page: String(page), ...(business ? { id: business } : status ? { status } : {}) });
  const queue = useAdminQueue<Application>(`/api/admin/supplier-applications?${params}`, 'applications');

  return (
    <div className="space-y-6">
      <Link href="/admin/suppliers" className="text-sm text-brand-green underline">Business directory</Link>
      <h1 className="text-3xl font-semibold">Business applications</h1>
      <p className="text-sm text-muted-foreground">Review real stored records, check ownership and contact details, then enable publishing. Approval is not the same as publishing a public page.</p>
      <div className="flex flex-wrap justify-between gap-3">
        {business ? <Link className="text-sm text-brand-green underline" href="/admin/supplier-applications">Back to all applications</Link> : <label className="flex items-center gap-3 text-sm">
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
        </label>}
        <Button variant="outline" disabled={queue.loading} onClick={queue.reload}>Refresh</Button>
      </div>
      <QueueFeedback loading={queue.loading} error={queue.error} retry={queue.reload} />
      {!queue.loading && !queue.error && (
        <>
          <p role="status" className="text-sm">{queue.total} applications in this view</p>
          <div className="grid gap-5 xl:grid-cols-2">
            {queue.items.map(application => (
              <ReviewCard key={`${application.id}:${application.reviewVersion}`} application={application} saved={()=>{setPage(1);queue.reload()}} />
            ))}
          </div>
          {!queue.items.length && <p className="py-8 text-muted-foreground">No applications in this view.</p>}
          <QueuePager page={page} pages={queue.pages} change={setPage} />
        </>
      )}
    </div>
  );
}
