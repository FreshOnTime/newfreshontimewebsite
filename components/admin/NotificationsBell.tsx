'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {Bell,Check,RefreshCw,ArrowUpRight} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {DropdownMenu,DropdownMenuContent,DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {useAuth} from '@/contexts/AuthContext';
import {readWorkspace} from '@/lib/api/workspace-read';
import {authenticatedApiFetch} from '@/lib/api/authenticated-fetch';
import {safeNotificationLink} from '@/lib/notificationInput';

type Notice={_id:string;title:string;message:string;isRead:boolean;link:string|null;createdAt:string};
type Inbox={success:boolean;data:Notice[];unreadCount:number};
export function NotificationsBell(){
 const {user}=useAuth();const id=user?._id;
 return id?<InboxBell key={id}/>:null;
}
function InboxBell(){
 const [open,setOpen]=useState(false),[data,setData]=useState<Inbox>(),[loading,setLoading]=useState(false),[error,setError]=useState(''),[saving,setSaving]=useState(false);
 const active=useRef<AbortController|null>(null);const mounted=useRef(false);const writing=useRef(false);
 const reload=useCallback(async()=>{
  if(active.current||writing.current||!mounted.current)return;
  const c=new AbortController();active.current=c;setLoading(true);setError('');
  try{const inbox=await readWorkspace<Inbox>('/api/notifications?limit=10',c.signal);if(!inbox.success)throw Error('Unable to load notifications.');if(!c.signal.aborted)setData(inbox);}
  catch(e){if(!c.signal.aborted)setError(e instanceof Error?e.message:'Unable to load notifications.');}
  finally{if(active.current===c){active.current=null;if(mounted.current)setLoading(false);}}
 },[]);
 useEffect(()=>{mounted.current=true;void reload();const timer=setInterval(()=>{if(document.visibilityState==='visible')void reload();},60000);const visible=()=>{if(document.visibilityState==='visible')void reload();};document.addEventListener('visibilitychange',visible);return()=>{mounted.current=false;active.current?.abort();active.current=null;clearInterval(timer);document.removeEventListener('visibilitychange',visible);};},[reload]);
 async function markRead(ids:string[]){
  if(!ids.length||writing.current)return;
  writing.current=true;setSaving(true);setError('');
  active.current?.abort();active.current=null;setLoading(false);
  try{const r=await authenticatedApiFetch('/api/notifications',{method:'PATCH',body:JSON.stringify({ids})});if(!r.ok||!(await r.json()).success)throw Error('Unable to mark notifications read.');if(mounted.current)setData(old=>old?{...old,unreadCount:Math.max(0,old.unreadCount-old.data.filter(n=>!n.isRead&&ids.includes(n._id)).length),data:old.data.map(n=>ids.includes(n._id)?{...n,isRead:true}:n)}:old);}
  catch(e){if(mounted.current)setError(e instanceof Error?e.message:'Unable to mark notifications read.');}
  finally{writing.current=false;if(mounted.current)setSaving(false);}
 }
 const unread=data?.unreadCount??0;
 return <DropdownMenu open={open} onOpenChange={value=>{setOpen(value);if(value)void reload();}}><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="relative min-h-11 min-w-11" aria-label={data? `Notifications, ${unread} unread`:'Notifications'}><Bell size={21}/>{unread>0&&<span className="absolute right-0 top-0 rounded-full bg-[#c4e3a7] px-1.5 text-xs font-bold text-[#21452f]">{unread>99?'99+':unread}</span>}</Button></DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-[360px] max-w-[calc(100vw-24px)] p-0 rounded-xl shadow-lg"><div className="bg-[#e4f2d7] px-4 py-3 text-[#21452f]"><div className="flex items-center justify-between gap-2"><h2 className="font-semibold">Notifications</h2><Button variant="ghost" size="icon" aria-label="Refresh notifications" disabled={loading||saving} onClick={()=>void reload()}><RefreshCw size={16} className={loading?'animate-spin':''}/></Button></div><p className="text-xs">{data?`${unread} unread in your account`:'Account updates'}</p></div>
 {error&&<p role="alert" className="p-3 text-sm text-destructive">{error}</p>}
 {loading&&!data&&<p role="status" className="p-4 text-sm text-muted-foreground">Loading notifications…</p>}
 {data&&!data.data.length&&<p className="p-4 text-sm text-muted-foreground">No notifications yet. Business applications and account updates appear here.</p>}
 <div className="max-h-[50vh] overflow-y-auto divide-y">{data?.data.map(n=>{const href=safeNotificationLink(n.link);return <article key={n._id} className={`p-3 break-words ${n.isRead?'':'bg-[#f1f8e9]'}`}><h3 className="text-sm font-semibold">{n.title}</h3><p className="line-clamp-3 text-xs leading-relaxed mt-1">{n.message}</p><p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleDateString('en-LK',{timeZone:'Asia/Colombo'})} · {n.isRead?'Read':'Unread'}</p><div className="flex flex-wrap gap-2 mt-2">{!n.isRead&&<button type="button" disabled={saving} onClick={()=>void markRead([n._id])} className="min-h-11 text-xs font-semibold text-brand-green">Mark read</button>}{href&&<Link href={href} onClick={()=>setOpen(false)} className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-brand-green">View <ArrowUpRight size={13}/></Link>}</div></article>})}</div>
 <div className="border-t p-3 flex flex-wrap gap-3 justify-between items-center"><button type="button" disabled={saving||!data?.data.some(n=>!n.isRead)} onClick={()=>void markRead(data?.data.filter(n=>!n.isRead).map(n=>n._id)||[])} className="min-h-11 inline-flex items-center gap-1 text-xs font-semibold disabled:opacity-40"><Check size={15}/>Mark shown read</button><Link href="/profile/notifications" onClick={()=>setOpen(false)} className="min-h-11 inline-flex items-center text-xs font-semibold text-brand-green">All notifications</Link></div></DropdownMenuContent></DropdownMenu>;
}
export default NotificationsBell;
