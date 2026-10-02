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
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-5 py-10 text-foreground">
      <section className="w-full max-w-lg">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>
        <div className="mt-10 rounded-lg border border-border bg-background p-7 md:p-9">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-brand-green"><KeyRound className="h-5 w-5" /></span>
          <span className="mt-7 block text-xs font-bold normal-case text-brand-green">Account recovery</span>
          <h1 className="mt-3 font-serif text-4xl font-normal leading-tight">Reset your password.</h1>
          <p className="mt-5 text-sm font-normal leading-7 text-muted-foreground">Enter the email attached to your FreshPick account. For privacy, the response does not confirm whether an address is registered.</p>

          <form onSubmit={submit} className="mt-8">
            <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="mt-2 h-12 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10" />
            <button type="submit" disabled={loading} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-xs font-bold normal-case text-accent-foreground hover:bg-primary/85 disabled:opacity-50">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending</> : <>Send reset link <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          {message && <div className="mt-5 rounded-lg border border-border bg-secondary px-4 py-3 text-sm leading-6 text-brand-green">{message}</div>}
          {error && <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">{error}</div>}

          <p className="mt-6 border-t border-border pt-5 text-xs font-normal leading-5 text-muted-foreground">Reset links expire for security. If the message does not arrive, check the email address and your spam folder before requesting another.</p>
        </div>
      </section>
    </div>
  );
}
