import {redirect} from 'next/navigation';
import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {directoryMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<DirectoryParams>}){return directoryMetadata("/discover","Explore food in Sri Lanka","Search restaurants, cafés, independent food brands, products and articles in one place.",await searchParams);}
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){
 const params=await searchParams;const destinations:Record<string,string>={dining:'/eat-drink',makers:'/makers',products:'/food-products',gifting:'/gifting'};const destination=typeof params.scope==='string'&&Object.prototype.hasOwnProperty.call(destinations,params.scope)?destinations[params.scope]:undefined;if(destination){const q=new URLSearchParams();for(const key of ['q','area'] as const){const value=params[key];if(typeof value==='string'&&value.trim())q.set(key,value.trim().slice(0,100));}redirect(destination+(q.toString()?'?'+q.toString():''));}
 return <DiscoveryDirectory mode="all" params={params} path="/discover" title="Explore FreshPick" description="Search across restaurants, food businesses, products and articles in one place." eyebrow="Food, places and stories" photo="/images/editorial/kitchen-basket.webp"/>;
}
