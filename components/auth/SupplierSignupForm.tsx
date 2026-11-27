'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter,useSearchParams } from 'next/navigation';
import {businessTypes,businessTypeLabels} from '@/lib/businessTypes';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';

export function SupplierSignupForm() {
  const { user, loading, refreshAuth } = useAuth();
  const router = useRouter();
  const requestedType=useSearchParams().get("type");
  const initialType=businessTypes.find(t=>t===requestedType)||"maker";
  const joinPath="/join?type="+encodeURIComponent(initialType);
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || busy) return;
    const fields = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try {
      const res = await authenticatedApiFetch('/api/suppliers/register', {method:'POST',body:JSON.stringify({
        businessType:fields.get('businessType'), companyName: fields.get('name'), town: fields.get('town'), contactName: user.firstName, email: user.email || '', phone: user.phoneNumber || fields.get('phone'),
      })});
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Unable to submit your business page.');
      await refreshAuth(); router.push('/dashboard');
    } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); } finally { setBusy(false); }
  }
  return <div className="maker-hero fp-join"><div className="maker-hero-copy">
    <h1 className="maker-headline">Your business.<br/><em>Your story.</em></h1>
    <p className="my-5 max-w-lg leading-7">Create a discovery profile for your restaurant, café, bakery or food brand. Once approved, share your offerings and publish articles in the FreshPick journal. Customers contact you directly.</p>
    {loading ? <p>Loading account…</p> : user?.role === 'supplier' ? <Link href="/dashboard" className="maker-button">Open business studio</Link> : !user ? <div className="flex flex-wrap items-center gap-5"><Link className="maker-button" href={"/auth/signup/customer?redirect="+encodeURIComponent(joinPath)}>Create your login</Link><Link className="underline" href={"/auth/login?redirect="+encodeURIComponent(joinPath)}>Already registered? Sign in</Link></div> :
      <form onSubmit={submit} className="grid w-full max-w-lg gap-4">
        <label>Business type<select name="businessType" defaultValue={initialType} className="block w-full rounded-[3px] border p-3">{businessTypes.map(t=><option key={t} value={t}>{businessTypeLabels[t]}</option>)}</select></label>
        <label>Business name<input required maxLength={150} name="name" className="block w-full rounded-lg border p-3"/></label>
        <label>Town<input required minLength={2} maxLength={100} name="town" className="block w-full rounded-lg border p-3"/></label>
        {!user.phoneNumber && <label>Contact phone<input type="tel" name="phone" required className="block w-full rounded-lg border p-3"/></label>}
        {error && <p role="alert">{error}</p>}<button className="maker-button" disabled={busy}>{busy ? 'Submitting…' : 'Submit business for review'}</button>
      </form>}
  </div><div className="maker-hero-photo"><Image fill priority sizes="(max-width:767px) 100vw, 53vw" className="object-cover" src="/images/editorial/restaurant-kitchen.webp" alt="Cooks preparing food in a kitchen"/></div></div>;
}
