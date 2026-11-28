import {LiveShelf} from '@/components/discovery/LiveShelf';
import Image from 'next/image';
import DiscoveryHeroCarousel from '@/components/discovery/DiscoveryHeroCarousel';
import {getPageConfig} from '@/lib/sitePages';
import {GuideShelfFromCms} from '@/components/discovery/DiscoveryGuides';
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
import {DISCOVERY_TITLE,DISCOVERY_DESCRIPTION} from '@/lib/config/site';
export const dynamic='force-dynamic';
export function generateMetadata(){return pageMetadata({path:'/',title:DISCOVERY_TITLE,description:DISCOVERY_DESCRIPTION});}
export default async function Home(){
 const [config,venues,prospects,stories]=await Promise.all([
 getPageConfig('home'),
 prisma.supplier.findMany({where:{...publicMakerWhere,businessType:{in:[...diningBusinessTypes]}},take:4,orderBy:[{name:'asc'},{id:'asc'}],select:{id:true,name:true,makerHandle:true,makerTown:true,makerBio:true,businessType:true}}).catch(e=>{console.error('Homepage venues',e);return []}),
 prisma.discoveryProspect.findMany({where:{...publicProspectWhere,category:{in:diningCategories}},select:publicProspectSelect,take:4,orderBy:[{reviewedAt:'desc'},{id:'asc'}]}).catch(e=>{console.error('Homepage profiles',e);return []}),
 prisma.blog.findMany({where:{published:true,isDeleted:false,supplier:publicMakerWhere},take:3,orderBy:[{publishedAt:'desc'},{id:'asc'}],select:{id:true,title:true,slug:true,excerpt:true,supplier:{select:{name:true,makerHandle:true}}}}).catch(e=>{console.error('Homepage articles',e);return []})
 ]);
 return <div className="fp26-home fp-discovery-home"><div className="fp26-shell">
 <div className="fp-home-hero"><section className="fp-explore-intro" aria-labelledby="home-headline"><p className="fp26-label">Food discovery without borders</p><h1 id="home-headline">Discover the world of food.</h1><p className="fp26-deck">{DISCOVERY_DESCRIPTION}</p><div className="mt-3"><Link href="/countries" className="fp26-textlink">Country: Sri Lanka · Explore countries <ArrowUpRight size={14}/></Link></div><ExploreSearch/></section><DiscoveryHeroCarousel/></div>
 <section className="fp26-guide-section" aria-labelledby="freshpick-discovery-title"><h2 id="freshpick-discovery-title" className="editorial-title">What is FreshPick?</h2><p className="fp26-deck max-w-3xl">FreshPick is an independent food discovery platform, starting in Sri Lanka. Find places to eat, explore local food products and gifts, meet producers, discover events and read food guides. Businesses can publish their own profiles, menus, products and articles. Customers contact businesses directly; FreshPick does not sell or deliver groceries.</p><nav aria-label="Explore food discovery" className="fp26-directory-tools">{[{href:'/eat-drink',label:'Restaurants & cafés'},{href:'/makers',label:'Food brands & producers'},{href:'/food-products',label:'Local food products'},{href:'/gifting',label:'Food gifts'},{href:'/experiences',label:'Food events & experiences'},{href:'/food-atlas',label:'Sri Lankan food atlas'},{href:'/stories',label:'Food journal'},{href:'/for-businesses',label:'Publish your business'},{href:'/countries',label:'Explore by country'}].map(item=><Link href={item.href} key={item.href}>{item.label}</Link>)}</nav></section>
 {config.sections.filter(section=>section.enabled).map(section=>{const intro=section.intro?<p className="fp26-meta mb-4">{section.intro}</p>:null;switch(section.id){
 case 'live': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}<LiveShelf title={section.title}/></div>;
 case 'paths': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}<HubPaths title={section.title}/></div>;
 case 'dining': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}<EditorialPicks group="dining" feature heading={section.title}/></div>;
 case 'profiles': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}{(venues.length>0||prospects.length>0)&&<section className="fp26-guide-section"><SectionHeading title={section.title} href="/eat-drink" label="All dining profiles"/><div className="fp26-resultgrid">{venues.map(v=><article className="fp26-index" key={v.id}><p className="fp26-label">{businessTypeLabel(v.businessType)}{v.makerTown?' / '+v.makerTown:''}</p><h3><Link href={'/makers/'+v.makerHandle}>{v.name}<ArrowUpRight size={18}/></Link></h3>{v.makerBio&&<p className="line-clamp-3">{v.makerBio}</p>}</article>)}{prospects.map(p=><ProspectCard key={p.id} business={p}/>)}</div></section>}</div>;
 case 'atlas': return <div key={section.id} className="fp-home-panel" data-home-section={section.id}>{intro}<AtlasShelf title={section.title}/></div>;
 case 'culture': return null;
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
