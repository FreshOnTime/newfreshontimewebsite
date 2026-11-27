import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {directoryMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<DirectoryParams>}){return directoryMetadata("/makers","Independent food brands & makers in Sri Lanka","Discover Sri Lankan chocolate makers, tea brands and speciality food businesses.",await searchParams);}
export default async function MakersPage({searchParams}:{searchParams:Promise<DirectoryParams>}){
 return <DiscoveryDirectory mode="makers" params={await searchParams} path="/makers" title="Food brands & makers" description="Explore independent food brands, speciality producers and the people behind them. Find restaurants, cafés, bakeries and caterers in Dining." eyebrow="Food businesses" photo="/images/editorial/hands-at-work.webp"/>;
}