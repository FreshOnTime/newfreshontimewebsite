'use client';
import {useState} from 'react';
import {Share2,Copy} from 'lucide-react';
export function ShareDiscovery({title,url}:{title:string;url:string}){
 const [status,setStatus]=useState('');
 async function share(){
  setStatus('');
  try{
   if(typeof navigator.share==='function'){await navigator.share({title,url});return;}
   if(navigator.clipboard){await navigator.clipboard.writeText(url);setStatus('Link copied.');return;}
   setStatus('Copy the page address from your browser.');
  }catch(error){if(error instanceof DOMException&&error.name==='AbortError')return;setStatus('Unable to share. Copy the page address from your browser.');}
 }
 async function copy(){try{await navigator.clipboard.writeText(url);setStatus('Link copied.');}catch{setStatus('Copy the page address from your browser.');}}
 return <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
  <button type="button" onClick={()=>void share()} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold"><Share2 size={16} aria-hidden="true"/> Share</button>
  <button type="button" onClick={()=>void copy()} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold"><Copy size={16} aria-hidden="true"/> Copy link</button>
  <span role="status" className="text-xs text-muted-foreground">{status}</span>
 </div>;
}
