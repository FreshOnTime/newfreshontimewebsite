import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {pageMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export const metadata=pageMetadata({path:'/food-products',title:"The local pantry.",description:"Discover independent food products, producers and published maker items."});
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){
 return <DiscoveryDirectory mode="products" params={await searchParams} path="/food-products" title="The local pantry." description="Discover independent food products, producers and published maker items." eyebrow="Food products" photo="/images/editorial/market-crates.webp"/>;
}
