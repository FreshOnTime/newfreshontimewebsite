'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const accountLinks = [
  { href: '/profile', label: 'Details' },
  { href: '/orders', label: 'Orders' },
  { href: '/wishlist', label: 'Wishlist' },
  { href: '/profile/messages', label: 'Messages' },
  { href: '/profile/subscriptions', label: 'Subscriptions' },
  { href: '/for-you', label: 'For you' },
];

export function AccountPage({ title, description, action, children }: { title: string; description: string; action?: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="bg-background pb-12 text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 pt-8 md:px-8 md:pt-10">
          <div className="flex flex-wrap items-end justify-between gap-5 pb-7 md:pb-8">
            <div className="min-w-0 max-w-full">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Your account</p>
              <h1 className="break-words text-3xl font-normal leading-tight tracking-[-0.035em] text-brand-green md:text-4xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
            {action}
          </div>
          <nav aria-label="Account navigation" className="flex flex-wrap gap-x-6 gap-y-1">
            {accountLinks.map(({ href, label }) => {
              const active = pathname === href || (href === '/orders' && pathname.startsWith('/orders/'));
              return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`border-b-2 py-3 text-sm transition-colors ${active ? 'border-brand-green font-medium text-brand-green' : 'border-transparent text-muted-foreground hover:text-brand-green'}`}>{label}</Link>;
            })}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 pt-8 md:px-8 md:pt-10">{children}</div>
    </div>
  );
}

export function AccountState({ title, description, action, error = false }: { title: string; description?: string; action?: ReactNode; error?: boolean }) {
  return (
    <section role={error ? 'alert' : undefined} className="rounded-lg border border-border px-6 py-10 md:px-8 md:py-12">
      <h2 className="text-xl font-normal text-brand-green">{title}</h2>
      {description && <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{description}</p>}
      {action && <div className="mt-6 flex flex-wrap gap-3">{action}</div>}
    </section>
  );
}

export function AccountLoading({ label }: { label: string }) {
  return <div role="status" className="flex items-center gap-3 py-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{label}</div>;
}

export const accountButton = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-leaf px-5 py-2.5 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-leaf/90 disabled:opacity-50';
export const accountSecondaryButton = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-brand-green transition-colors hover:border-brand-green disabled:opacity-50';
