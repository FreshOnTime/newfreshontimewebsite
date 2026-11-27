'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {ArrowUpRight,Bookmark,BookOpen,MapPin,Settings,Bell,Store} from 'lucide-react';
import {useAuth} from '@/contexts/AuthContext';
import BusinessWorkspaceGate from '@/components/makers/BusinessWorkspaceGate';
export default function Dashboard(){
 const {user,loading,logout}=useAuth();const router=useRouter();
 useEffect(()=>{if(!loading&&!user)router.replace('/auth/login?redirect=/dashboard');if(user?.role==='admin')router.replace('/admin')},[loading,user,router]);
 if(loading||!user||user.role==='admin')return <p className="editorial-wrap py-12" role="status">Opening your account…</p>;
 const maker=user.role==='supplier';
 return <div className="fp-dash editorial-wrap py-6 md:py-10"><header className="fp-workspace-hero mb-8"><p>{maker?'FreshPick / Business workspace':'FreshPick / Member workspace'}</p><h1>{maker?'Your business studio.':'Your food journey.'}</h1><p>{maker?'Manage your public profile, offerings, articles and serving updates.':'Discover the food you love, keep your favourites and manage your account.'}</p><button onClick={async()=>{await logout();router.replace('/')}} className="fp-workspace-secondary mt-4">Sign out</button></header>
 {maker?<BusinessWorkspaceGate/>:<div className="fp-workspace-grid">{[{title:'Explore food departments',desc:'Find cafés, restaurants, bakeries and local food businesses.',href:'/explore',icon:MapPin},{title:'Saved picks',desc:'Revisit discoveries saved in this browser.',href:'/saved',icon:Bookmark},{title:'Food journal',desc:'Read guides, comparisons and stories.',href:'/stories',icon:BookOpen},{title:'Account settings',desc:'Manage your personal details and security.',href:'/profile',icon:Settings},{title:'Notifications',desc:'Read your FreshPick account updates.',href:'/profile/notifications',icon:Bell},{title:'List your business',desc:'Learn how to create a public business page.',href:'/for-businesses',icon:Store}].map(({title,desc,href,icon:Icon})=><Link href={href} key={href} className="fp-workspace-card"><Icon size={24}/><h2 className="text-lg font-semibold">{title}</h2><p className="text-sm text-muted-foreground">{desc}</p><small>Open <ArrowUpRight size={14}/></small></Link>)}</div>}
 <nav aria-label="Account settings and history" className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-5 text-sm underline"><Link href="/saved">Saved picks</Link><Link href="/profile">Account settings</Link><Link href="/profile/notifications">Notifications</Link></nav>
 <details className="mt-5 text-sm text-muted-foreground"><summary>Previous marketplace activity</summary><div className="flex flex-wrap gap-4 mt-3"><Link href="/orders">Legacy order history</Link><Link href="/profile/subscriptions">Legacy subscriptions</Link></div></details></div>;
}
