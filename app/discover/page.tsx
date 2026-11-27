import {getPageConfig} from '@/lib/sitePages';
import {redirect} from 'next/navigation';
import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {directoryMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<DirectoryParams>}){const c=await getPageConfig('explore');return directoryMetadata('/discover',c.seoTitle,c.seoDescription,await searchParams);}
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){
 const params=await searchParams;const destinations:Record<string,string>={dining:'/eat-drink',makers:'/makers',products:'/food-products',gifting:'/gifting',guides:'/guides',live:'/live'};if(params.scope==='dishes'){const q=typeof params.q==='string'?params.q.trim().slice(0,100):'';redirect('/food-atlas'+(q?'?q='+encodeURIComponent(q):''));}const destination=typeof params.scope==='string'&&Object.prototype.hasOwnProperty.call(destinations,params.scope)?destinations[params.scope]:undefined;if(destination){const q=new URLSearchParams();for(const key of ['q','area'] as const){const value=params[key];if(typeof value==='string'&&value.trim())q.set(key,value.trim().slice(0,100));}redirect(destination+(q.toString()?'?'+q.toString():''));}
 const c=await getPageConfig('explore');
 return <DiscoveryDirectory mode="all" params={params} path="/discover" title={c.title} description={c.description} eyebrow={c.eyebrow} photo="/images/editorial/kitchen-basket.webp"/>;
}
