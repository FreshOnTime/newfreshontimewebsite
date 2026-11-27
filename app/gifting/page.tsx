import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {directoryMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<DirectoryParams>}){return directoryMetadata("/gifting","Food gift suppliers in Sri Lanka","Discover local chocolate, tea and hamper suppliers. Contact them directly for gift options, pricing and availability.",await searchParams);}
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){
 return <DiscoveryDirectory mode="gifting" params={await searchParams} path="/gifting" title="Gift suppliers" description="Discover local chocolate, tea and hamper suppliers. Contact them directly for gift options, pricing and availability." eyebrow="Curated collection" photo="/images/categories/bakery.webp"/>;
}
