'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';
import { safeNotificationLink } from '@/lib/notificationInput';
import { AccountLoading, accountSecondaryButton } from '@/components/account/AccountPage';

interface Notification { _id: string; title: string; message: string; type: string; isRead: boolean; link: string | null; createdAt: string }
export function NotificationCenter() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?._id, router = useRouter();
  const accountRef = useRef({ id: userId });
  if (accountRef.current.id !== userId) accountRef.current = { id: userId };
  const account = accountRef.current;
  const [state, setState] = useState<{ owner: object | null; rows: Notification[]; loading: boolean; error: string | null; pages: number; total: number; unreadCount: number }>({ owner: null, rows: [], loading: true, error: null, pages: 1, total: 0, unreadCount: 0 });
  const [page, setPage] = useState(1), [unread, setUnread] = useState(false), [version, setVersion] = useState(0);
  const [readError, setReadError] = useState<string | null>(null), [saving, setSaving] = useState(false);
  const lock = useRef<object | null>(null);
  const owned = state.owner === account, rows = owned ? state.rows : [], loading = authLoading || !owned || state.loading;
  useEffect(() => { setPage(1); setReadError(null); setSaving(false); lock.current = null; }, [account]);
  useEffect(() => {
    if (authLoading) return;
    if (!userId) { router.replace('/auth/login?redirect=/profile/notifications'); return; }
    const controller = new AbortController();
    setState(current => ({ ...current, owner: account, rows: current.owner === account ? current.rows : [], loading: true, error: null }));
    void (async () => {
      try {
        const response = await authenticatedApiFetch(`/api/notifications?page=${page}&limit=20${unread ? '&unread=true' : ''}`, { cache: 'no-store', signal: controller.signal });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || data.error || 'Unable to load notifications');
        if (controller.signal.aborted || accountRef.current !== account) return;
        if (page > data.pagination.pages) { setPage(data.pagination.pages); return; }
        setState({ owner: account, rows: data.data, loading: false, error: null, pages: data.pagination.pages, total: data.pagination.total, unreadCount: data.unreadCount });
      } catch (error) {
        if (!controller.signal.aborted && accountRef.current === account) setState(current => ({ ...current, loading: false, error: error instanceof Error ? error.message : 'Unable to load notifications' }));
      }
    })();
    return () => controller.abort();
  }, [account, userId, authLoading, router, page, unread, version]);
  const markRead = async (ids: string[]) => {
    if (!ids.length || lock.current === account) return;
    lock.current = account; setSaving(true); setReadError(null);
    try {
      const response = await authenticatedApiFetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || data.error || 'Unable to mark notifications read');
      if (accountRef.current !== account) return;
      setVersion(value => value + 1);
    } catch (error) {
      if (accountRef.current === account) setReadError(error instanceof Error ? error.message : 'Unable to mark notifications read');
    } finally {
      if (lock.current === account) lock.current = null;
      if (accountRef.current === account) setSaving(false);
    }
  };
  if (!userId && !authLoading) return null;
  return <section aria-label="Notification inbox" className="rounded-lg border border-border bg-background p-5 md:p-7">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-xl font-normal text-brand-green"><Bell aria-hidden="true" className="h-5 w-5" /> Updates{owned && <span className="text-sm text-muted-foreground">{state.unreadCount} unread</span>}</h2><button type="button" className={accountSecondaryButton} disabled={loading || saving} onClick={() => setVersion(value => value + 1)}>Refresh notifications</button></div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><label className="inline-flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={unread} disabled={saving} onChange={event => { setUnread(event.target.checked); setPage(1); }} /> Unread only</label><button type="button" className={accountSecondaryButton} disabled={saving || loading || !rows.some(row => !row.isRead)} onClick={() => void markRead(rows.filter(row => !row.isRead).map(row => row._id))}>{saving ? 'Saving…' : 'Mark this page read'}</button></div>
    {owned && state.error && <div role="alert" className="mt-4 text-sm text-destructive"><p>{state.error}</p><button type="button" className="mt-2 min-h-11 underline" onClick={() => setVersion(value => value + 1)}>Try again</button></div>}
    {readError && <p role="alert" className="mt-4 text-sm text-destructive">{readError} Use the read action to retry.</p>}
    {loading ? <AccountLoading label="Loading notifications…" /> : <>
      {!rows.length && !state.error && <p className="py-8 text-sm text-muted-foreground">{unread ? 'You have no unread notifications.' : 'No notifications yet. Updates from FreshPick will appear here.'}</p>}
      <div className="mt-5 space-y-3">{rows.map(row => <article key={row._id} className={`rounded-lg border border-border p-4 ${row.isRead ? 'bg-background' : 'bg-secondary'}`}>
        <h3 className="break-words text-sm font-semibold">{row.title}</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7">{row.message}</p><p className="mt-3 text-xs text-muted-foreground">{row.isRead ? 'Read' : 'Unread'} · {new Date(row.createdAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Colombo', day: 'numeric', month: 'short', year: 'numeric' })}</p>
        <div className="mt-3 flex flex-wrap gap-3">{!row.isRead && <button type="button" disabled={saving} className={accountSecondaryButton} aria-label={`Mark ${row.title} read`} onClick={() => void markRead([row._id])}>Mark read</button>}{safeNotificationLink(row.link) && <Link href={safeNotificationLink(row.link)!} className={accountSecondaryButton} aria-label={`View ${row.title}`}>View details</Link>}</div>
      </article>)}</div>
      {owned && state.total > 0 && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"><p>{state.total} {state.total === 1 ? 'notification' : 'notifications'} · Page {page} of {state.pages}</p><div className="flex gap-2"><button type="button" className={accountSecondaryButton} disabled={page <= 1 || saving} onClick={() => setPage(value => value - 1)}>Previous</button><button type="button" className={accountSecondaryButton} disabled={page >= state.pages || saving} onClick={() => setPage(value => value + 1)}>Next</button></div></div>}
    </>}
  </section>;
}
