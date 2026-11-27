'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {readWorkspace} from '@/lib/api/workspace-read';
import MakerStudio from './MakerStudio';
type Status={state:'not_submitted'|'pending'|'rejected'|'inactive'|'approved';name:string|null;published:boolean};
const messages={not_submitted:['Application not submitted','Complete your business details before we can review your page.'],pending:['Application under review','Your application is saved. Publishing is locked until FreshPick approves it. You do not need to apply again.'],rejected:['Application not approved','Publishing is disabled. Contact FreshPick to discuss the review.'],inactive:['Publishing disabled','This business is inactive. Contact FreshPick to clarify its status.']};
export default function BusinessWorkspaceGate(){
 const [data,setData]=useState<Status>(),[error,setError]=useState(''),[loading,setLoading]=useState(true),[version,setVersion]=useState(0);
 useEffect(()=>{const c=new AbortController();readWorkspace<Status>('/api/suppliers/application-status',c.signal).then(v=>{if(!c.signal.aborted){setData(v);setError('')}}).catch(e=>{if(!c.signal.aborted)setError(e.message)}).finally(()=>{if(!c.signal.aborted)setLoading(false)});return()=>c.abort()},[version]);
 if(!loading&&!error&&data?.state==='approved')return <MakerStudio/>;
 const message=data&&data.state!=='approved'?messages[data.state]:null;
 return <section className="fp-workspace-surface space-y-4"><p className="text-xs font-semibold uppercase tracking-wide text-brand-green">Business application</p><h2 className="fp-workspace-heading">{loading?'Checking your application…':error?'Status unavailable':message?.[0]}</h2>{data?.name&&<p className="font-semibold">{data.name}</p>}<p role={error?'alert':'status'} className="text-sm text-muted-foreground">{loading?'Loading your current approval status.':error||message?.[1]}</p><div className="flex flex-wrap gap-3">{data?.state==='not_submitted'&&<Link href="/join?complete=1" className="maker-button">Complete application</Link>}<button type="button" disabled={loading} onClick={()=>{setLoading(true);setVersion(v=>v+1)}} className="min-h-11 rounded-md border px-4 text-sm font-semibold">Refresh status</button><Link href="/contact" className="min-h-11 inline-flex items-center text-sm underline">Contact FreshPick</Link></div><Link href="/profile/notifications" className="text-sm underline">View notifications</Link></section>;
}
