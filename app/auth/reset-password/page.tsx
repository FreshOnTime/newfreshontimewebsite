"use client";
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
      const data = await res.json();
      if (res.ok) setMessage(data.message || 'Password reset successful');
      else setError(data.error || 'Failed to reset password');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 ring-1 ring-black/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-green-100 text-green-700">🔑</div>
          <div>
            <h1 className="text-lg font-semibold">Reset your password</h1>
            <p className="text-sm text-gray-500">Choose a new, secure password for your account.</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">New password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              placeholder="At least 8 characters"
              aria-label="New password"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Confirm password</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              placeholder="Repeat new password"
              aria-label="Confirm password"
            />
          </label>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
            <a href="/auth/login" className="text-sm text-green-600 hover:underline">Back to sign in</a>
          </div>
        </form>

        {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
