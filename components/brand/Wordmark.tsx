import { cn } from '@/lib/utils';

/** One accessible name; the uppercase market wordmark is shared across surfaces. */
export default function Wordmark({ className, tone = 'brand' }: { className?: string; tone?: 'brand' | 'inverse' }) {
  return <span aria-label="FreshPick" className={cn('inline-flex whitespace-nowrap font-brand font-medium uppercase leading-none tracking-[-0.045em]', className)}><span aria-hidden="true" className={tone === 'inverse' ? 'text-white' : 'text-brand-green'}>Fresh</span><span aria-hidden="true" className={tone === 'inverse' ? 'text-white' : 'text-brand-clay'}>Pick</span></span>;
}
