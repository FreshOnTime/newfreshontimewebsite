import Link from 'next/link';
import {ArrowUpRight,Search,MapPin,ArrowLeft,ArrowRight} from 'lucide-react';
import {EditorialHeader,GuideShelf,SectionHeading} from './Editorial';
import {listProspects,searchText,pageNumber,publicLink,type DiscoveryMode,type PublicProspect} from '@/lib/discovery';
import {businessTypes,businessTypeLabels,businessTypeLabel,diningBusinessTypes,venueOnlyTypes,isVenueOnly} from '@/lib/businessTypes';
import {publicItemSelect} from '@/lib/makerQueries';
import {MakerItemCard} from '@/components/makers/MakerCards';
import {fieldNotes,notePath} from '@/lib/fieldNotes';
import prisma from '@/lib/prisma';
import {publicMakerWhere,makerKinds} from '@/lib/makers';
import GiftPlanner from './GiftPlanner';
import {EditorialPicks,OccasionShelf,GiftFeature,FoodBrandTabs} from './Curated';
import {editorialMatches} from '@/lib/editorialDiscoveries';
export function SocialLinks({business}:{business:PublicProspect}){const links=[['Website',publicLink(business.website)],['Instagram',publicLink(business.instagram,'instagram.com')],['Facebook',publicLink(business.facebook,'facebook.com')],['TikTok',publicLink(business.tiktok,'tiktok.com')]] as const;return <div className="fp26-socials">{links.map(([label,url])=>url&&<a key={label} href={url} target="_blank" rel="noopener noreferrer">{label}<ArrowUpRight size={16} aria-hidden="true"/></a>)}</div>}
export function ProspectCard({business}:{business:PublicProspect}){return <article className="fp26-index"><p className="fp26-label">{business.category}</p><h3><Link href={'/places/'+encodeURIComponent(business.id)}>{business.name}<ArrowUpRight size={18} aria-hidden="true"/></Link></h3>{business.area&&<p className="fp26-location"><MapPin size={14} aria-hidden="true"/>{business.area}</p>}{business.products&&<p className="line-clamp-3">{business.products}</p>}</article>}
export type DirectoryParams={q?:string|string[];area?:string|string[];town?:string|string[];page?:string|string[];kind?:string;type?:string};
const config={all:{search:'What are you looking for?',placeholder:'Restaurants, coffee, stories…',guide:['a-table-for-two','the-bread-window'],list:'Independent business profiles'},makers:{search:'Business or speciality',placeholder:'Bakery, chocolate, catering…',guide:['the-bread-window'],list:'Independent food businesses'},dining:{search:'Place or cuisine',placeholder:'Café, restaurant, catering…',guide:['a-table-for-two'],list:'Independent dining profiles'},products:{search:'Product or producer',placeholder:'Coffee, tea, chocolate…',guide:['the-price-on-the-jar'],list:'Producers'},gifting:{search:'Gift or supplier',placeholder:'Hamper, cake, chocolate…',guide:['a-gift-worth-opening'],list:'Potential gift suppliers'}};
export async function DiscoveryDirectory({mode,params,path,title,description,eyebrow,photo}:{mode:DiscoveryMode;params:DirectoryParams;path:string;title:string;description:string;eyebrow:string;photo?:string}){
 const q=searchText(params.q),area=searchText(params.area??params.town),page=pageNumber(params.page),settings=config[mode];
 const kind=makerKinds.find(k=>k===params.kind);
 const type=businessTypes.find(t=>t===params.type);
 const match={contains:q,mode:'insensitive' as const};
 const eligibleTypes=mode==='dining'?[...diningBusinessTypes]:mode==='makers'?businessTypes.filter(t=>!venueOnlyTypes.some(v=>v===t)):undefined;
 const supplier={...publicMakerWhere,...(area?{makerTown:{contains:area,mode:'insensitive' as const}}:{})};
 const businessWhere={...supplier,...(eligibleTypes?{businessType:{in:eligibleTypes}}:{}),...(type?{AND:[{businessType:type},...(eligibleTypes?[{businessType:{in:eligibleTypes}}]:[])]}:{}),...(kind?{makerItems:{some:{kind,published:true}}}:{}),...(q?{OR:[{name:match},{makerBio:match},{makerItems:{some:{name:match,published:true}}}]}:{})};
 const productSupplier={...supplier,businessType:{notIn:[...venueOnlyTypes]}};
 const offset=(page-1)*24;
 const [prospectResult,makerResult,itemResult,storyResult]=await Promise.allSettled([
 mode==='products'?Promise.resolve([] as PublicProspect[]):listProspects(mode,q,area,page,{type,kind}),
 ['all','dining','makers'].includes(mode)?prisma.supplier.findMany({where:businessWhere,select:{id:true,name:true,makerTown:true,makerHandle:true,makerBio:true,businessType:true},skip:offset,take:25,orderBy:[{name:'asc'},{id:'asc'}]}):Promise.resolve([]),
 (['all','products','gifting'].includes(mode)||(mode==='dining'&&!!q))?prisma.makerItem.findMany({where:{published:true,supplier:mode==='all'?supplier:mode==='dining'?{...supplier,businessType:{in:[...venueOnlyTypes]}}:productSupplier,AND:[...(q?[{OR:[{name:match},{description:match},{supplier:{name:match}}]}]:[]),...(mode==='gifting'?[{OR:[{name:{contains:'gift',mode:'insensitive' as const}},{name:{contains:'hamper',mode:'insensitive' as const}}]}]:[]),...(kind?[{kind}]:[])]},select:{...publicItemSelect,supplier:{select:{name:true,makerHandle:true,makerTown:true,businessType:true}}},skip:offset,take:25,orderBy:[{createdAt:'desc'},{id:'asc'}]}):Promise.resolve([]),
 mode==='all'?prisma.blog.findMany({where:{published:true,isDeleted:false,supplier,...(q?{OR:[{title:match},{excerpt:match},{supplier:{name:match}}]}:{})},select:{id:true,title:true,excerpt:true,slug:true,supplier:{select:{name:true,makerHandle:true}}},skip:offset,take:25,orderBy:[{publishedAt:'desc'},{id:'asc'}]}):Promise.resolve([])
 ]);
 const prospects=prospectResult.status==='fulfilled'?prospectResult.value:[],makers=makerResult.status==='fulfilled'?makerResult.value:[],items=itemResult.status==='fulfilled'?itemResult.value:[],stories=storyResult.status==='fulfilled'?storyResult.value:[];
 const products=items.filter(item=>!isVenueOnly(item.supplier.businessType));
 const dishes=items.filter(item=>isVenueOnly(item.supplier.businessType));
 const notes=mode==='all'&&page===1&&!area&&q?fieldNotes.filter(n=>[n.title,n.excerpt,n.category].some(v=>v.toLowerCase().includes(q.toLowerCase()))):[];
 const unavailable=[prospectResult,makerResult,itemResult,storyResult].some(r=>r.status==='rejected');
 for(const result of [prospectResult,makerResult,itemResult,storyResult])if(result.status==='rejected')console.error('Discovery query failed',result.reason);
 const hasResults=prospects.length+makers.length+items.length+stories.length+notes.length>0,more=[prospects,makers,items,stories].some(r=>r.length>24);
 const href=(extra:Record<string,string>)=>path+'?'+new URLSearchParams({...(q?{q}:{}),...(area?{area}:{}),...(kind?{kind}:{}),...(type?{type}:{}),...extra});
 const filtered=!!(q||area||kind||type||page>1);
 const showEditorial=page===1&&!kind&&mode!=='products';
 const editorialCount=showEditorial?((mode==='all'||mode==='dining'?editorialMatches('dining',q,area,type).length:0)+(mode==='all'||mode==='gifting'?editorialMatches('gifting',q,area,type).length:0)+(mode==='makers'?editorialMatches('makers',q,area,type).length:0)):0;
 return <div className="fp26-shell fp26-directory">
 <EditorialHeader eyebrow={eyebrow} title={title} description={description} photo={!filtered&&mode!=='all'?photo:undefined}/>
 {(mode==='makers'||mode==='products')&&<FoodBrandTabs products={mode==='products'}/>}
 <form action={path} className="fp26-filters" role="search">{kind&&<input type="hidden" name="kind" value={kind}/>}{type&&<input type="hidden" name="type" value={type}/>}<label><span>{settings.search}</span><div><Search size={19} aria-hidden="true"/><input name="q" defaultValue={q} maxLength={100} placeholder={settings.placeholder}/></div></label><label><span>Town or area</span><div><MapPin size={19} aria-hidden="true"/><input name="area" defaultValue={area} maxLength={100} placeholder="All of Sri Lanka"/></div></label><button className="fp26-action" type="submit">Search <ArrowRight size={18} aria-hidden="true"/></button></form>
 {mode==='makers'&&<nav className="fp26-topicnav fp26-filter-tabs" aria-label="Browse by craft">{[undefined,...makerKinds].map(k=><Link key={k||'all'} aria-current={kind===k?'page':undefined} href={href({kind:k||''})}>{k||'All food businesses'}</Link>)}</nav>}
 {(mode==='dining'||mode==='makers')&&<nav className="fp26-topicnav fp26-filter-tabs" aria-label="Business type">{[undefined,...(eligibleTypes||[])].map(t=><Link key={t||'all'} aria-current={type===t?'page':undefined} href={href({type:t||''})}>{t?businessTypeLabels[t]:'All business types'}</Link>)}</nav>}
 {mode==='gifting'&&!filtered&&<div className="fp-gift-jump"><div><strong>Planning a gift?</strong><p>Build a supplier enquiry for a celebration or corporate order.</p></div><a className="fp26-action" href="#gift-planner">Plan your gift <ArrowRight size={16}/></a></div>}
 <div className="fp26-resultbar"><p>{filtered?'Search results':'Browse the collection'}</p>{filtered&&<Link href={path} className="fp26-textlink">Clear filters</Link>}</div>
 {unavailable&&<p role="status" className="fp26-notice">Some listings are temporarily unavailable. Other guides remain accessible.</p>}
 {makers.length>0&&<section id="makers-results" className="fp26-guide-section"><SectionHeading title={mode==='dining'?'Restaurants, cafés & dining businesses':'Owner-managed businesses'}/><div className="fp26-resultgrid">{makers.slice(0,24).map(m=><article className="fp26-index" key={m.id}><p className="fp26-label">{businessTypeLabel(m.businessType)}</p><h3><Link href={'/makers/'+m.makerHandle}>{m.name}<ArrowUpRight size={18}/></Link></h3>{m.makerTown&&<p className="fp26-location"><MapPin size={14}/>{m.makerTown}</p>}{m.makerBio&&<p className="line-clamp-3">{m.makerBio}</p>}</article>)}</div></section>}
 {products.length>0&&<section className="fp26-guide-section"><SectionHeading title="Food products"/><div className="journal-item-grid">{products.slice(0,24).map(item=><MakerItemCard key={item.id} item={item} handle={item.supplier.makerHandle} makerName={item.supplier.name} makerTown={item.supplier.makerTown}/>)}</div></section>}
 {dishes.length>0&&<section className="fp26-guide-section"><SectionHeading title="Menu discoveries"/><div className="journal-item-grid">{dishes.slice(0,24).map(item=><MakerItemCard key={item.id} item={item} handle={item.supplier.makerHandle} makerName={item.supplier.name} makerTown={item.supplier.makerTown} menuItem/>)}</div></section>}
 {prospects.length>0&&<section className="fp26-guide-section"><SectionHeading title={settings.list}/><div className="fp26-resultgrid">{prospects.slice(0,24).map(b=><ProspectCard key={b.id} business={b}/>)}</div><p className="fp26-meta">Reviewed business details. Confirm current offerings directly.</p></section>}
 {(stories.length>0||notes.length>0)&&<section className="fp26-guide-section"><SectionHeading title="Articles"/><div className="fp26-resultgrid">{stories.slice(0,24).map(story=><article className="fp26-index" key={story.id}><p className="fp26-label">{story.supplier?.name}</p><h3><Link href={'/makers/'+story.supplier?.makerHandle+'/stories/'+story.slug}>{story.title}</Link></h3><p>{story.excerpt}</p></article>)}{notes.map(n=><article className="fp26-index" key={n.slug}><p className="fp26-label">FreshPick editorial</p><h3><Link href={notePath(n)}>{n.title}</Link></h3><p>{n.excerpt}</p></article>)}</div></section>}
 {!hasResults&&!unavailable&&editorialCount===0&&<section className="fp26-empty"><div><h2>{filtered?'No matching FreshPick profiles yet.':mode==='makers'?'The directory is opening.':'Verified listings are being added.'}</h2><p>{filtered?'Try another search or reset your filters.':'Explore the independent editorial selections below where available, or suggest a business.'}</p></div><Link className="fp26-textlink" href={filtered?path:'/for-businesses'}>{filtered?'Browse all':'Suggest a business'} <ArrowUpRight size={16}/></Link></section>}
 {showEditorial&&(mode==='all'||mode==='dining')&&<EditorialPicks group="dining" q={q} area={area} type={type}/>}
 {showEditorial&&(mode==='all'||mode==='gifting')&&<EditorialPicks group="gifting" q={q} area={area} type={type}/>
 }
 {showEditorial&&mode==='makers'&&<EditorialPicks group="makers" q={q} area={area} type={type}/>}
 {mode==='all'&&!filtered&&<><OccasionShelf/><GiftFeature/></>}
 {(page>1||more)&&<nav className="fp26-pagination" aria-label="Result pages">{page>1&&<Link href={href({page:String(page-1)})}><ArrowLeft size={16}/> Previous</Link>}<span>Page {page}</span>{more&&<Link href={href({page:String(page+1)})}>Next <ArrowRight size={16}/></Link>}</nav>}
 {mode==='gifting'&&<GiftPlanner/>}
 {page===1&&<GuideShelf slugs={settings.guide} heading={mode==='makers'?'Meet the world of local food':'Useful reading'} compact/>}
 </div>;
}