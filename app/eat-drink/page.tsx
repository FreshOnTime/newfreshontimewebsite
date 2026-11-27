import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {directoryMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<DirectoryParams>}){return directoryMetadata("/eat-drink","Restaurants, cafés & dining in Sri Lanka","Find restaurants, cafés, bakeries and catering businesses. Explore menus and stories, then contact them directly.",await searchParams);}
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){
 return <DiscoveryDirectory mode="dining" params={await searchParams} path="/eat-drink" title="Eat & drink" description="Find restaurants, cafés, bakeries and catering businesses. Explore their menus and articles, then contact them directly." eyebrow="Eat & drink" photo="/images/editorial/restaurant-kitchen.webp"/>;
}
