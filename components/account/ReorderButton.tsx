'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw } from 'lucide-react';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';
import { useBag } from '@/contexts/BagContext';
import { accountButton } from './AccountPage';

export function ReorderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { fetchBags } = useBag();
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; changes: { name: string; reason: string }[] } | null>(null);

  const reorder = async () => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      const response = await authenticatedApiFetch('/api/bags/reorder', { method: 'POST', body: JSON.stringify({ orderId }) });
      const data = await response.json();
      if (!response.ok || !data.success || !data.bag?._id) throw new Error(data.message || 'Couldn’t create your bag. Please try again.');
      // Keep the new bag addressable before refreshing context, so a context
      // refresh failure cannot prompt a duplicate creation on retry.
      setResult({ id: data.bag._id, changes: data.unavailableItems || [] });
      await fetchBags().catch(() => undefined);
      if (!data.unavailableItems?.length) router.push(`/bags/${data.bag._id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Couldn’t create your bag. Please try again.');
      lock.current = false;
    } finally { setBusy(false); }
  };

  return <div className="space-y-3">
    <p className="text-xs leading-5 text-muted-foreground">Buy these items again at current prices and availability.</p>
    {result ? <div role="status" className="space-y-3">
      {result.changes.length > 0 && <><p className="text-sm font-medium text-brand-green">Your bag is ready with these changes:</p><ul className="space-y-1 text-sm text-muted-foreground">{result.changes.map((change, index) => <li key={`${change.name}-${index}`}>{change.name}: {change.reason}</li>)}</ul></>}
      <button type="button" onClick={() => router.push(`/bags/${result.id}`)} className={`${accountButton} w-full`}>Review bag</button>
    </div> : <button type="button" onClick={() => void reorder()} disabled={busy} className={`${accountButton} w-full`}><RotateCcw aria-hidden="true" strokeWidth={1.75} className="h-4 w-4" />{busy ? 'Creating bag…' : 'Buy again'}</button>}
    {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
  </div>;
}
