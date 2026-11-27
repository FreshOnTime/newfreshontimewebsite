import {LiveShelf} from '@/components/discovery/LiveShelf';
import Image from 'next/image';
import DiscoveryHeroCarousel from '@/components/discovery/DiscoveryHeroCarousel';
import {getPageConfig} from '@/lib/sitePages';
import {GuideShelfFromCms} from '@/components/discovery/DiscoveryGuides';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {HubPaths,AtlasShelf,ReturnShelf,CultureShelf} from '@/components/discovery/Hub';
import ExploreSearch from '@/components/discovery/ExploreSearch';
import {DiscoveryChapters,SectionHeading} from '@/components/discovery/Editorial';
import {EditorialPicks,OccasionShelf,GiftCollectionLink,ConnectShelf} from '@/components/discovery/Curated';
import {MakerBusinessCard} from '@/components/makers/MakerCards';
import {ProspectCard} from '@/components/discovery/Directory';
import {publicMakerWhere} from '@/lib/makers';
import {publicProspectWhere,publicProspectSelect,diningCategories} from '@/lib/discovery';
import {diningBusinessTypes,businessTypeLabel} from '@/lib/businessTypes';
import prisma from '@/lib/prisma';
import {pageMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export async function generateMetadata(){const c=await getPageConfig('home');return pageMetadata({path:'/',title:c.seoTitle,description:c.seoDescription});}
export default async function Home(){
 const [config,venues,prospects,stories]=await Promise.all([
 getPageConfig('home'),
 prisma.supplier.findMany({where:{...publicMakerWhere,businessType:{in:[...diningBusinessTypes]}},take:4,orderBy:[{name:'asc'},{id:'asc'}],select:{id:true,name:true,makerHandle:true,makerTown:true,makerBio:true,businessType:true,makerItems:{where:{published:true,image:{not:null}},select:{image:true,name:true},orderBy:[{createdAt:'desc'},{id:'asc'}],take:1}}}).catch(e=>{console.error('Homepage venues',e);return []}),
 prisma.discoveryProspect.findMany({where:{...publicProspectWhere,category:{in:diningCategories}},select:publicProspectSelect,take:4,orderBy:[{reviewedAt:'desc'},{id:'asc'}]}).catch(e=>{console.error('Homepage profiles',e);return []}),
 prisma.blog.findMany({where:{published:true,isDeleted:false,supplier:publicMakerWhere},take:3,orderBy:[{publishedAt:'desc'},{id:'asc'}],select:{id:true,title:true,slug:true,excerpt:true,supplier:{select:{name:true,makerHandle:true}}}}).catch(e=>{console.error('Homepage articles',e);return []})
 ]);
 return <div className="fp26-home fp-discovery-home"><div className="fp26-shell">
 <div className="fp-home-hero"><section className="fp-explore-intro" aria-labelledby="home-headline"><p className="fp26-label">{config.eyebrow}</p><h1 id="home-headline">{config.title}</h1><p className="fp26-deck">{config.description}</p><ExploreSearch/></section><DiscoveryHeroCarousel/></div>
 {config.sections.filter(section=>section.enabled).map(section=>{const intro=section.intro?<p className="fp26-meta mb-4">{section.intro}</p>:null;switch(section.id){
 case 'live': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}<LiveShelf title={section.title}/></div>;
 case 'paths': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}<HubPaths title={section.title}/></div>;
 case 'dining': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}<EditorialPicks group="dining" feature heading={section.title}/></div>;
 case 'profiles': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}{(venues.length>0||prospects.length>0)&&<section className="fp26-guide-section"><SectionHeading title={section.title} href="/eat-drink" label="All dining profiles"/><div className="fp26-resultgrid">{venues.map(v=><MakerBusinessCard key={v.id} name={v.name} handle={v.makerHandle} category={businessTypeLabel(v.businessType)} town={v.makerTown} description={v.makerBio} photo={v.makerItems[0]}/>)}{prospects.map(p=><ProspectCard key={p.id} business={p}/>)}</div></section>}</div>;
 case 'atlas': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}<AtlasShelf title={section.title}/></div>;
 case 'culture': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}<CultureShelf title={section.title}/></div>;
 case 'connections': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}<ConnectShelf title={section.title}/></div>;
 case 'occasions': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}<OccasionShelf title={section.title}/></div>;
 case 'brands': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}<EditorialPicks group="makers" limit={3} heading={section.title}/></div>;
 case 'journal': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}<DiscoveryChapters title={section.title}/></div>;
 case 'saved': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}<ReturnShelf title={section.title}/></div>;
 case 'gifts': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}<GiftCollectionLink title={section.title}/></div>;
 case 'businessStories': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}{stories.length>0&&<section className="fp26-guide-section"><SectionHeading title={section.title} href="/stories" label="Read the journal"/><div className="fp26-resultgrid">{stories.map(story=><article className="fp26-index" key={story.id}><p className="fp26-label">{story.supplier?.name}</p><h3><Link href={'/makers/'+story.supplier?.makerHandle+'/stories/'+story.slug}>{story.title}</Link></h3><p>{story.excerpt}</p></article>)}</div></section>}</div>;
 case 'business': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}<section className="fp26-business-band fp-home-business"><div className="fp-home-business-copy"><p className="fp26-label">For restaurants &amp; food businesses</p><h2>{section.title}</h2><p>Introduce your food to people who are looking for something new. FreshPick gives independent food businesses a place to showcase their craft and connect directly with customers.</p><ul><li>Build your own public business profile.</li><li>Publish menus, products and original stories.</li><li>Keep customers informed about your latest offerings.</li></ul><div className="fp-business-actions"><Link className="fp26-action" href="/join">List your business <ArrowUpRight size={18}/></Link><Link className="fp26-textlink" href="/for-businesses">See how it works <ArrowUpRight size={16}/></Link></div><p className="fp-home-business-note">Free to apply. No checkout or delivery obligation.</p></div><figure className="fp-home-business-photo"><Image src="/images/editorial/restaurant-kitchen.webp" alt="Chefs preparing food in a restaurant kitchen" fill sizes="(max-width:760px) 100vw, 40vw"/></figure></section></div>;
 case 'guides': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}<GuideShelfFromCms title={section.title}/></div>;
 }})}
 </div></div>;
}
