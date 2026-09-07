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
    <main className="flex min-h-screen items-center justify-center bg-[#f4f5f1] px-5 py-24 text-zinc-950">
      <section className="w-full max-w-lg rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.04)] md:p-10">
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${status === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-900'}`}>
          {status === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : status === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
        </div>
        <span className="mt-6 block text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-700">Email verification</span>
        <h1 className="mt-3 font-serif text-5xl font-normal leading-none">{status === 'success' ? 'You’re verified.' : status === 'error' ? 'We couldn’t verify it.' : 'Checking your link.'}</h1>
        <p className="mx-auto mt-5 max-w-md text-sm font-light leading-7 text-zinc-500">{message}</p>
        {status !== 'loading' && (
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/auth/login" className="rounded-full bg-zinc-950 px-6 py-3 text-xs font-semibold text-white hover:bg-emerald-950">Sign in</Link>
            {status === 'error' && <Link href="/profile" className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-6 py-3 text-xs font-semibold text-zinc-700"><MailCheck className="h-3.5 w-3.5" /> Account settings</Link>}
          </div>
        )}
      </section>
    </main>
  );
}
