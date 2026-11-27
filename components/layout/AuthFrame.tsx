'use client';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import type {ReactNode} from 'react';
import {Bookmark,Utensils,BookOpen} from 'lucide-react';
export default function AuthFrame({children}:{children:ReactNode}){
 const pathname=usePathname()||'';const signingUp=pathname.includes('signup')||pathname==='/auth/register';
 return <div className="fp-auth lux-auth account-form editorial-wrap fp-discovery-auth grid items-start gap-8 py-8 md:py-12 lg:grid-cols-[.95fr_1.05fr] lg:gap-12">
 <aside className="fp-auth-editorial fp-auth-dark overflow-hidden"><div className="relative h-44 sm:h-64 lg:h-[390px]"><Image src="/images/editorial/restaurant-kitchen.webp" alt="A restaurant kitchen at work" fill priority sizes="(max-width:1023px) 90vw,45vw" className="object-cover"/></div>
 <div className="bg-brand-green-deep p-6 text-white lg:p-9"><p className="text-xs uppercase tracking-widest">FreshPick / Sri Lanka</p><h2 className="mt-3 text-4xl font-normal">{signingUp?'Find your next favourite.':'Good to see you again.'}</h2><div className="mt-5 grid gap-3 text-sm">{[{Icon:Utensils,label:'Discover restaurants and local food businesses'},{Icon:Bookmark,label:'Keep a browser-local collection of places and products'},{Icon:BookOpen,label:'Read guides and food stories'}].map(({Icon,label})=><p key={label} className="flex items-center gap-3"><Icon size={18} aria-hidden="true"/>{label}</p>)}</div></div></aside>
 <div className="fp-auth-fields min-w-0">{children}</div></div>
}