'use client';

import Link from 'next/link';
import { useSyncExternalStore, useState } from 'react';
import { PageBand, CraftShelf } from '@/components/makers/Edition';
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
    return Array.isArray(entries) ? entries.filter(p => p && typeof p.href === 'string' && /^\/(?:makers\/[a-z0-9-]+(?:\/(?:items|stories)\/[a-z0-9-]+)?|stories\/[a-z0-9-]+)$/.test(p.href) && typeof p.title === 'string' && typeof p.kind === 'string') : [];
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
  return <>
    <PageBand title="Your saved picks." intro="Your own collection of makers, food and stories, kept in this browser." image="/images/editorial/kitchen-basket.webp" alt="A woven basket full of vegetables and herbs"/>
    <div className="editorial-wrap py-8">
      {entries.length ? <div className="fp-saved-list">{entries.map(p => <article key={p.href}><Link href={p.href}><span className="fp-kicker">{p.kind}</span><h2>{p.title}</h2></Link><SavePick {...p}/></article>)}</div> :
        <div className="fp-empty"><div><h2>Start your collection.</h2><p>Tap Save on a maker, an item or a story and you’ll find it here.</p></div><Link className="maker-button" href="/stories">Explore the journal</Link></div>}
    </div>{!entries.length && <CraftShelf/>}
  </>;
}
