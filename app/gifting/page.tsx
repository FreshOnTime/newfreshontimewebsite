import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {pageMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export const metadata=pageMetadata({path:'/gifting',title:"Food gifting",description:"Find potential gift suppliers and plan your enquiry for a personal celebration or corporate occasion."});
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){
 return <DiscoveryDirectory mode="gifting" params={await searchParams} path="/gifting" title="Food gifting" description="Find potential gift suppliers and plan your enquiry for a personal celebration or corporate occasion." eyebrow="Gifting" photo="/images/categories/bakery.webp"/>;
}
