import {DiscoveryDirectory,type DirectoryParams} from '@/components/discovery/Directory';
import {pageMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export const metadata=pageMetadata({path:'/eat-drink',title:"Eat & drink",description:"Explore reviewed restaurant, café and catering profiles across Sri Lanka. Contact each business directly."});
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){
 return <DiscoveryDirectory mode="dining" params={await searchParams} path="/eat-drink" title="Eat & drink" description="Explore reviewed restaurant, café and catering profiles across Sri Lanka. Contact each business directly." eyebrow="Eat & drink" photo="/images/editorial/restaurant-kitchen.webp"/>;
}
