'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
export default function UnsubscribeForm(){
  const token=useSearchParams().get('token'),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState('');
  async function unsubscribe(){if(!token||busy)return;setBusy(true);setError('');try{const response=await fetch('/api/newsletter/unsubscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});const data=await response.json();if(!response.ok)throw new Error(data.error||'Unable to unsubscribe');setDone(true);}catch(failure){setError(failure instanceof Error?failure.message:'Please try again.');}finally{setBusy(false);}}
  return <main className="mx-auto min-h-[50vh] max-w-xl px-6 py-20"><h1 className="text-3xl font-semibold">{done?'You’re unsubscribed':'Newsletter preferences'}</h1><p className="mt-5 leading-7">{done?'You will no longer receive FreshPick newsletter updates.':token?'Confirm below to stop receiving newsletter updates. Your account and order messages continue as usual.':'Open the unsubscribe link from your latest FreshPick newsletter.'}</p>{error&&<p role="alert" className="mt-4 text-destructive">{error}</p>}{token&&!done&&<Button className="mt-6" disabled={busy} onClick={()=>void unsubscribe()}>{busy?'Saving…':'Unsubscribe'}</Button>}<Link className="mt-6 block text-brand-green underline" href="/">Back to FreshPick</Link></main>;
}
