"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, MailCheck, XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error');
  const [message, setMessage] = useState(token ? 'Verifying your email…' : 'This verification link is missing its token.');

  useEffect(() => {
    if (!token) return;
    void (async () => {
      try {
        const response = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`);
        const data = await response.json();
        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Your email is verified.');
        } else {
          setStatus('error');
          setMessage(data.error || 'This verification link could not be completed.');
        }
      } catch {
        setStatus('error');
        setMessage('Network error. Please try the verification link again.');
      }
    })();
  }, [token]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-5 py-10 text-foreground">
      <section className="w-full max-w-lg rounded-lg border border-border bg-background p-8 text-center md:p-10">
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${status === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-secondary text-brand-green'} `}>
          {status === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : status === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
        </div>
        <span className="mt-6 block text-xs font-bold normal-case text-brand-green">Email verification</span>
        <h1 className="mt-3 font-serif text-4xl font-normal leading-tight">{status === 'success' ? 'You’re verified.' : status === 'error' ? 'We couldn’t verify it.' : 'Checking your link.'}</h1>
        <p className="mx-auto mt-5 max-w-md text-sm font-normal leading-7 text-muted-foreground">{message}</p>
        {status !== 'loading' && (
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/auth/login" className="rounded-md bg-primary px-6 py-3 text-xs font-semibold text-accent-foreground hover:bg-primary/85">Sign in</Link>
            {status === 'error' && <Link href="/profile" className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-xs font-semibold text-foreground"><MailCheck className="h-3.5 w-3.5" /> Account settings</Link>}
          </div>
        )}
      </section>
    </div>
  );
}
