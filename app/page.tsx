import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Search, ArrowRight, MapPin } from 'lucide-react';
import { DiscoveryRail, DiscoveryChapters, GuideShelf } from '@/components/discovery/Editorial';
import { MakerItemCard, BatchDetails } from '@/components/makers/MakerCards';
import { ProspectCard } from '@/components/discovery/Directory';
import { publicItemSelect } from '@/lib/makerQueries';
import { publicMakerWhere, openBatches, makerItemPath } from '@/lib/makers';
import {publicProspectWhere,publicProspectSelect} from '@/lib/discovery';
import prisma from '@/lib/prisma';
import { pageMetadata } from '@/lib/seo';
export const dynamic='force-dynamic';
export const metadata=pageMetadata({path:'/',title:'FreshPick | Sri Lanka’s independent food guide',description:'Discover food makers, places to eat, products and practical food guides across Sri Lanka.'});
export default async function Home(){
 const [items,makers,batches,prospects]=await Promise.all([
 prisma.makerItem.findMany({where:{published:true, supplier: publicMakerWhere},take:4,orderBy:[{createdAt:'desc'},{id:'asc'}],select:{...publicItemSelect,supplier:{select:{makerHandle:true,name:true,makerTown:true}}}}).catch(e=>{console.error('Homepage items',e);return []}),
 prisma.supplier.findMany({where:publicMakerWhere,orderBy:[{name:'asc'},{id:'asc'}],take:4,select:{id:true,name:true,makerHandle:true,makerTown:true,makerBio:true}}).catch(e=>{console.error('Homepage makers',e);return []}),
 prisma.makerBatch.findMany({where:{...openBatches(),item:{published:true,supplier:publicMakerWhere}},orderBy:[{cutoff:'asc'},{id:'asc'}],take:3,include:{item:{select:{name:true,slug:true,supplier:{select:{name:true,makerHandle:true,makerTown:true,makerWhatsApp:true}}}}}}).catch(e=>{console.error('Homepage batches',e);return []}),
 prisma.discoveryProspect.findMany({where:publicProspectWhere,select:publicProspectSelect,take:4,orderBy:[{reviewedAt:'desc'},{id:'asc'}]}).catch(e=>{console.error('Homepage profiles',e);return []})
 ]);
 return <div className="fp26-home">
 <div className="fp26-shell">
 <section className="fp26-hero" aria-labelledby="home-headline">
 <div className="fp26-hero-copy"><p className="fp26-issue"><span aria-hidden="true"/> Sri Lanka’s independent food guide</p><h1 id="home-headline">Good food.<br/>Great finds.</h1><p className="fp26-deck">The people who make it. The places that serve it. A better way to discover food across Sri Lanka.</p>
 <form action="/discover" role="search" className="fp26-search"><label htmlFor="home-discover" className="sr-only">Find food or places</label><Search size={20} aria-hidden="true"/><input id="home-discover" name="q" maxLength={100} placeholder="Search food, makers or places"/><button type="submit" aria-label="Search FreshPick"><ArrowRight size={20}/></button></form>
 <p className="fp26-meta fp26-hero-note">Discover independently. Contact businesses directly.</p></div>
 <figure className="fp26-hero-photo"><Image src="/images/editorial/recipe-ingredients.webp" alt="Ingredients arranged for cooking" fill priority sizes="(max-width:760px) 100vw, 54vw"/></figure></section>
 <DiscoveryRail/>
 <DiscoveryChapters/>
 {(makers.length>0||prospects.length>0)&&<section className="fp26-guide-section"><div className="fp26-sectionhead"><h2>Discover local businesses</h2><Link className="fp26-textlink" href="/discover">Explore the directory <ArrowUpRight size={16}/></Link></div><div className="fp26-resultgrid">{makers.map(m=><article className="fp26-index" key={m.id}><p className="fp26-label">{m.makerTown||'Sri Lanka'}</p><h3>{m.name}</h3>{m.makerBio&&<p className="line-clamp-2">{m.makerBio}</p>}<Link href={'/makers/'+m.makerHandle}>Meet the maker <ArrowUpRight size={16}/></Link></article>)}{prospects.map(p=><ProspectCard key={p.id} business={p}/>)}</div></section>}
 {batches.length > 0 && <section className="fp26-guide-section"><div className="fp26-sectionhead"><h2>Taking preorders</h2><Link className="fp26-textlink" href="/makers">Explore makers</Link></div><div className="fp26-resultgrid">{batches.map(batch=><article className="fp26-index" key={batch.id}><p className="fp26-label">{batch.item.supplier.name}</p><h3><Link href={makerItemPath(batch.item.supplier.makerHandle,batch.item.slug)}>{batch.item.name}</Link></h3>{batch.item.supplier.makerTown&&<p><MapPin size={14} className="inline" aria-hidden="true"/> {batch.item.supplier.makerTown}</p>}<BatchDetails batch={batch} itemName={batch.item.name} phone={batch.item.supplier.makerWhatsApp}/></article>)}</div></section>}
 {items.length > 0 && <section className="fp26-guide-section"><div className="fp26-sectionhead"><h2>From the makers</h2><Link className="fp26-textlink" href="/food-products">Browse products</Link></div><div className="journal-item-grid">{items.map(item=><MakerItemCard key={item.id} item={item} handle={item.supplier.makerHandle} makerName={item.supplier.name} makerTown={item.supplier.makerTown}/>)}</div></section>}
 <section className="fp26-toolband"><div><p className="fp26-label">The practical side of food</p><h2>Know what you’re paying for.</h2><p>Estimate the cost of eating out or compare products by price per 100g.</p></div><div className="fp26-toolband-links"><Link href="/food-tools#true-bill">Dining bill estimator <ArrowUpRight size={20}/></Link><Link href="/food-tools#unit-price">Unit price comparison <ArrowUpRight size={20}/></Link></div></section>
 <GuideShelf slugs={['a-place-for-pepper','a-basket-of-greens']} heading="From the pantry"/>
 <section className="fp26-business-band"><div><p className="fp26-label">For independent food businesses</p><h2>Bring your business to the table.</h2><p>Introduce your bakery, café, kitchen or food brand. Free to submit; you keep control of sales and fulfilment.</p></div><Link className="fp26-action" href="/for-businesses">Get discovered <ArrowUpRight size={18}/></Link></section>
 </div></div>;
}
