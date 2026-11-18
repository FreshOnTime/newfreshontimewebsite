'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { reserve } from '@/app/bookings/actions';

export default function ReserveForm({ sessionId, requestId, remaining, price }: {sessionId: string; requestId: string; remaining: number; price: number}) {
  const { user, loading } = useAuth();
  const [seats, setSeats] = useState(1);
  if (loading) return <p>Loading booking options…</p>;
  if (!user) return <Link className="editorial-button mt-5" href={'/auth/login?redirect=/sessions/' + sessionId}>Sign in to book</Link>;
  return <form action={reserve} className="market-form">
    <input type="hidden" name="sessionId" value={sessionId} /><input type="hidden" name="requestId" value={requestId} />
    <label>Guest or gift recipient<input name="guestName" defaultValue={user.firstName} required maxLength={100} /></label>
    <label>Places<select name="seats" value={seats} onChange={e => setSeats(Number(e.target.value))}>
      {Array.from({length: Math.min(remaining, 20)}, (_, i) => <option key={i} value={i+1}>{i+1}</option>)}</select></label>
    <p>Cancel before the start time from My bookings.</p><button className="editorial-button">Confirm booking · LKR {(price * seats).toLocaleString()}</button>
  </form>;
}
