import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {pageMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export const metadata=pageMetadata({path:'/eat-drink',title:"Eat & drink",description:"Find restaurants, cafés, bakeries and catering businesses. Explore their menus and articles, then contact them directly."});
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){
 return <DiscoveryDirectory mode="dining" params={await searchParams} path="/eat-drink" title="Eat & drink" description="Find restaurants, cafés, bakeries and catering businesses. Explore their menus and articles, then contact them directly." eyebrow="Eat & drink" photo="/images/editorial/restaurant-kitchen.webp"/>;
}
