"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, KeyRound, Loader2 } from 'lucide-react';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    if (!email || !email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) setMessage(data.message || 'If an account exists, a reset link has been sent.');
      else setError(data.error || 'Unable to request a reset.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f5f1] px-5 py-24 text-zinc-950">
      <section className="w-full max-w-lg">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>
        <div className="mt-10 rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.04)] md:p-9">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-900"><KeyRound className="h-5 w-5" /></span>
          <span className="mt-7 block text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-700">Account recovery</span>
          <h1 className="mt-3 font-serif text-5xl font-normal leading-none tracking-[-0.03em]">Reset your password.</h1>
          <p className="mt-5 text-sm font-light leading-7 text-zinc-500">Enter the email attached to your FreshPick account. For privacy, the response does not confirm whether an address is registered.</p>

          <form onSubmit={submit} className="mt-8">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700">Email</label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-[#fafbf9] px-4 text-sm outline-none transition-colors focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-700/10" />
            <button type="submit" disabled={loading} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 text-[10px] font-bold uppercase tracking-[0.16em] text-white hover:bg-emerald-950 disabled:opacity-50">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending</> : <>Send reset link <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          {message && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">{message}</div>}
          {error && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">{error}</div>}

          <p className="mt-6 border-t border-zinc-100 pt-5 text-xs font-light leading-5 text-zinc-400">Reset links expire for security. If the message does not arrive, check the email address and your spam folder before requesting another.</p>
        </div>
      </section>
    </main>
  );
}
