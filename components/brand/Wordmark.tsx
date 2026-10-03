import { cn } from '@/lib/utils';

/** One accessible name, with a consistent green and warm clay brand treatment. */
export default function Wordmark({ className }: { className?: string }) {
  return <span aria-label="FreshPick" className={cn('inline-flex whitespace-nowrap font-sans font-bold tracking-[-0.06em]', className)}><span aria-hidden="true" className="text-brand-green">Fresh</span><span aria-hidden="true" className="text-brand-clay">Pick</span></span>;
}
