import Link from 'next/link';
import {ArrowUpRight,Search} from 'lucide-react';
import {EditorialHeader} from './Editorial';
import {listProspects,searchText,pageNumber,publicLink,type DiscoveryMode,type PublicProspect} from '@/lib/discovery';
import prisma from '@/lib/prisma';
import {publicMakerWhere,makerItemPath} from '@/lib/makers';

export function SocialLinks({business}:{business:PublicProspect}){
 const links=[['Website',publicLink(business.website)],['Instagram',publicLink(business.instagram,'instagram.com')],['Facebook',publicLink(business.facebook,'facebook.com')],['TikTok',publicLink(business.tiktok,'tiktok.com')]] as const;
 return <div className="flex flex-wrap gap-x-4">{links.map(([label,url])=>url&&<a key={label} href={url} target="_blank" rel="noopener noreferrer" className="fp26-textlink">{label}<ArrowUpRight size={14} aria-hidden="true"/></a>)}</div>
}
export function ProspectCard({business}:{business:PublicProspect}){
 return <article className="fp26-index"><p className="fp26-label">{business.category}{business.area?' / '+business.area:''}</p><h2>{business.name}</h2>{business.products&&<p>{business.products}</p>}<Link href={'/places/'+encodeURIComponent(business.id)}>Explore profile <ArrowUpRight size={15} aria-hidden="true"/></Link></article>
}
export type DirectoryParams={q?:string|string[];area?:string|string[];page?:string|string[]};
export async function DiscoveryDirectory({mode,params,path,title,description,eyebrow,photo}:{mode:DiscoveryMode;params:DirectoryParams;path:string;title:string;description:string;eyebrow:string;photo:string}){
 const q=searchText(params.q),area=searchText(params.area),page=pageNumber(params.page);
 let unavailable=false;
 const match={contains:q,mode:'insensitive' as const};
 const [prospects,makers,items]=await Promise.all([
   listProspects(mode,q,area,page).catch(error=>{console.error('Discovery listings unavailable',error);unavailable=true;return [] as PublicProspect[]}),
   mode==='all'&&page===1?prisma.supplier.findMany({where:{...publicMakerWhere,...(q?{OR:[{name:match},{makerItems:{some:{name:match,published:true}}}]}:{}),...(area?{makerTown:{contains:area,mode:'insensitive' as const}}:{})},select:{id:true,name:true,makerTown:true,makerHandle:true},take:12,orderBy:{name:'asc'}}).catch(()=>{unavailable=true;return []}):Promise.resolve([]),
   (mode==='products'||mode==='all'||mode==='gifting')&&page===1?prisma.makerItem.findMany({where:{published:true,supplier:{...publicMakerWhere,...(area?{makerTown:{contains:area,mode:'insensitive' as const}}:{})},...(q?{name:match}:{}),...(mode==='gifting'?{OR:[{name:{contains:'gift',mode:'insensitive' as const}},{name:{contains:'hamper',mode:'insensitive' as const}}]}:{})},select:{id:true,name:true,slug:true,price:true,supplier:{select:{name:true,makerHandle:true}}},take:12,orderBy:{createdAt:'desc'}}).catch(()=>{unavailable=true;return []}):Promise.resolve([]),
 ]);
 const pageHref=(n:number)=>path+'?'+new URLSearchParams({...(q?{q}:{}),...(area?{area}:{}),page:String(n)}).toString();
 return <div className="fp26-shell pb-12"><EditorialHeader {...{eyebrow,title,description,photo}}/>
 <form action={path} className="fp26-filters" role="search"><label>Find food, a business or product<input name="q" defaultValue={q} maxLength={100} placeholder="Try coffee or chocolate"/></label><label>Town or area<input name="area" defaultValue={area} maxLength={100} placeholder="Anywhere in Sri Lanka"/></label><button className="fp26-action" type="submit"><Search size={17} aria-hidden="true"/> Search</button>{(q||area)&&<Link className="fp26-textlink" href={path}>Clear</Link>}</form>
 {unavailable&&<p role="status" className="fp26-notice">Some listings are temporarily unavailable. Please try again later.</p>}
 {makers.length>0&&<section className="mb-8"><div className="fp26-sectionhead"><p className="fp26-label">From the makers</p><Link href="/makers">All makers</Link></div><div className="fp26-resultgrid">{makers.map(m=><article className="fp26-index" key={m.id}><p className="fp26-label">{m.makerTown||'Sri Lanka'}</p><h2>{m.name}</h2><Link href={'/makers/'+m.makerHandle}>Meet the maker <ArrowUpRight size={15}/></Link></article>)}</div></section>}
 {items.length>0&&<section className="mb-8"><div className="fp26-sectionhead"><p className="fp26-label">Available from published makers</p></div><div className="fp26-resultgrid">{items.map(item=><article key={item.id} className="fp26-index"><p className="fp26-label">{item.supplier.name}</p><h2>{item.name}</h2>{item.price!==null&&<p>Rs. {Number(item.price).toLocaleString('en-LK')}</p>}<Link href={makerItemPath(item.supplier.makerHandle,item.slug)}>Product details <ArrowUpRight size={15}/></Link></article>)}</div></section>}
 {prospects.length>0&&<section><div className="fp26-sectionhead"><p className="fp26-label">Independent discovery profiles</p><p className="fp26-meta">Reviewed information, not a guarantee of availability.</p></div><div className="fp26-resultgrid">{prospects.slice(0,24).map(b=><ProspectCard key={b.id} business={b}/>)}</div></section>}
 {!prospects.length&&!makers.length&&!items.length&&!unavailable&&<section className="fp26-empty"><h2 className="text-4xl">{q||area?'No matching results yet.':'This collection is opening.'}</h2><p>We publish businesses after checking their details and publication rights. Explore the journal or introduce your business in the meantime.</p><Link className="fp26-action" href="/for-businesses">Get discovered <ArrowUpRight size={16}/></Link></section>}
 <nav className="flex gap-5 mt-6" aria-label="Result pages">{page>1&&<Link className="fp26-textlink" href={pageHref(page-1)}>Previous</Link>}{prospects.length>24&&<Link className="fp26-textlink" href={pageHref(page+1)}>Next</Link>}</nav>
 </div>
}
