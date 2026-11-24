'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';

export function SupplierSignupForm() {
  const { user, loading, refreshAuth } = useAuth();
  const router = useRouter();
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || busy) return;
    const fields = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try {
      const res = await authenticatedApiFetch('/api/suppliers/register', {method:'POST',body:JSON.stringify({
        companyName: fields.get('name'), town: fields.get('town'), contactName: user.firstName, email: user.email || '', phone: user.phoneNumber || fields.get('phone'),
      })});
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Unable to submit your maker page.');
      await refreshAuth(); router.push('/dashboard');
    } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); } finally { setBusy(false); }
  }
  return <div className="maker-hero fp-join"><div className="maker-hero-copy">
    <h1 className="maker-headline">Your food.<br/><em>Your page.</em></h1>
    <p className="my-5 max-w-lg leading-7">Give your kitchen, garden or food brand a home on FreshPick. Once your page is approved, publish an item, share a batch or write your first story. Enquiries go straight to your WhatsApp.</p>
    {loading ? <p>Loading account…</p> : user?.role === 'supplier' ? <Link href="/dashboard" className="maker-button">Open maker studio</Link> : !user ? <div className="flex flex-wrap items-center gap-5"><Link className="maker-button" href="/auth/signup/customer?redirect=/join">Create your login</Link><Link className="underline" href="/auth/login?redirect=/join">Already registered? Sign in</Link></div> :
      <form onSubmit={submit} className="grid w-full max-w-lg gap-4">
        <label>Maker or business name<input required maxLength={150} name="name" className="block w-full rounded-lg border p-3"/></label>
        <label>Town<input required minLength={2} maxLength={100} name="town" className="block w-full rounded-lg border p-3"/></label>
        {!user.phoneNumber && <label>Contact phone<input type="tel" name="phone" required className="block w-full rounded-lg border p-3"/></label>}
        {error && <p role="alert">{error}</p>}<button className="maker-button" disabled={busy}>{busy ? 'Submitting…' : 'Submit maker page for review'}</button>
      </form>}
  </div><div className="maker-hero-photo"><Image fill priority sizes="(max-width:767px) 100vw, 53vw" className="object-cover" src="/images/editorial/restaurant-kitchen.webp" alt="Cooks preparing food in a kitchen"/></div></div>;
}
