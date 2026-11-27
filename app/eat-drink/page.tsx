import {getPageConfig} from '@/lib/sitePages';
import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {directoryMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<DirectoryParams>}){const c=await getPageConfig('dining');return directoryMetadata('/eat-drink',c.seoTitle,c.seoDescription,await searchParams);}
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){
 const c=await getPageConfig('dining');
 return <DiscoveryDirectory mode="dining" params={await searchParams} path="/eat-drink" title={c.title} description={c.description} eyebrow={c.eyebrow} photo="/images/editorial/restaurant-kitchen.webp"/>;
}
