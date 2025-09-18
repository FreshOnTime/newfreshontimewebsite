"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setStatus('No token provided'); return; }
    (async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok) setStatus(data.message || 'Email verified');
        else setStatus(data.error || 'Verification failed');
      } catch {
        setStatus('Network error');
      }
    })();
  }, [token]);

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-4">Email verification</h1>
      {status ? <p>{status}</p> : <p>Verifying...</p>}
    </div>
  );
}
