import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {pageMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export const metadata=pageMetadata({path:'/gifting',title:"Good food makes a good gift.",description:"Discover potential food gift suppliers. Ask them directly about packages, prices and availability."});
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){
 return <DiscoveryDirectory mode="gifting" params={await searchParams} path="/gifting" title="Good food makes a good gift." description="Discover potential food gift suppliers. Ask them directly about packages, prices and availability." eyebrow="Gifting" photo="/images/editorial/recipe-ingredients.webp"/>;
}
