import {getPageConfig} from '@/lib/sitePages';
import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {directoryMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<DirectoryParams>}){const c=await getPageConfig('brands');return directoryMetadata('/makers',c.seoTitle,c.seoDescription,await searchParams);}
export default async function MakersPage({searchParams}:{searchParams:Promise<DirectoryParams>}){
 const c=await getPageConfig('brands');
 return <DiscoveryDirectory mode="makers" params={await searchParams} path="/makers" title="Food & brands" description="Discover local food producers, independent brands and their products in one place. Explore their stories, offerings and official contact channels." eyebrow={c.eyebrow} photo="/images/editorial/hands-at-work.webp"/>;
}