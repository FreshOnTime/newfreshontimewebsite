import {getPageConfig} from '@/lib/sitePages';
import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {directoryMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<DirectoryParams>}){const c=await getPageConfig('products');return directoryMetadata('/food-products',c.seoTitle,c.seoDescription,await searchParams);}
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){
 const c=await getPageConfig('products');
 return <DiscoveryDirectory mode="products" params={await searchParams} path="/food-products" title={c.title} description={c.description} eyebrow={c.eyebrow} photo="/images/categories/bakery.webp"/>;
}
