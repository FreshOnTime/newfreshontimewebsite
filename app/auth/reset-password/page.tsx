"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, KeyRound, Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    if (!token) {
      setError('This reset link is missing its token. Request a new reset link.');
      return;
    }
    if (!password || password.length < 8) {
      setError('Use at least 8 characters for the new password.');
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (response.ok) setMessage(data.message || 'Password reset successful. You can sign in now.');
      else setError(data.error || 'Unable to reset password.');
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
          <span className="mt-7 block text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-700">New password</span>
          <h1 className="mt-3 font-serif text-5xl font-normal leading-none tracking-[-0.03em]">Choose a new one.</h1>
          <p className="mt-5 text-sm font-light leading-7 text-zinc-500">Use a password you do not reuse elsewhere. The reset link can only be used while its token remains valid.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="new-password" className="text-sm font-medium text-zinc-700">New password</label>
              <input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-[#fafbf9] px-4 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-700/10" />
            </div>
            <div>
              <label htmlFor="confirm-password" className="text-sm font-medium text-zinc-700">Confirm password</label>
              <input id="confirm-password" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Repeat the password" className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-[#fafbf9] px-4 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-700/10" />
            </div>
            <button type="submit" disabled={loading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 text-[10px] font-bold uppercase tracking-[0.16em] text-white hover:bg-emerald-950 disabled:opacity-50">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Resetting</> : <>Reset password <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          {message && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">{message}</div>}
          {error && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">{error}</div>}

          {message && <Link href="/auth/login" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-emerald-800">Continue to sign in <ArrowRight className="h-3.5 w-3.5" /></Link>}
        </div>
      </section>
    </main>
  );
}
