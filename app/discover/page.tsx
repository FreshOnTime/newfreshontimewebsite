import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {pageMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export const metadata=pageMetadata({path:'/discover',title:"Discover",description:"Find independent makers, places to eat and products worth exploring."});
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){
 return <DiscoveryDirectory mode="all" params={await searchParams} path="/discover" title="Discover" description="Find independent makers, places to eat and products worth exploring." eyebrow="The FreshPick directory" photo="/images/editorial/kitchen-basket.webp"/>;
}
