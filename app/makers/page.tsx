import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {publicPageMetadata} from '@/lib/publicPages';
export const dynamic='force-dynamic';
export const metadata=publicPageMetadata('/makers');
export default async function MakersPage({searchParams}:{searchParams:Promise<DirectoryParams>}){
 return <DiscoveryDirectory mode="makers" params={await searchParams} path="/makers" title="Food brands & makers" description="Explore independent food brands, speciality producers and the people behind them. Find restaurants, cafés, bakeries and caterers in Dining." eyebrow="Food businesses" photo="/images/editorial/hands-at-work.webp"/>;
}