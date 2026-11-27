'use client';
import Link from 'next/link';
import {RefreshCw,ArrowUpRight} from 'lucide-react';
export default function PageError({reset}:{error:Error&{digest?:string};reset:()=>void}){
 return <div className="editorial-wrap py-10"><section className="fp-workspace-surface max-w-2xl mx-auto" role="alert"><p className="text-xs font-semibold text-brand-green">FreshPick / Page recovery</p><h1 className="fp-workspace-heading mt-3">Something slipped.</h1><p className="text-sm text-muted-foreground">We couldn't load this page. Retry the request or return to discovery.</p><div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={reset} className="fp-workspace-primary"><RefreshCw size={16}/>Try again</button><Link href="/discover" className="fp-workspace-secondary">Explore FreshPick <ArrowUpRight size={16}/></Link><Link href="/contact" className="min-h-11 inline-flex items-center text-sm underline">Contact support</Link></div></section></div>;
}
