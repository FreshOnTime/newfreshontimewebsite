'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function DiscoveryRail({ children, label }: { children: ReactNode; label: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ previous: false, next: false });
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const sync = () => {
      const previous = node.scrollLeft > 2;
      const next = node.scrollLeft + node.clientWidth < node.scrollWidth - 2;
      setEdges(old => old.previous === previous && old.next === next ? old : { previous, next });
    };
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    node.addEventListener('scroll', sync, { passive: true });
    sync();
    return () => { observer.disconnect(); node.removeEventListener('scroll', sync); };
  }, []);
  const move = (direction: number) => {
    const node = track.current;
    if (!node) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollBy({left: direction * node.clientWidth * .8, behavior: reduced ? 'auto' : 'smooth'});
  };
  return <div className="lux-rail">
    <div ref={track} className="lux-rail-track" role="region" aria-label={label} tabIndex={0}>{children}</div>
    {(edges.previous || edges.next) && <div className="lux-rail-controls">
      <button type="button" aria-label={'Previous '+label} disabled={!edges.previous} onClick={() => move(-1)}><ChevronLeft size={20} aria-hidden="true"/></button>
      <button type="button" aria-label={'Next '+label} disabled={!edges.next} onClick={() => move(1)}><ChevronRight size={20} aria-hidden="true"/></button>
    </div>}
  </div>;
}
