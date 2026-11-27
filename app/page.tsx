import {LiveShelf} from '@/components/discovery/LiveShelf';
import {Fragment} from 'react';
import {getPageConfig} from '@/lib/sitePages';
import {GuideShelfFromCms} from '@/components/discovery/DiscoveryGuides';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {HubPaths,AtlasShelf,ReturnShelf,CultureShelf} from '@/components/discovery/Hub';
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
export async function generateMetadata(){const c=await getPageConfig('home');return pageMetadata({path:'/',title:c.seoTitle,description:c.seoDescription});}
export default async function Home(){
 const [config,venues,prospects,stories]=await Promise.all([
 getPageConfig('home'),
 prisma.supplier.findMany({where:{...publicMakerWhere,businessType:{in:[...diningBusinessTypes]}},take:4,orderBy:[{name:'asc'},{id:'asc'}],select:{id:true,name:true,makerHandle:true,makerTown:true,makerBio:true,businessType:true}}).catch(e=>{console.error('Homepage venues',e);return []}),
 prisma.discoveryProspect.findMany({where:{...publicProspectWhere,category:{in:diningCategories}},select:publicProspectSelect,take:4,orderBy:[{reviewedAt:'desc'},{id:'asc'}]}).catch(e=>{console.error('Homepage profiles',e);return []}),
 prisma.blog.findMany({where:{published:true,isDeleted:false,supplier:publicMakerWhere},take:3,orderBy:[{publishedAt:'desc'},{id:'asc'}],select:{id:true,title:true,slug:true,excerpt:true,supplier:{select:{name:true,makerHandle:true}}}}).catch(e=>{console.error('Homepage articles',e);return []})
 ]);
 return <div className="fp26-home fp-discovery-home"><div className="fp26-shell">
 <section className="fp-explore-intro" aria-labelledby="home-headline"><p className="fp26-label">{config.eyebrow}</p><h1 id="home-headline">{config.title}</h1><p className="fp26-deck">{config.description}</p><ExploreSearch/></section>
 {config.sections.filter(section=>section.enabled).map(section=>{const intro=section.intro?<p className="fp26-meta mb-4">{section.intro}</p>:null;switch(section.id){
 case 'live': return <Fragment key={section.id}>{intro}<LiveShelf title={section.title}/></Fragment>;
 case 'paths': return <Fragment key={section.id}>{intro}<HubPaths title={section.title}/></Fragment>;
 case 'dining': return <Fragment key={section.id}>{intro}<EditorialPicks group="dining" feature heading={section.title}/></Fragment>;
 case 'profiles': return <Fragment key={section.id}>{intro}{(venues.length>0||prospects.length>0)&&<section className="fp26-guide-section"><SectionHeading title={section.title} href="/eat-drink" label="All dining profiles"/><div className="fp26-resultgrid">{venues.map(v=><article className="fp26-index" key={v.id}><p className="fp26-label">{businessTypeLabel(v.businessType)}{v.makerTown?' / '+v.makerTown:''}</p><h3><Link href={'/makers/'+v.makerHandle}>{v.name}<ArrowUpRight size={18}/></Link></h3>{v.makerBio&&<p className="line-clamp-3">{v.makerBio}</p>}</article>)}{prospects.map(p=><ProspectCard key={p.id} business={p}/>)}</div></section>}</Fragment>;
 case 'atlas': return <Fragment key={section.id}>{intro}<AtlasShelf title={section.title}/></Fragment>;
 case 'culture': return <Fragment key={section.id}>{intro}<CultureShelf title={section.title}/></Fragment>;
 case 'connections': return <Fragment key={section.id}>{intro}<ConnectShelf title={section.title}/></Fragment>;
 case 'occasions': return <Fragment key={section.id}>{intro}<OccasionShelf title={section.title}/></Fragment>;
 case 'brands': return <Fragment key={section.id}>{intro}<EditorialPicks group="makers" limit={3} heading={section.title}/></Fragment>;
 case 'journal': return <Fragment key={section.id}>{intro}<DiscoveryChapters title={section.title}/></Fragment>;
 case 'saved': return <Fragment key={section.id}>{intro}<ReturnShelf title={section.title}/></Fragment>;
 case 'gifts': return <Fragment key={section.id}>{intro}<GiftCollectionLink title={section.title}/></Fragment>;
 case 'businessStories': return <Fragment key={section.id}>{intro}{stories.length>0&&<section className="fp26-guide-section"><SectionHeading title={section.title} href="/stories" label="Read the journal"/><div className="fp26-resultgrid">{stories.map(story=><article className="fp26-index" key={story.id}><p className="fp26-label">{story.supplier?.name}</p><h3><Link href={'/makers/'+story.supplier?.makerHandle+'/stories/'+story.slug}>{story.title}</Link></h3><p>{story.excerpt}</p></article>)}</div></section>}</Fragment>;
 case 'business': return <Fragment key={section.id}>{intro}<section className="fp26-business-band"><div><p className="fp26-label">For restaurants & food businesses</p><h2>{section.title}</h2><p>Create a public profile, showcase your menu or products and publish your own articles. Free to apply.</p></div><Link className="fp26-action" href="/for-businesses">List your business <ArrowUpRight size={18}/></Link></section></Fragment>;
 case 'guides': return <Fragment key={section.id}>{intro}<GuideShelfFromCms title={section.title}/></Fragment>;
 }})}
 </div></div>;
}
