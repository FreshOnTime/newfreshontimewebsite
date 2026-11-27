import Link from 'next/link';
import {ArrowUpRight,Search,MapPin,ArrowLeft,ArrowRight} from 'lucide-react';
import {EditorialHeader,GuideShelf,DirectoryTools,SectionHeading} from './Editorial';
import {listProspects,searchText,pageNumber,publicLink,type DiscoveryMode,type PublicProspect} from '@/lib/discovery';
import {publicItemSelect} from '@/lib/makerQueries';
import {MakerItemCard} from '@/components/makers/MakerCards';
import prisma from '@/lib/prisma';
import {publicMakerWhere} from '@/lib/makers';
export function SocialLinks({business}:{business:PublicProspect}){const links=[['Website',publicLink(business.website)],['Instagram',publicLink(business.instagram,'instagram.com')],['Facebook',publicLink(business.facebook,'facebook.com')],['TikTok',publicLink(business.tiktok,'tiktok.com')]] as const;return <div className="fp26-socials">{links.map(([label,url])=>url&&<a key={label} href={url} target="_blank" rel="noopener noreferrer">{label}<ArrowUpRight size={16} aria-hidden="true"/></a>)}</div>}
export function ProspectCard({business}:{business:PublicProspect}){return <article className="fp26-index"><p className="fp26-label">{business.category}</p><h3><Link href={'/places/'+encodeURIComponent(business.id)}>{business.name}<ArrowUpRight size={18} aria-hidden="true"/></Link></h3>{business.area&&<p className="fp26-location"><MapPin size={14} aria-hidden="true"/>{business.area}</p>}{business.products&&<p className="line-clamp-3">{business.products}</p>}</article>}
export type DirectoryParams={q?:string|string[];area?:string|string[];page?:string|string[]};
const config={
 all:{search:'Food, business or dish',placeholder:'Coffee, bakery, chocolate…',guide:['the-bread-window','a-table-for-two','the-price-on-the-jar'],list:'Local businesses'},
 makers:{search:'Maker or speciality',placeholder:'Bread, preserves, cakes…',guide:['the-bread-window'],list:'Independent makers'},
 dining:{search:'Place or cuisine',placeholder:'Café, restaurant, catering…',guide:['a-table-for-two'],list:'Places to eat & drink'},
 products:{search:'Product or producer',placeholder:'Coffee, tea, nut butter…',guide:['the-price-on-the-jar','a-place-for-pepper'],list:'Food producers'},
 gifting:{search:'Gift or business',placeholder:'Hamper, chocolate, tea…',guide:['a-gift-worth-opening'],list:'Potential gift suppliers'},
};
export async function DiscoveryDirectory({mode,params,path,title,description,eyebrow,photo}:{mode:DiscoveryMode;params:DirectoryParams;path:string;title:string;description:string;eyebrow:string;photo:string}){
 const q=searchText(params.q),area=searchText(params.area),page=pageNumber(params.page),settings=config[mode];
 const match={contains:q,mode:'insensitive' as const};
 const supplier={...publicMakerWhere,...(area?{makerTown:{contains:area,mode:'insensitive' as const}}:{})};
 const offset=(page-1)*24;
 const [prospectResult,makerResult,itemResult]=await Promise.allSettled([
 listProspects(mode,q,area,page),
 mode==='all'?prisma.supplier.findMany({where:{...supplier,...(q?{OR:[{name:match},{makerItems:{some:{name:match,published:true}}}]}:{})},select:{id:true,name:true,makerTown:true,makerHandle:true,makerBio:true},skip:offset,take:25,orderBy:[{name:'asc'},{id:'asc'}]}):Promise.resolve([]),
 ['all','products','gifting'].includes(mode)?prisma.makerItem.findMany({where:{published:true,supplier,...(q?{name:match}:{}),...(mode==='gifting'?{OR:[{name:{contains:'gift',mode:'insensitive' as const}},{name:{contains:'hamper',mode:'insensitive' as const}}]}:{})},select:{...publicItemSelect,supplier:{select:{name:true,makerHandle:true,makerTown:true}}},skip:offset,take:25,orderBy:[{createdAt:'desc'},{id:'asc'}]}):Promise.resolve([]),
 ]);
 const prospects=prospectResult.status==='fulfilled'?prospectResult.value:[];
 const makers=makerResult.status==='fulfilled'?makerResult.value:[];
 const items=itemResult.status==='fulfilled'?itemResult.value:[];
 const unavailable=[prospectResult,makerResult,itemResult].some(r=>r.status==='rejected');
 for(const result of [prospectResult,makerResult,itemResult])if(result.status==='rejected')console.error('Discovery query failed',result.reason);
 const hasResults=prospects.length+makers.length+items.length>0,more=[prospects,makers,items].some(r=>r.length>24);
 const pageHref=(n:number)=>path+'?'+new URLSearchParams({...(q?{q}:{}),...(area?{area}:{}),page:String(n)});
 const filtered=!!(q||area||page>1);
 return <div className="fp26-shell fp26-directory">
 <EditorialHeader eyebrow={eyebrow} title={title} description={description} photo={!filtered&&mode!=='all'?photo:undefined}/>
 <form action={path} className="fp26-filters" role="search"><label><span>{settings.search}</span><div><Search size={19} aria-hidden="true"/><input name="q" defaultValue={q} maxLength={100} placeholder={settings.placeholder}/></div></label><label><span>Town or area</span><div><MapPin size={19} aria-hidden="true"/><input name="area" defaultValue={area} maxLength={100} placeholder="All of Sri Lanka"/></div></label><button className="fp26-action" type="submit">Search <ArrowRight size={18} aria-hidden="true"/></button></form>
 <div className="fp26-resultbar"><p>{filtered?'Search results':'Browse the collection'}{hasResults&&!unavailable?' · '+[prospects,makers,items].reduce((n,r)=>n+Math.min(r.length,24),0)+' on this page':''}</p>{filtered&&<Link href={path} className="fp26-textlink">Clear filters</Link>}</div>
 {unavailable&&<p role="status" className="fp26-notice">Some listings are temporarily unavailable. Other guides and tools remain accessible.</p>}
 {makers.length>0&&<section className="fp26-guide-section"><SectionHeading title="Makers" href="/makers" label="All makers"/><div className="fp26-resultgrid">{makers.slice(0,24).map(m=><article className="fp26-index" key={m.id}><p className="fp26-label">{m.makerTown||'Sri Lanka'}</p><h3><Link href={'/makers/'+m.makerHandle}>{m.name}<ArrowUpRight size={18}/></Link></h3>{m.makerBio&&<p className="line-clamp-3">{m.makerBio}</p>}</article>)}</div></section>}
 {items.length>0&&<section className="fp26-guide-section"><SectionHeading title="Published products"/><div className="journal-item-grid">{items.slice(0,24).map(item=><MakerItemCard key={item.id} item={item} handle={item.supplier.makerHandle} makerName={item.supplier.name} makerTown={item.supplier.makerTown}/>)}</div></section>}
 {prospects.length>0&&<section className="fp26-guide-section"><SectionHeading title={settings.list}/><div className="fp26-resultgrid">{prospects.slice(0,24).map(b=><ProspectCard key={b.id} business={b}/>)}</div><p className="fp26-meta">Reviewed business details. Confirm current prices and availability directly.</p></section>}
 {!hasResults&&!unavailable&&<section className="fp26-empty"><div><h2>{filtered?'No matching results yet.':'Verified listings are being added.'}</h2><p>{filtered?'Try another search or reset your filters.':'Explore our useful guides and tools while we review new businesses.'}</p></div><Link className="fp26-textlink" href={filtered?path:'/for-businesses'}>{filtered?'Browse all':'Suggest a business'} <ArrowUpRight size={16}/></Link></section>}
 {(page>1||more)&&<nav className="fp26-pagination" aria-label="Result pages">{page>1&&<Link href={pageHref(page-1)}><ArrowLeft size={16}/> Previous</Link>}<span>Page {page}</span>{more&&<Link href={pageHref(page+1)}>Next <ArrowRight size={16}/></Link>}</nav>}
 {page===1&&<><DirectoryTools mode={mode}/><GuideShelf slugs={settings.guide} heading="Useful reading" compact/></>}
 </div>;
}