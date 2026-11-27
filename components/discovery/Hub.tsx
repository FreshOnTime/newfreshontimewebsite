import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {getPublishedDishes,getUpcomingEvents,readPublishedContent,contentPath,formatEventDate} from '@/lib/discoveryContent';
import {dishPath,type AtlasDish} from '@/lib/foodAtlas';
import {SectionHeading} from './Editorial';
import DishPhoto from './DishPhoto';
import {dishShortName} from '@/lib/dishPhotography';
const sections=[
 {icon:'map-pin',title:'Places',desc:'Find restaurants, cafés and bakeries.',href:'/explore/places'},
 {icon:'bowl-food',title:'Dishes',desc:'Learn what to try and search menus.',href:'/food-atlas'},
 {icon:'users',title:'People',desc:'Meet food businesses and their makers.',href:'/explore/makers'},
 {icon:'package',title:'Products',desc:'Discover what local businesses make.',href:'/food-products'},
 {icon:'calendar-dots',title:'Experiences',desc:'Find food events and outings.',href:'/experiences'},
 {icon:'book-open',title:'Stories',desc:'Read guides and food traditions.',href:'/stories'},
] as const;
export function HubPaths({title='What would you like to discover?'}:{title?:string}={}){return <section className="fp26-guide-section fp-hub-paths"><SectionHeading title={title}/><div className="fp-hub-grid">{sections.map(x=><Link className="fp-hub-path" href={x.href} key={x.href}><Image src={'/icons/discovery/'+x.icon+'.svg'} alt="" width={38} height={38} unoptimized/><div><h3>{x.title}</h3><p>{x.desc}</p></div><ArrowUpRight size={16} aria-hidden="true"/></Link>)}</div></section>}
export function DishCards({entries}:{entries:readonly AtlasDish[]}){return <div className="fp-atlas-grid fp-dish-black-grid">{entries.map(d=><Link className="fp-atlas-card fp-dish-editorial-card fp-dish-black-card" href={dishPath(d)} key={d.slug}><DishPhoto slug={d.slug}/><div className="fp-dish-black-copy"><p className="fp26-label">{d.category}</p><h3>{dishShortName(d.name)}</h3><p>{d.intro}</p>{d.try.length>0&&<div className="fp-dish-variants">{d.try.slice(0,3).map(v=><span key={v}>{v}</span>)}</div>}<span className="fp26-textlink">Explore dish <ArrowUpRight size={15} aria-hidden="true"/></span></div></Link>)}</div>}
export async function AtlasShelf({title='Know your food'}:{title?:string}={}){const dishes=(await getPublishedDishes().catch(error=>{console.error('Atlas unavailable',error);return []})).filter(d=>d.slug!=='kiribath');return <section className="fp26-guide-section"><SectionHeading title={title} href="/food-atlas" label="Food Atlas"/><p className="fp26-meta mb-4">Learn about Sri Lankan dishes and find related food discoveries.</p>{dishes.length>0?<DishCards entries={dishes.slice(0,3)}/>:<p className="fp26-meta">Explore the Atlas for published entries.</p>}</section>}
export function ReturnShelf({title='Save something for later.'}:{title?:string}={}){return <section className="fp26-guide-section fp-return-shelf"><div><p className="fp26-label">Your own food collection</p><h2>{title}</h2><p>Keep a list of dishes, businesses, products and stories you want to revisit. Saved picks are stored in this browser for now.</p></div><Link className="fp26-action" href="/saved">Your saved picks <ArrowUpRight size={16}/></Link></section>}

export async function CultureShelf({title='Food, culture & what’s on'}:{title?:string}={}){
 const [traditions,events]=await Promise.all([readPublishedContent('tradition').catch(error=>{console.error('Traditions unavailable',error);return []}),getUpcomingEvents().catch(error=>{console.error('Events unavailable',error);return []})]);
 return <section className="fp26-guide-section"><SectionHeading title={title}/><div className="fp-atlas-grid">{traditions.slice(0,2).map(t=><Link className="fp-atlas-card" href={contentPath(t.kind,t.slug)} key={t.slug}><p className="fp26-label">Food tradition / {t.category}</p><h3>{t.title}</h3><p>{t.summary}</p><span className="fp26-textlink">Read the story</span></Link>)}<Link className="fp-atlas-card" href="/experiences"><p className="fp26-label">Food calendar</p><h3>{events.length?'Upcoming food events':'Discover food experiences'}</h3><p>{events[0]?events[0].title+' · '+(events[0].startsAt?formatEventDate(events[0].startsAt):''): 'Find inspiration for tastings, workshops and food outings. Check back for verified event listings.'}</p><span className="fp26-textlink">Explore events</span></Link></div><Link href="/traditions" className="fp26-textlink mt-4">All food traditions <ArrowUpRight size={16}/></Link></section>
}
