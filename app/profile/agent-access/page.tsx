'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, KeyRound, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';
import { AccountPage } from '@/components/account/AccountPage';

type AgentToken = { id: string; name: string; createdAt: string; expiresAt: string };

export default function AgentAccessPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tokens, setTokens] = useState<AgentToken[]>([]);
  const [name, setName] = useState('');
  const [secret, setSecret] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login?redirect=/profile/agent-access');
    if (user) void refresh();
  }, [loading, user, router]);

  async function refresh() {
    try {
      const response = await authenticatedApiFetch('/api/profile/agent-tokens', { credentials: 'include' });
      if (!response.ok) throw new Error('Could not load your agents');
      const data = await response.json();
      setTokens(data.tokens || []);
    } catch { setError('Could not load your connected agents.'); }
  }

  async function create(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(null); setSecret(null);
    try {
      const response = await authenticatedApiFetch('/api/profile/agent-tokens', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not authorize the agent');
      setSecret(data.token); setName(''); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not authorize the agent'); }
    finally { setBusy(false); }
  }

  async function revoke(id: string) {
    if (busy) return;
    setBusy(true); setError(null); setSecret(null);
    try {
      const response = await authenticatedApiFetch('/api/profile/agent-tokens', {
        method: 'DELETE', credentials: 'include',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error('Could not revoke the agent');
      await refresh();
    } catch { setError('Could not revoke the agent.'); }
    finally { setBusy(false); }
  }

  if (loading || !user) return <div className="mx-auto max-w-5xl px-5 py-12 text-muted-foreground">Loading agent access…</div>;
  return <AccountPage title="AI shopping assistants" description="Let an assistant prepare your bags. Only you can finish checkout." action={<Link className="inline-flex items-center gap-2 text-sm text-brand-green" href="/profile"><ArrowLeft className="h-4 w-4" /> Account</Link>}>
    <div className="max-w-3xl space-y-6">
      <section className="rounded-lg border border-border bg-background p-6">
        <h2 className="flex items-center gap-2 text-lg font-medium text-brand-green"><KeyRound className="h-5 w-5" /> Connect an agent</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Each agent receives a revocable key that can view your orders and wishlists, and create, edit or delete shopping bags. Agents cannot place orders, choose payments or start checkout. Only use clients you trust. Access expires after 30 days.</p>
        <form className="mt-5 flex flex-wrap gap-3" onSubmit={create}>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required placeholder="Agent name (e.g. my grocery assistant)" aria-label="Agent name" className="h-11 min-w-0 flex-1 rounded-lg border border-border px-4 text-sm" />
          <button disabled={busy || !name.trim()} className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-leaf px-5 text-sm font-semibold text-brand-ink disabled:opacity-50" type="submit">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Create access key</button>
        </form>
        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
        {secret && <div className="mt-5 rounded-lg border border-border bg-secondary/50 p-4">
          <p className="text-sm font-semibold">Copy this key now. It will not be shown again.</p>
          <code className="mt-3 block break-all text-xs">{secret}</code>
          <button type="button" onClick={() => void navigator.clipboard.writeText(secret)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-green"><Copy className="h-4 w-4" /> Copy key</button>
        </div>}
        <p className="mt-5 text-sm leading-6 text-muted-foreground">MCP URL: <code>https://freshpick.lk/api/mcp</code>. Configure your MCP client to send <code>Authorization: Bearer YOUR_KEY</code>. Clients that do not support Bearer headers require a separate OAuth integration; do not put keys in chat messages or URLs.</p>
      </section>
      <section className="rounded-lg border border-border bg-background p-6">
        <h2 className="text-lg font-medium text-brand-green">Your authorized agents</h2>
        {tokens.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No agents connected.</p> :
          <ul className="mt-4 divide-y divide-border">{tokens.map(token => <li key={token.id} className="flex items-center justify-between gap-4 py-4">
            <div><p className="text-sm font-semibold">{token.name}</p><p className="mt-1 text-xs text-muted-foreground">Expires {new Date(token.expiresAt).toLocaleDateString()}</p></div>
            <button type="button" disabled={busy} onClick={() => void revoke(token.id)} className="inline-flex items-center gap-2 text-sm text-destructive disabled:opacity-50"><Trash2 className="h-4 w-4" /> Revoke</button>
          </li>)}</ul>}
      </section>
    </div>
  </AccountPage>;
}
