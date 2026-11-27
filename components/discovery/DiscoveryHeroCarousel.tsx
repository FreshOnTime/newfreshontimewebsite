'use client';
import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,ArrowUpRight} from 'lucide-react';
const slides=[
 {image:'/images/categories/cooked-food.webp',label:'Discover dining',title:'Find something delicious.',href:'/eat-drink',alt:'A bowl of prepared rice, editorial food photograph'},
 {image:'/images/editorial/hands-at-work.webp',label:'Meet the makers',title:'Discover the craft behind the food.',href:'/makers',alt:'Hands kneading dough, editorial photograph'},
 {image:'/images/editorial/recipe-ingredients.webp',label:'Know your food',title:'A world of flavours and traditions.',href:'/food-atlas',alt:'Bowls of spices and ingredients, editorial photograph'},
] as const;
export default function DiscoveryHeroCarousel(){
 const [index,setIndex]=useState(0);const slide=slides[index];
 const move=(delta:number)=>setIndex(i=>(i+delta+slides.length)%slides.length);
 return <section className="fp-hero-carousel" aria-label="Featured food discoveries" aria-roledescription="carousel">
  <div className="fp-hero-slide" aria-live="polite">
   <Image key={slide.image} src={slide.image} alt={slide.alt} fill priority={index===0} sizes="(max-width:1000px) 100vw, 44vw"/>
   <div className="fp-hero-slide-copy"><p>{slide.label}</p><h2>{slide.title}</h2><Link href={slide.href}>Explore <ArrowUpRight size={17} aria-hidden="true"/></Link></div>
  </div>
  <div className="fp-hero-controls"><span aria-label={'Slide '+(index+1)+' of '+slides.length}>{String(index+1).padStart(2,'0')} / 03</span><div className="fp-hero-dots">{slides.map((item,i)=><button type="button" key={item.href} aria-label={'Show '+item.label.toLowerCase()} aria-pressed={i===index} onClick={()=>setIndex(i)}><span/></button>)}</div><div className="fp-hero-arrows"><button type="button" aria-label="Previous discovery" onClick={()=>move(-1)}><ArrowLeft size={19} aria-hidden="true"/></button><button type="button" aria-label="Next discovery" onClick={()=>move(1)}><ArrowRight size={19} aria-hidden="true"/></button></div></div>
 </section>
}
