'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

type Activity = {
  _id: string;
  type: string; // e.g., order_created, product_updated
  description: string;
  timestamp: string; // ISO
  userName?: string;
  orderId?: string;
  productId?: string;
};

const LAST_SEEN_KEY = 'admin.notifications.lastSeen';

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.max(0, now.getTime() - d.getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const lastSeenRef = useRef<number>(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LAST_SEEN_KEY) : null;
    return raw ? Number(raw) : 0;
  });
  // ref initializer workaround for SSR
  if (typeof lastSeenRef.current === 'function') {
    const fn = lastSeenRef.current as unknown as () => number;
    lastSeenRef.current = fn();
  }

  const unreadCount = useMemo(() => {
    const lastSeen = Number(lastSeenRef.current || 0);
    return items.filter((i) => new Date(i.timestamp).getTime() > lastSeen).length;
  }, [items]);

  // Fetch activities
  const fetchItems = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/activities?limit=10`, { credentials: 'include', signal });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      const incoming: Activity[] = data.activities ?? [];

      // Toast if there are brand new items since lastSeen
      const lastSeen = Number(lastSeenRef.current || 0);
      const newly = incoming.filter((i) => new Date(i.timestamp).getTime() > lastSeen);
      if (items.length && newly.length > 0) {
        const first = newly[0];
        toast.info(`New: ${first.description}`, { description: first.userName ? `by ${first.userName}` : undefined });
      }
      setItems(incoming);
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'name' in e && (e as { name?: string }).name === 'AbortError') return;
      setError(e instanceof Error ? e.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    fetchItems(ac.signal);
    const id = setInterval(() => fetchItems(ac.signal), 30000);
    return () => {
      ac.abort();
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mark notifications as read when opening the dropdown
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      const now = Date.now();
      lastSeenRef.current = now;
      try { localStorage.setItem(LAST_SEEN_KEY, String(now)); } catch { /* noop */ }
    }
  };

  const markAllRead = () => {
    const now = Date.now();
    lastSeenRef.current = now;
    try { localStorage.setItem(LAST_SEEN_KEY, String(now)); } catch { /* noop */ }
  };

  const badgeFor = (t: string) => {
    const v = t.includes('order') ? 'secondary' : t.includes('product') ? 'outline' : 'default';
    return <Badge variant={v}>{t.replaceAll('_', ' ')}</Badge>;
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] h-4 min-w-4 px-1 ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <DropdownMenuLabel className="flex items-center justify-between py-2">
          <span>Notifications</span>
          <Button variant="ghost" size="sm" onClick={markAllRead} className="gap-1">
            <Check className="h-4 w-4" /> Mark all read
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading && (
          <div className="p-4 text-sm text-gray-500 flex items-center gap-2">
            <Clock className="h-4 w-4 animate-spin" /> Loading…
          </div>
        )}
        {error && (
          <div className="p-4 text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="p-4 text-sm text-gray-500">No notifications</div>
        )}
        {!loading && !error && items.length > 0 && (
          <div className="max-h-96 overflow-auto py-1">
            {items.map((n) => (
              <DropdownMenuItem key={n._id} className="flex items-start gap-2 py-3 px-3">
                <div className="mt-0.5">{badgeFor(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 truncate">{n.description}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {n.userName ? `${n.userName} · ` : ''}{timeAgo(n.timestamp)}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <div className="p-2">
          <a href="/admin/audit-logs" className="block w-full text-center text-sm text-blue-600 hover:underline">
            View all activity
          </a>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationsBell;
