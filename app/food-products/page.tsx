import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {directoryMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<DirectoryParams>}){return directoryMetadata("/food-products","Food products in Sri Lanka","Discover specific products published by independent food businesses, from chocolates and tea to speciality ingredients.",await searchParams);}
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){
 return <DiscoveryDirectory mode="products" params={await searchParams} path="/food-products" title="Food products" description="Discover specific products published by independent food businesses, from chocolates and tea to speciality ingredients." eyebrow="Food products" photo="/images/categories/bakery.webp"/>;
}
