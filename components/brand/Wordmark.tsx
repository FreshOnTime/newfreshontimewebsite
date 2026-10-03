import { cn } from '@/lib/utils';
import { wordmarkArtwork } from './wordmark-artwork';

/** Shared outlined artwork: no system-font substitution or duplicate labels. */
export default function Wordmark({ className }: { className?: string }) {
  return <svg role="img" aria-label="FreshPick" viewBox={wordmarkArtwork.viewBox} className={cn('inline-block h-[1.25em] w-[3.728em] shrink-0 align-middle', className)}>{wordmarkArtwork.paths.map(path => <path key={path.color} fill={path.color} d={path.d} />)}</svg>;
}
