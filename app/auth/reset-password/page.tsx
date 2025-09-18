"use client";
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null); setError(null);
    try {
      const res = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
      const data = await res.json();
      if (res.ok) setMessage(data.message || 'Password reset successful');
      else setError(data.error || 'Failed to reset password');
    } catch {
      setError('Network error');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-4">Reset password</h1>
      <form onSubmit={submit} className="space-y-4">
        <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border" placeholder="New password" type="password" />
        <button className="px-4 py-2 bg-blue-600 text-white">Reset password</button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}
