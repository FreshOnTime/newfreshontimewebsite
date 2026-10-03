'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, MailOpen, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';
import { AccountLoading, accountSecondaryButton } from '@/components/account/AccountPage';

interface Message {
  _id: string;
  sender: { firstName: string; lastName?: string | null } | null;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessageList() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?._id;
  const router = useRouter();
  const accountRef = useRef({ id: userId });
  if (accountRef.current.id !== userId) accountRef.current = { id: userId };
  const account = accountRef.current;
  const [state, setState] = useState<{ owner: object | null; messages: Message[]; loading: boolean; error: string | null; total: number; pages: number }>({ owner: null, messages: [], loading: true, error: null, total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [unread, setUnread] = useState(false);
  const [version, setVersion] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [readError, setReadError] = useState<{ id: string; message: string } | null>(null);
  const [reading, setReading] = useState<string | null>(null);
  const readLock = useRef<object | null>(null);
  const owned = state.owner === account;
  const messages = owned ? state.messages : [];
  const loading = authLoading || Boolean(userId && (!owned || state.loading));

  useEffect(() => {
    setPage(1); setExpandedId(null); setReadError(null); setReading(null); readLock.current = null;
  }, [account]);

  useEffect(() => {
    if (authLoading) return;
    if (!userId) { router.replace('/auth/login?redirect=/profile/messages'); return; }
    const controller = new AbortController();
    setState(current => ({ ...current, owner: account, messages: current.owner === account ? current.messages : [], loading: true, error: null }));
    const params = new URLSearchParams({ page: String(page), limit: '20', ...(query && { q: query }), ...(unread && { unread: 'true' }) });
    void (async () => {
      try {
        const response = await authenticatedApiFetch(`/api/messages?${params}`, { cache: 'no-store', signal: controller.signal });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || data.error || 'Unable to load messages');
        if (controller.signal.aborted || accountRef.current !== account) return;
        if (page > data.pagination.pages) { setPage(data.pagination.pages); return; }
        setState({ owner: account, messages: data.data || [], loading: false, error: null, total: data.pagination.total, pages: data.pagination.pages });
      } catch (failure) {
        if (!controller.signal.aborted && accountRef.current === account) setState(current => ({ ...current, loading: false, error: failure instanceof Error ? failure.message : 'Unable to load messages' }));
      }
    })();
    return () => controller.abort();
  }, [account, userId, authLoading, page, query, unread, version, router]);

  const markRead = async (id: string) => {
    if (readLock.current === account || !userId) return;
    readLock.current = account;
    setReading(id); setReadError(null);
    try {
      const response = await authenticatedApiFetch(`/api/messages/${encodeURIComponent(id)}/read`, { method: 'PUT' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || data.error || 'Unable to mark this message read');
      if (accountRef.current !== account) return;
      setState(current => ({ ...current, messages: current.messages.map(message => message._id === id ? { ...message, isRead: true } : message) }));
      setVersion(current => current + 1);
    } catch (failure) {
      if (accountRef.current === account) setReadError({ id, message: failure instanceof Error ? failure.message : 'Unable to mark this message read' });
    } finally {
      if (readLock.current === account) readLock.current = null;
      if (accountRef.current === account) setReading(null);
    }
  };

  if (!userId && !authLoading) return null;
  return (
    <section aria-label="Message inbox" className="min-w-0 rounded-lg border border-border bg-background p-5 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-normal text-brand-green"><Mail className="h-5 w-5" aria-hidden="true" /> Inbox</h2>
        <button type="button" onClick={() => setVersion(value => value + 1)} disabled={loading} className={accountSecondaryButton}><RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh messages</button>
      </div>
      <form onSubmit={event => { event.preventDefault(); setPage(1); setQuery(search.trim()); setVersion(value => value + 1); }} className="mt-5 flex flex-wrap items-center gap-3">
        <label className="min-w-0 flex-1"><span className="sr-only">Search messages</span><input value={search} onChange={event => setSearch(event.target.value)} maxLength={200} placeholder="Search messages" className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm" /></label>
        <button type="submit" className={accountSecondaryButton}>Search</button>
        <label className="inline-flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={unread} onChange={event => { setUnread(event.target.checked); setPage(1); }} /> Unread only</label>
      </form>
      {owned && state.error && <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-destructive"><p>{state.error}</p><button type="button" onClick={() => setVersion(value => value + 1)} className={accountSecondaryButton}>Try again</button></div>}
      {loading ? <AccountLoading label="Loading messages…" /> : <>
        {messages.length === 0 && !state.error && <p className="py-8 text-sm text-muted-foreground">{query || unread ? 'No messages match these filters.' : 'No messages yet. Updates from the FreshPick team will appear here.'}</p>}
        <div className="mt-5 space-y-3">
          {messages.map(message => {
            const expanded = expandedId === message._id;
            return <article key={message._id} className="overflow-hidden rounded-lg border border-border">
              <button type="button" aria-expanded={expanded} aria-controls={`message-${message._id}`} onClick={() => { setExpandedId(expanded ? null : message._id); setReadError(null); if (!expanded && !message.isRead) void markRead(message._id); }} className={`flex w-full items-start gap-3 p-4 text-left ${message.isRead ? 'bg-background' : 'bg-secondary'}`}>
                <MailOpen aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                <span className="min-w-0 flex-1"><span className="block break-words text-sm font-semibold">{message.subject}</span><span className="mt-1 block text-xs text-muted-foreground">{message.isRead ? 'Read' : 'Unread'} · {new Date(message.createdAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Colombo', day: 'numeric', month: 'short', year: 'numeric' })}</span></span>
              </button>
              {expanded && <div id={`message-${message._id}`} className="border-t border-border p-4 text-sm">
                <p className="break-words whitespace-pre-wrap leading-7">{message.content}</p>
                <p className="mt-4 text-xs text-muted-foreground">From: {[message.sender?.firstName, message.sender?.lastName].filter(Boolean).join(' ') || 'FreshPick'}</p>
                {reading === message._id && <p role="status" className="mt-3 text-xs text-muted-foreground">Marking read…</p>}
                {readError?.id === message._id && !message.isRead && <div role="alert" className="mt-3 text-destructive"><p>{readError.message}</p><button type="button" disabled={reading !== null} onClick={() => void markRead(message._id)} className="mt-2 min-h-11 underline">Retry marking read</button></div>}
              </div>}
            </article>;
          })}
        </div>
        {owned && state.total > 0 && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"><p>{state.total} {state.total === 1 ? 'message' : 'messages'} · Page {page} of {state.pages}</p><div className="flex gap-2"><button type="button" className={accountSecondaryButton} disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button><button type="button" className={accountSecondaryButton} disabled={page >= state.pages} onClick={() => setPage(value => value + 1)}>Next</button></div></div>}
      </>}
    </section>
  );
}
