import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Store, Utensils, ShoppingBasket, Gift, BookOpen, Calculator } from 'lucide-react';

export const discoverySections = [
  {name:'Makers',href:'/makers',icon:Store,desc:'Meet the hands behind the food.',photo:'/images/editorial/hands-at-work.webp',alt:'Hands preparing dough'},
  {name:'Eat & drink',href:'/eat-drink',icon:Utensils,desc:'Find a table worth returning to.',photo:'/images/editorial/restaurant-kitchen.webp',alt:'Restaurant kitchen'},
  {name:'Products',href:'/food-products',icon:ShoppingBasket,desc:'Explore the local pantry.',photo:'/images/editorial/kitchen-basket.webp',alt:'Basket of ingredients'},
  {name:'Gifting',href:'/gifting',icon:Gift,desc:'Thoughtful food for every occasion.',photo:'/images/editorial/recipe-ingredients.webp',alt:'Food ingredients arranged on a table'},
  {name:'Journal',href:'/stories',icon:BookOpen,desc:'Stories from the food world.',photo:'/images/editorial/pepper-mortar.webp',alt:'Spices and mortar'},
  {name:'Food tools',href:'/food-tools',icon:Calculator,desc:'Make a more informed choice.',photo:'/images/editorial/market-crates.webp',alt:'Market produce'},
] as const;

export function DiscoveryRail() {
  return <nav className="fp26-rail" aria-label="Browse FreshPick">{discoverySections.map(({name,href,icon:Icon,desc})=><Link href={href} key={href}><Icon size={24} strokeWidth={1.4} aria-hidden="true"/><span><strong>{name}</strong><small>{desc}</small></span><ArrowUpRight size={16} aria-hidden="true"/></Link>)}</nav>;
}
export function EditorialHeader({eyebrow,title,description,photo,alt}:{eyebrow:string;title:string;description:string;photo?:string;alt?:string}) {
  return <header className="fp26-pagehead"><div><p className="fp26-label">{eyebrow}</p><h1>{title}</h1><p className="fp26-deck">{description}</p></div>{photo&&<div className="fp26-pagephoto"><Image src={photo} alt={alt||''} fill sizes="(max-width: 760px) 100vw, 40vw"/></div>}</header>;
}
export function DiscoveryChapters(){
 return <section className="fp26-chapters" aria-labelledby="fp26-explore"><div className="fp26-sectionhead"><p className="fp26-label">The good food guide</p><h2 id="fp26-explore">A world of good food.</h2></div><div className="fp26-spreadgrid">{discoverySections.slice(0,4).map(({name,href,desc,photo,alt})=><Link href={href} className="fp26-storytile" key={href}><div className="fp26-tilephoto"><Image src={photo} alt={alt} fill sizes="(max-width: 760px) 100vw, 50vw"/></div><div><p className="fp26-label">Explore</p><h3>{name}<ArrowUpRight size={22} aria-hidden="true"/></h3><p>{desc}</p></div></Link>)}</div></section>;
}
