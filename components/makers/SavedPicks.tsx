'use client';

import Link from 'next/link';
import { useSyncExternalStore, useState } from 'react';
import { Bookmark } from 'lucide-react';

type Pick = { href: string; title: string; kind: string };
const key = 'freshpick:saved-maker-picks';
function subscribe(update: () => void) {
  window.addEventListener('storage', update);
  window.addEventListener(key, update);
  return () => { window.removeEventListener('storage', update); window.removeEventListener(key, update); };
}
function snapshot() { try { return localStorage.getItem(key) || '[]'; } catch { return '[]'; } }
function picks(raw: string): Pick[] {
  try {
    const entries: unknown = JSON.parse(raw);
    return Array.isArray(entries) ? entries.filter(p => p && typeof p.href === 'string' && /^\/makers\/[a-z0-9-]+(?:\/(?:items|stories)\/[a-z0-9-]+)?$/.test(p.href) && typeof p.title === 'string' && typeof p.kind === 'string') : [];
  } catch { return []; }
}
const serverSnapshot = () => '[]';
export function SavePick({ href, title, kind }: Pick) {
  const saved = picks(useSyncExternalStore(subscribe, snapshot, serverSnapshot)).some(p => p.href === href);
  const [error, setError] = useState(false);
  function toggle() {
    const current = picks(snapshot());
    try {
      localStorage.setItem(key, JSON.stringify(current.some(p => p.href === href) ? current.filter(p => p.href !== href) : [{href,title,kind}, ...current]));
      window.dispatchEvent(new Event(key));
      setError(false);
    } catch { setError(true); }
  }
  return <span><button type="button" onClick={toggle} aria-pressed={saved} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold"><Bookmark size={16} fill={saved ? 'currentColor' : 'none'}/>{saved ? 'Saved' : 'Save'}</button>{error && <span role="alert"> Browser storage unavailable.</span>}</span>;
}
export function SavedPicks() {
  const entries = picks(useSyncExternalStore(subscribe, snapshot, serverSnapshot));
  return <div className="editorial-wrap min-h-[55vh] py-12 md:py-20"><h1 className="maker-headline">Your saved picks.</h1><p className="my-6 text-muted-foreground">Makers, items and stories you’ve bookmarked on this device.</p>
    {entries.map(p => <article key={p.href} className="flex items-center justify-between gap-4 border-t border-border py-4"><Link href={p.href}><span className="text-xs">{p.kind}</span><h2 className="text-2xl">{p.title}</h2></Link><SavePick {...p}/></article>)}
    {!entries.length && <Link className="maker-button" href="/makers">Find a maker</Link>}
  </div>;
}
