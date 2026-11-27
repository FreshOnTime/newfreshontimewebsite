import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {HubPaths,AtlasShelf,ReturnShelf} from '@/components/discovery/Hub';
import ExploreSearch from '@/components/discovery/ExploreSearch';
import {DiscoveryChapters,SectionHeading} from '@/components/discovery/Editorial';
import {EditorialPicks,OccasionShelf,GiftCollectionLink,ConnectShelf} from '@/components/discovery/Curated';
import {ProspectCard} from '@/components/discovery/Directory';
import {publicMakerWhere} from '@/lib/makers';
import {publicProspectWhere,publicProspectSelect,diningCategories} from '@/lib/discovery';
import {diningBusinessTypes,businessTypeLabel} from '@/lib/businessTypes';
import prisma from '@/lib/prisma';
import {pageMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export const metadata=pageMetadata({path:'/',title:'Sri Lankan food & restaurant discovery',description:'FreshPick is Sri Lanka’s independent food discovery platform. Find restaurants, cafés, independent food brands, products and local food stories.'});
export default async function Home(){
 const [venues,prospects,stories]=await Promise.all([
 prisma.supplier.findMany({where:{...publicMakerWhere,businessType:{in:[...diningBusinessTypes]}},take:4,orderBy:[{name:'asc'},{id:'asc'}],select:{id:true,name:true,makerHandle:true,makerTown:true,makerBio:true,businessType:true}}).catch(e=>{console.error('Homepage venues',e);return []}),
 prisma.discoveryProspect.findMany({where:{...publicProspectWhere,category:{in:diningCategories}},select:publicProspectSelect,take:4,orderBy:[{reviewedAt:'desc'},{id:'asc'}]}).catch(e=>{console.error('Homepage profiles',e);return []}),
 prisma.blog.findMany({where:{published:true,isDeleted:false,supplier:publicMakerWhere},take:3,orderBy:[{publishedAt:'desc'},{id:'asc'}],select:{id:true,title:true,slug:true,excerpt:true,supplier:{select:{name:true,makerHandle:true}}}}).catch(e=>{console.error('Homepage articles',e);return []})
 ]);
 return <div className="fp26-home fp-discovery-home"><div className="fp26-shell">
 <section className="fp-explore-intro" aria-labelledby="home-headline"><p className="fp26-label">The Sri Lankan food guide</p><h1 id="home-headline">Find your next favourite.</h1><p className="fp26-deck">Discover Sri Lanka’s food in one place. Find where to eat, learn what to try, meet local makers and explore products and stories. Save your favourites and connect directly with businesses.</p><ExploreSearch/></section>
 <HubPaths/>
 <EditorialPicks group="dining" feature/>
 {(venues.length>0||prospects.length>0)&&<section className="fp26-guide-section"><SectionHeading title="Explore FreshPick profiles" href="/eat-drink" label="All dining profiles"/><div className="fp26-resultgrid">{venues.map(v=><article className="fp26-index" key={v.id}><p className="fp26-label">{businessTypeLabel(v.businessType)}{v.makerTown?' / '+v.makerTown:''}</p><h3><Link href={'/makers/'+v.makerHandle}>{v.name}<ArrowUpRight size={18}/></Link></h3>{v.makerBio&&<p className="line-clamp-3">{v.makerBio}</p>}</article>)}{prospects.map(p=><ProspectCard key={p.id} business={p}/>)}</div></section>}
 <AtlasShelf/>
 <ConnectShelf/>
 <OccasionShelf/>
 <EditorialPicks group="makers" limit={3}/>
 <DiscoveryChapters/>
 <ReturnShelf/>
 <GiftCollectionLink/>
 {stories.length>0&&<section className="fp26-guide-section"><SectionHeading title="Stories from local businesses" href="/stories" label="Read the journal"/><div className="fp26-resultgrid">{stories.map(story=><article className="fp26-index" key={story.id}><p className="fp26-label">{story.supplier?.name}</p><h3><Link href={'/makers/'+story.supplier?.makerHandle+'/stories/'+story.slug}>{story.title}</Link></h3><p>{story.excerpt}</p></article>)}</div></section>}
 <section className="fp26-business-band"><div><p className="fp26-label">For restaurants & food businesses</p><h2>Good food deserves to be found.</h2><p>Create a public profile, showcase your menu or products and publish your own articles. Free to apply.</p></div><Link className="fp26-action" href="/for-businesses">List your business <ArrowUpRight size={18}/></Link></section>
 </div></div>;
}