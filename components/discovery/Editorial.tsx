import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Store, Utensils, ShoppingBasket, Gift, BookOpen, Calculator } from 'lucide-react';
import {fieldNotes,notePath} from '@/lib/fieldNotes';

export const discoverySections=[
 {name:'Makers',href:'/makers',icon:Store},
 {name:'Eat & drink',href:'/eat-drink',icon:Utensils},
 {name:'Products',href:'/food-products',icon:ShoppingBasket},
 {name:'Gifting',href:'/gifting',icon:Gift},
 {name:'Journal',href:'/stories',icon:BookOpen},
 {name:'Food tools',href:'/food-tools',icon:Calculator},
] as const;
export function DiscoveryRail(){return <nav className="fp26-rail" aria-label="Browse FreshPick">{discoverySections.map(({name,href,icon:Icon})=><Link href={href} key={href}><Icon size={21} strokeWidth={1.5} aria-hidden="true"/><strong>{name}</strong><ArrowUpRight size={14} aria-hidden="true"/></Link>)}</nav>;}
export function EditorialHeader({eyebrow,title,description,photo,alt}:{eyebrow:string;title:string;description:string;photo?:string;alt?:string}) {
 return <header className={'fp26-pagehead'+(photo?'':' fp26-compacthead')}><div><p className="fp26-label">{eyebrow}</p><h1>{title}</h1><p className="fp26-deck">{description}</p></div>{photo&&<div className="fp26-pagephoto"><Image src={photo} alt={alt||''} fill sizes="(max-width: 760px) 100vw, 38vw"/></div>}</header>;
}
export function GuideShelf({slugs,heading='From the journal'}:{slugs:string[];heading?:string}){
 const guides=slugs.flatMap(slug=>{const note=fieldNotes.find(n=>n.slug===slug);return note?[note]:[]});
 if(!guides.length)return null;
 return <section className="fp26-guide-section"><div className="fp26-sectionhead"><h2>{heading}</h2><Link className="fp26-textlink" href="/stories">All stories <ArrowUpRight size={15} aria-hidden="true"/></Link></div><div className="fp26-guidegrid">{guides.map(note=><Link key={note.slug} href={notePath(note)} className="fp26-storytile"><div className="fp26-tilephoto"><Image src={note.image} alt={note.alt} fill sizes="(max-width:760px) 100vw, 33vw"/></div><p className="fp26-label">{note.category}</p><h3>{note.title}<ArrowUpRight size={18} aria-hidden="true"/></h3><p>{note.excerpt}</p></Link>)}</div></section>;
}
export function DiscoveryChapters(){return <GuideShelf slugs={['a-table-for-two','the-price-on-the-jar','a-gift-worth-opening']} heading="Good food, better decisions"/>;}
