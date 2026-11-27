import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {publicPageMetadata} from '@/lib/publicPages';
export const dynamic='force-dynamic';
export const metadata=publicPageMetadata('/makers');
export default async function MakersPage({searchParams}:{searchParams:Promise<DirectoryParams>}){
 return <DiscoveryDirectory mode="makers" params={await searchParams} path="/makers" title="Meet the makers." description="Explore independent food brands, bakeries, home kitchens, caterers and speciality businesses. Find the people behind the food." eyebrow="Food businesses" photo="/images/editorial/hands-at-work.webp"/>;
}