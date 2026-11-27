import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {pageMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export const metadata=pageMetadata({path:'/food-products',title:"Food products",description:"Discover specific products published by independent food businesses, from chocolates and tea to speciality ingredients."});
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){
 return <DiscoveryDirectory mode="products" params={await searchParams} path="/food-products" title="Food products" description="Discover specific products published by independent food businesses, from chocolates and tea to speciality ingredients." eyebrow="Food products" photo="/images/categories/bakery.webp"/>;
}
