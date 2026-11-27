import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {dishes,dishPath,type AtlasDish} from '@/lib/foodAtlas';
import {SectionHeading} from './Editorial';
const sections=[
 {icon:'map-pin',title:'Places',desc:'Find restaurants, cafés and bakeries.',href:'/eat-drink'},
 {icon:'bowl-food',title:'Dishes',desc:'Learn what to try and search menus.',href:'/food-atlas'},
 {icon:'users',title:'People',desc:'Meet food businesses and their makers.',href:'/makers'},
 {icon:'package',title:'Products',desc:'Discover what local businesses make.',href:'/food-products'},
 {icon:'calendar-dots',title:'Experiences',desc:'Explore ideas for food outings.',href:'/experiences'},
 {icon:'book-open',title:'Stories',desc:'Read guides and business articles.',href:'/stories'},
] as const;
export function HubPaths(){return <section className="fp26-guide-section fp-hub-paths"><SectionHeading title="What would you like to discover?"/><div className="fp-hub-grid">{sections.map(x=><Link className="fp-hub-path" href={x.href} key={x.href}><Image src={'/icons/discovery/'+x.icon+'.svg'} alt="" width={38} height={38} unoptimized/><div><h3>{x.title}</h3><p>{x.desc}</p></div><ArrowUpRight size={16} aria-hidden="true"/></Link>)}</div></section>}
export function DishCards({entries=dishes}:{entries?:readonly AtlasDish[]}){return <div className="fp-atlas-grid">{entries.map(d=><Link className="fp-atlas-card" href={dishPath(d)} key={d.slug}><Image src="/icons/discovery/bowl-food.svg" width={34} height={34} alt="" unoptimized/><p className="fp26-label">{d.category}</p><h3>{d.name}</h3><p>{d.intro}</p><span className="fp26-textlink">Explore dish <ArrowUpRight size={15} aria-hidden="true"/></span></Link>)}</div>}
export function AtlasShelf(){return <section className="fp26-guide-section"><SectionHeading title="Know your food" href="/food-atlas" label="Food Atlas"/><p className="fp26-meta mb-4">Learn about Sri Lankan dishes and find related food discoveries.</p><DishCards entries={dishes.slice(0,3)}/></section>}
export function ReturnShelf(){return <section className="fp26-guide-section fp-return-shelf"><div><p className="fp26-label">Your own food collection</p><h2>Save something for later.</h2><p>Keep a list of dishes, businesses, products and stories you want to revisit. Saved picks are stored in this browser for now.</p></div><Link className="fp26-action" href="/saved">Your saved picks <ArrowUpRight size={16}/></Link></section>}
