"use client";
import React, { useState } from 'react';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (res.ok) setMessage(data.message || 'If an account exists, a reset link has been sent');
      else setError(data.error || 'Failed to request reset');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 ring-1 ring-black/5">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-none h-12 w-12 rounded-lg bg-green-100 text-green-700 grid place-items-center text-xl">🔒</div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Forgot your password?</h2>
            <p className="mt-1 text-sm text-gray-500">Enter the email associated with your account and we&apos;ll send a reset link.</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              aria-label="Email address"
              className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm leading-5 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </label>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
            <a href="/auth/login" className="text-sm text-green-600 hover:underline">Back to sign in</a>
          </div>
        </form>

        {message && <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</div>}
        {error && <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="mt-6 text-xs text-gray-400">We&apos;ll never share your email. Reset links expire for your safety.</div>
      </div>
    </div>
  );
}
