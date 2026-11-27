'use client';
import Link from 'next/link';
import {useEffect} from 'react';
import {RefreshCw,ArrowUpRight} from 'lucide-react';
export default function ErrorPage({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
 useEffect(()=>{console.error('FreshPick page error',error);},[error]);
 return <div className="fp26-shell fp-recovery-page"><section className="fp-recovery-card fp-recovery-error"><div className="fp-recovery-copy"><p className="fp26-label">FreshPick · Page unavailable</p><h1>Something slipped.</h1><p>We couldn’t load this page. Try again, return home or contact the FreshPick team if the problem continues.</p><div className="fp-recovery-actions"><button type="button" className="fp26-action" onClick={reset}><RefreshCw size={18} aria-hidden="true"/> Try again</button><Link href="/" className="fp26-textlink">FreshPick home <ArrowUpRight size={16}/></Link></div><nav aria-label="Recovery help"><Link href="/contact">Contact FreshPick</Link><Link href="/discover">Explore food</Link></nav></div></section></div>;
}
