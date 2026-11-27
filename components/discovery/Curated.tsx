import Link from 'next/link';
import Image from 'next/image';
import {ArrowUpRight,ArrowRight,Utensils,MapPin,Coffee,Croissant,Users} from 'lucide-react';
import {editorialMatches,type EditorialGroup} from '@/lib/editorialDiscoveries';
import {SectionHeading} from './Editorial';

export function EditorialPicks({group,q='',area='',limit=4,type,feature=false}:{group:EditorialGroup;q?:string;area?:string;limit?:number;type?:string;feature?:boolean}){
 const entries=editorialMatches(group,q,area,type).slice(0,limit);
 if(!entries.length)return null;
 return <section className="fp26-guide-section fp-curated-picks"><SectionHeading title={group==='dining'?'Colombo dining discoveries':group==='makers'?'Independent food brands to explore':'Gift ideas from local businesses'}/><p className="fp26-meta mb-4">Independent editorial finds, linked to official websites. Not FreshPick partners or customer reviews. Confirm details directly.</p><div className={feature?"fp-curated-feature":"fp-curated-standard"}>{feature&&<Link href="/stories/a-table-for-two" className="fp-curated-lead"><div className="fp-curated-lead-photo"><Image src="/images/categories/cooked-food.webp" alt="Prepared food, editorial illustration" fill priority sizes="(max-width:760px) 100vw,40vw"/></div><div><p className="fp26-label">The weekend edit</p><h3>Make time for a good meal.</h3><p>Read our guide to choosing a table, then explore places through their own websites.</p><span className="fp26-textlink">Read the dining guide <ArrowUpRight size={16}/></span></div></Link>}<div className="fp-curated-list">{entries.map(p=><article key={p.id} className="fp-curated-entry"><p className="fp26-label">{p.category}</p><h3>{p.name}</h3><p className="fp26-location"><MapPin size={14} aria-hidden="true"/>{p.area}</p><p>{p.description}</p><a href={p.url} target="_blank" rel="noopener noreferrer" className="fp26-textlink">Official website <ArrowUpRight size={16} aria-hidden="true"/></a></article>)}</div></div></section>
}
const occasions=[
 {title:'Coffee & cafés',desc:'Find a place for your next cup.',href:'/eat-drink?type=cafe',icon:Coffee},
 {title:'Date night',desc:'A practical guide to choosing a table for two.',href:'/stories/a-table-for-two',icon:Utensils},
 {title:'Family & group meals',desc:'Explore restaurants and ask about group seating.',href:'/eat-drink?type=restaurant',icon:Users},
 {title:'Bakeries & sweet treats',desc:'Explore bakeries and their offerings.',href:'/eat-drink?type=bakery',icon:Croissant},
] as const;
export function OccasionShelf(){return <section className="fp26-guide-section fp-occasion-section"><SectionHeading title="Explore by occasion" href="/eat-drink" label="Browse dining"/><div className="fp-occasion-grid">{occasions.map(({title,desc,href,icon:Icon})=><Link key={title} href={href} className="fp-occasion"><Icon size={26} strokeWidth={1.5} aria-hidden="true"/><h3>{title}</h3><p>{desc}</p><ArrowRight size={17} aria-hidden="true"/></Link>)}</div></section>}
export function ConnectShelf(){
 const sections=[
 {title:'Dining & hospitality',desc:'Restaurants, cafés, bakeries and caterers. Explore menus, stories and ways to get in touch.',href:'/eat-drink',image:'/images/editorial/restaurant-kitchen.webp',alt:'A restaurant kitchen',label:'Explore dining'},
 {title:'Independent food brands & makers',desc:'Meet chocolate makers, tea brands, speciality producers and other independent food businesses.',href:'/makers',image:'/images/editorial/hands-at-work.webp',alt:'Hands preparing food',label:'Discover food businesses'},
 {title:'Discover food products',desc:'Browse specific products, ingredients and published offerings from food businesses.',href:'/food-products',image:'/images/categories/pantry-staples.webp',alt:'Pantry products, editorial illustration',label:'Explore products'},
 ] as const;
 return <section className="fp26-guide-section fp-connect-section"><SectionHeading title="Explore the world of food"/><div className="fp-connect-grid">{sections.map(p=><Link href={p.href} key={p.href} className="fp-connect-card"><div className="fp-connect-photo"><Image src={p.image} alt={p.alt} fill sizes="(max-width:760px) 100vw,33vw"/></div><div className="fp-connect-copy"><h3>{p.title}</h3><p>{p.desc}</p><span className="fp26-textlink">{p.label} <ArrowUpRight size={16}/></span></div></Link>)}</div></section>
}
export function FoodBrandTabs({products=false}:{products?:boolean}){return <div className="fp-brand-switch"><nav className="fp26-topicnav" aria-label="Food and brands"><Link href="/makers" aria-current={!products?'page':undefined}>Food brands & makers</Link><Link href="/food-products" aria-current={products?'page':undefined}>Food products</Link></nav><p className="fp26-meta">{products?'Browse specific published products, not business profiles. Contact the business for availability.':'Discover the businesses behind food products. For individual items, switch to Food products; for restaurants, bakeries and caterers, browse Dining.'}</p></div>}
export function GiftCollectionLink(){return <section className="fp26-guide-section fp-gift-collection"><div><p className="fp26-label">A curated collection</p><h2>Thoughtful food gifts</h2><p>Discover chocolate, tea and hamper suppliers for personal and corporate occasions. Contact the supplier directly; FreshPick does not assemble gifts or take orders.</p></div><Link className="fp26-action" href="/gifting">Browse gift suppliers <ArrowUpRight size={16}/></Link></section>}
