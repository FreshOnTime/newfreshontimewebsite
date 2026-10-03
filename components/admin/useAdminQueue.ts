'use client';
import { useEffect, useState } from 'react';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';
export function useAdminQueue<T>(url: string, field: string) {
  const [items, setItems] = useState<T[]>([]), [pages, setPages] = useState(1), [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); let active = true;
    setLoading(true); setError('');
    void (async () => {
      try {
        const response = await authenticatedApiFetch(url, { signal: controller.signal, cache: 'no-store' });
        const data = await response.json().catch(() => null);
        if (!response.ok || !Array.isArray(data?.[field])) throw new Error(data?.error || 'Unable to load this list. Please try again.');
        const pagination = data.pagination || data;
        if (active) {
          setItems(data[field]);
          setTotal(Number.isFinite(pagination.total) ? pagination.total : data[field].length);
          setPages(Number.isFinite(pagination.pages) ? Math.max(1, pagination.pages) : 1);
        }
      } catch (failure) { if (active) setError(failure instanceof Error ? failure.message : 'Unable to load this list'); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; controller.abort(); };
  }, [url, field, version]);
  return { items, pages, total, loading, error, reload: () => setVersion(value => value+1) };
}
