import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {pageMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export const metadata=pageMetadata({path:'/discover',title:"Discover",description:"Search across restaurants, food businesses, products and articles in one place."});
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){
 return <DiscoveryDirectory mode="all" params={await searchParams} path="/discover" title="Explore FreshPick" description="Search across restaurants, food businesses, products and articles in one place." eyebrow="Food, places and stories" photo="/images/editorial/kitchen-basket.webp"/>;
}
