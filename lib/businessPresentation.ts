import {businessTypeLabel, isVenueOnly, officialHttps} from './businessTypes';
import {absoluteUrl} from './config/site';
import {specialtyLabel} from './businessSpecialties';

export function businessPresentation(type?:string|null){
 if(type==='restaurant'||type==='cafe')return {section:'Explore the menu',navigation:'Menu',contact:'Plan your visit',action:'Contact the venue',hint:'Confirm opening hours, menus, seating and reservations directly with the venue.',directory:'/eat-drink',directoryLabel:'Explore dining',schema:type==='cafe'?'CafeOrCoffeeShop':'Restaurant'};
 if(type==='gift_creator')return {section:'Explore gift collections',navigation:'Gift collections',contact:'Discuss your gift',action:'Ask about a gift',hint:'Ask about customisation, occasion, quantities, lead times and collection or delivery directly with the creator.',directory:'/gifting',directoryLabel:'Explore food gifts',schema:'Organization'};
 if(type==='bakery')return {section:'Explore baked creations',navigation:'Baked creations',contact:'Enquire about your order',action:'Contact the bakery',hint:'Confirm flavours, sizes, custom orders, availability and collection directly with the bakery.',directory:'/makers',directoryLabel:'Explore food businesses',schema:'Bakery'};
 if(type==='caterer')return {section:'Explore catering offerings',navigation:'Catering offerings',contact:'Discuss your occasion',action:'Contact the caterer',hint:'Ask about menus, guest numbers, dietary needs, dates and service areas directly with the business.',directory:'/eat-drink',directoryLabel:'Explore dining',schema:'Organization'};
 return {section:'Explore their products',navigation:'Products',contact:'Get in touch',action:'Contact the business',hint:'Ask the business about products, availability and fulfilment.',directory:'/makers',directoryLabel:'Explore food businesses',schema:'Organization'};
}
type PublicBusiness={name:string;makerHandle:string|null;businessType?:string|null;makerTown?:string|null;makerBio?:string|null;businessSpecialties?:string[];businessWebsite?:string|null;businessInstagram?:string|null};
export function businessDescription(b:PublicBusiness){
 const summary=[businessTypeLabel(b.businessType),b.makerTown,b.businessSpecialties?.map(specialtyLabel).join(', '),b.makerBio?.trim()].filter(Boolean).join(' · ');
 return (summary||b.name).slice(0,155);
}
export function businessJsonLd(b:PublicBusiness){
 const path='/makers/'+b.makerHandle;
 const sameAs=[officialHttps(b.businessWebsite),officialHttps(b.businessInstagram,'instagram.com')].filter(Boolean);
 // Town alone is not a verified street address; do not assert location-based rich-result eligibility.
 return {'@context':'https://schema.org','@type':'ProfilePage','@id':absoluteUrl(path)+'#profile',url:absoluteUrl(path),name:b.name,inLanguage:'en-LK',mainEntity:{'@type':'Organization','@id':absoluteUrl(path)+'#business',name:b.name,url:absoluteUrl(path),description:businessDescription(b),...(b.makerTown?{areaServed:{'@type':'Place',name:b.makerTown}}:{}),...(sameAs.length?{sameAs}:{}),...(b.businessSpecialties?.length?{knowsAbout:b.businessSpecialties.map(specialtyLabel)}:{})}};
}
type SetupProfile={makerHandle?:string|null;makerBio?:string|null;makerTown?:string|null;makerWhatsApp?:string|null;businessSpecialties?:string[];makerPublished?:boolean};
export function businessSetup(p:SetupProfile,publicItems:number,publicStories:number){
 return [{key:'identity',label:'Set a public page address',complete:!!p.makerHandle},{key:'description',label:'Introduce your business',complete:!!p.makerBio?.trim()},{key:'classification',label:'Choose business specialities',complete:!!p.businessSpecialties?.length},{key:'contact',label:'Add town and public contact',complete:!!(p.makerTown?.trim()&&p.makerWhatsApp?.trim())},{key:'offerings',label:'Publish an offering',complete:publicItems>0},{key:'stories',label:'Publish an article',complete:publicStories>0},{key:'visibility',label:'Make your page public',complete:!!p.makerPublished}] as const;
}
export function offeringLabel(type:string|null|undefined){return isVenueOnly(type)?'Menu items':'Products';}
