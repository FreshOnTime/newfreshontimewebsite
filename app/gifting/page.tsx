import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {pageMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export const metadata=pageMetadata({path:'/gifting',title:"Food gifting",description:"Discover local chocolate, tea and hamper suppliers. Contact them directly for gift options, pricing and availability."});
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){
 return <DiscoveryDirectory mode="gifting" params={await searchParams} path="/gifting" title="Gift suppliers" description="Discover local chocolate, tea and hamper suppliers. Contact them directly for gift options, pricing and availability." eyebrow="Curated collection" photo="/images/categories/bakery.webp"/>;
}
