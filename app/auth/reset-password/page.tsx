"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { passwordSchema } from '@/lib/utils/validation';
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
    const validation = passwordSchema.safeParse(password);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
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
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-5 py-10 text-foreground">
      <section className="w-full max-w-lg">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>
        <div className="mt-10 rounded-lg border border-border bg-background p-7 md:p-9">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-brand-green"><KeyRound className="h-5 w-5" /></span>
          <span className="mt-7 block text-xs font-bold normal-case text-brand-green">New password</span>
          <h1 className="mt-3 font-serif text-4xl font-normal leading-tight">Choose a new one.</h1>
          <p className="mt-5 text-sm font-normal leading-7 text-muted-foreground">Use a password you do not reuse elsewhere. The reset link can only be used while its token remains valid.</p>

          <form onSubmit={submit} className="mt-8 space-y-5 [&_label]:mb-2 [&_label]:block">
            <div>
              <label htmlFor="new-password" className="text-sm font-medium text-foreground">New password</label>
              <PasswordInput id="new-password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8+ characters, upper/lowercase and number" className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10" />
            </div>
            <div>
              <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">Confirm password</label>
              <PasswordInput id="confirm-password" autoComplete="new-password" minLength={8} required value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Repeat the password" className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10" />
            </div>
            <button type="submit" disabled={loading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-xs font-bold normal-case text-accent-foreground hover:bg-primary/85 disabled:opacity-50">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Resetting</> : <>Reset password <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          {message && <div className="mt-5 rounded-lg border border-border bg-secondary px-4 py-3 text-sm leading-6 text-brand-green">{message}</div>}
          {error && <div role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">{error}</div>}

          {message && <Link href="/auth/login" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-brand-green">Continue to sign in <ArrowRight className="h-3.5 w-3.5" /></Link>}
        </div>
      </section>
    </div>
  );
}
