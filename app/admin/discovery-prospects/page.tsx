'use client';
import {useState} from 'react';
import {authenticatedApiFetch} from '@/lib/api/authenticated-fetch';
import {useAdminQueue} from '@/components/admin/useAdminQueue';
import {QueueFeedback,QueuePager} from '@/components/admin/QueueFeedback';
import {toast} from 'sonner';
type Prospect={id:string;name:string;category:string;area:string|null;products:string|null;sourceUrl:string;instagram:string|null;facebook:string|null;tiktok:string|null;website:string|null;reviewStatus:string;permissionStatus:string;reviewNotes:string;updatedAt:string};
function safe(v:string|null){try{const u=new URL(v||'');return u.protocol==='https:'&&!u.username&&!u.password?u.href:null}catch{return null}}
function Review({row,saved}:{row:Prospect;saved:()=>void}){
 const [notes,setNotes]=useState(row.reviewNotes),[confirmed,setConfirmed]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function decide(decision:string){
  if(busy)return;
  if(!notes.trim()){setError('Enter review evidence or notes before saving.');return;}
  if(decision==='approved'&&!confirmed){setError('Confirm identity, current information and permission to publish.');return;}
  setBusy(true);setError('');
  try{const response=await authenticatedApiFetch('/api/admin/discovery-prospects',{method:'PATCH',body:JSON.stringify({id:row.id,version:row.updatedAt,decision,notes,confirmed})});const data=await response.json().catch(()=>null);if(!response.ok||data?.record?.reviewStatus!==decision)throw Error(data?.error||'Review was not confirmed. Refresh and try again.');toast.success('Listing review saved: '+decision);saved();}
  catch(e){setError(e instanceof Error?e.message:'Review failed');}finally{setBusy(false);}
 }
 return <article className="rounded-xl border border-border bg-background p-4 space-y-3"><h2 className="text-2xl">{row.name}</h2><p>{row.category} · {row.area||'Area not recorded'} · {row.reviewStatus}</p><p>{row.products}</p><div className="flex flex-wrap gap-3 text-sm">{[['Source',row.sourceUrl],['Instagram',row.instagram],['Facebook',row.facebook],['TikTok',row.tiktok],['Website',row.website]].map(([label,value])=>{const url=safe(value);return url?<a className="underline" key={label} href={url} target="_blank" rel="noopener noreferrer">{label}</a>:value?<span key={label}>{label}: {value} (unverified)</span>:null})}</div>
 <fieldset disabled={busy} className="space-y-3"><label className="block text-sm">Review evidence and permission notes (required)<textarea className="block w-full border rounded-lg p-2 mt-1" rows={2} maxLength={2000} value={notes} onChange={e=>setNotes(e.target.value)}/></label><label className="flex gap-2 text-sm items-start"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> I verified current business identity, public fields, official links and publication rights (required for approval).</label>{error&&<p role="alert" className="text-destructive">{error}</p>}<div className="flex flex-wrap gap-2">{['approved','pending','rejected'].map(d=><button type="button" className="border rounded-lg px-3 py-2 disabled:opacity-40" disabled={busy} key={d} onClick={()=>void decide(d)}>{busy?'Saving…':d==='approved'?'Approve & publish':d==='pending'?'Return to review':'Reject & hide'}</button>)}</div></fieldset></article>
}
export default function AdminProspects(){
 const [filter,setFilter]=useState('pending'),[page,setPage]=useState(1);
 const queue=useAdminQueue<Prospect>('/api/admin/discovery-prospects?page='+page+(filter==='all'?'':'&status='+filter),'records');
 return <div className="max-w-5xl space-y-5"><h1 className="text-3xl font-semibold">External listing review</h1><p>These are researched or imported references, not owner-submitted applications. Keep them private until identity, current information and publication rights are confirmed. Approval publishes an independent listing; it does not create a login or grant publishing access.</p><div className="flex flex-wrap justify-between gap-3"><label className="block text-sm">Review status <select className="ml-3 border rounded-lg p-2" value={filter} onChange={e=>{setFilter(e.target.value);setPage(1)}}>{['pending','approved','rejected','all'].map(s=><option key={s}>{s}</option>)}</select></label><button type="button" className="border rounded-lg px-3 py-2" disabled={queue.loading} onClick={queue.reload}>Refresh</button></div><QueueFeedback loading={queue.loading} error={queue.error} retry={queue.reload}/>{!queue.loading&&!queue.error&&<><p role="status">{queue.total} records</p>{queue.items.length===0&&<p className="rounded-lg border p-5">No external listings on this page.</p>}{queue.items.map(row=><Review key={row.id+row.updatedAt} row={row} saved={()=>{setPage(1);queue.reload()}}/>)}<QueuePager page={page} pages={queue.pages} change={setPage}/></>}</div>
}
