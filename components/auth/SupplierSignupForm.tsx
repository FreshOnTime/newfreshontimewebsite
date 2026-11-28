'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {ArrowRight,ArrowLeft,CheckCircle,Utensils,Coffee,CakeSlice,Package,CookingPot,ShoppingBasket,Sprout,ChefHat,Truck,Store} from 'lucide-react';
import { useRouter,useSearchParams } from 'next/navigation';
import {businessSpecialties,type BusinessSpecialty} from '@/lib/businessSpecialties';
import SpecialtyPicker from '@/components/makers/SpecialtyPicker';
import {selectableBusinessTypes,businessTypeLabels,businessTypeDetails,type BusinessType} from '@/lib/businessTypes';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';

const typeCopy: Record<BusinessType,{description:string;name:string;town:string;image:string;alt:string}> = {
  restaurant:{description:'Help diners discover your restaurant, menu, signature dishes and location.',name:'Restaurant name',town:'Restaurant town',image:'/images/editorial/restaurant-kitchen.webp',alt:'Chefs preparing food in a restaurant kitchen'},
  cafe:{description:'Introduce your café, coffee, drinks and signature dishes to people looking for their next favourite spot.',name:'Café name',town:'Café town',image:'/images/categories/beverages.webp',alt:'Drinks and beverages'},
  bakery:{description:'Showcase cakes, breads, pastries and custom bakes so customers can discover your creations.',name:'Bakery name',town:'Bakery town',image:'/images/categories/bakery.webp',alt:'Freshly baked bread'},
  maker:{description:'Introduce your handmade food, tell your story and connect directly with customers.',name:'Business name',town:'Town or base',image:'/images/editorial/hands-at-work.webp',alt:'Food maker at work'},
  caterer:{description:'Showcase your catering menus, event services and the area you serve.',name:'Catering business name',town:'Service base town',image:'/images/editorial/restaurant-kitchen.webp',alt:'Food preparation in a kitchen'},
  food_brand:{description:'Introduce your food brand, ingredients and product range to interested customers.',name:'Brand name',town:'Business base town',image:'/images/editorial/recipe-ingredients.webp',alt:'Food ingredients'},
  gift_creator:{description:'Showcase your food hampers, celebration gifts and custom creations.',name:'Gift business name',town:'Business base town',image:'/images/editorial/recipe-ingredients.webp',alt:'Speciality food ingredients'},
  grocery:{description:'Showcase groceries and speciality ingredients from your store and help shoppers contact you directly.',name:'Store name',town:'Store town',image:'/images/categories/pantry-staples.webp',alt:'Pantry ingredients'},
  farm:{description:'Help shoppers discover your farm, fresh produce and seasonal availability.',name:'Farm or grower name',town:'Farm town',image:'/images/editorial/kitchen-basket.webp',alt:'Fresh ingredients'},
  mobile_food:{description:'Showcase your mobile food menu and share serving stops through FreshPick Live after approval.',name:'Food truck or pop-up name',town:'Base town',image:'/images/editorial/restaurant-kitchen.webp',alt:'Food preparation'},
  other:{description:'Introduce your independent food business and help customers find your offerings.',name:'Business name',town:'Business town',image:'/images/editorial/hands-at-work.webp',alt:'Independent food maker at work'},
};
const defaultCopy = {description:'Create a free account, then set up your restaurant, café, bakery or food brand profile. Once approved, publish your offerings and stories so customers can discover you and contact you directly.',name:'Business name',town:'Town',image:'/images/editorial/restaurant-kitchen.webp',alt:'Chefs preparing food in a kitchen'};

const typeIcons:Record<BusinessType,typeof Store>={restaurant:Utensils,cafe:Coffee,bakery:CakeSlice,food_brand:Package,maker:CookingPot,grocery:ShoppingBasket,farm:Sprout,caterer:ChefHat,mobile_food:Truck,other:Store,gift_creator:Package};
const orderedTypes:BusinessType[]=['restaurant','cafe','bakery','food_brand','maker','grocery','farm','caterer','mobile_food','other'];

export function SupplierSignupForm({onboarding=false}:{onboarding?:boolean}) {
 const {user,loading,refreshAuth}=useAuth();
 const router=useRouter(),params=useSearchParams();
 const requestedType=params.get('type');
 const [selectedType,setSelectedType]=useState<BusinessType|''>(()=>requestedType==='gift_creator'?'maker':selectableBusinessTypes.find(t=>t===requestedType)||'');
 const [specialties,setSpecialties]=useState<BusinessSpecialty[]>(()=>businessSpecialties.filter(s=>params.getAll('specialty').includes(s)||(requestedType==='gift_creator'&&s==='food-hampers')).slice(0,8));
 const [step,setStep]=useState<2|3>(2);
 const [name,setName]=useState(''),[town,setTown]=useState(''),[phone,setPhone]=useState('');
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 const query=new URLSearchParams();
 if(selectedType)query.set('type',selectedType);
 specialties.forEach(s=>query.append('specialty',s));
 if(params.get('complete')==='1')query.set('complete','1');
 const joinPath='/dashboard/business-onboarding'+(query.size?'?'+query.toString():'');
 const copy=selectedType?typeCopy[selectedType]:defaultCopy;
 const existing= user?.role==='supplier'&&params.get('complete')!=='1';
 useEffect(()=>{if(onboarding&&!loading&&!user)router.replace('/auth/login?redirect='+encodeURIComponent(joinPath));},[onboarding,loading,user,router,joinPath]);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(!onboarding||!user||busy||!selectedType||step!==3)return;
  setBusy(true);setError('');
  try{
   const res=await authenticatedApiFetch('/api/suppliers/register',{method:'POST',body:JSON.stringify({businessType:selectedType,businessSpecialties:specialties,companyName:name,town,country:'Sri Lanka',contactName:user.firstName,email:user.email||'',phone:user.phoneNumber||phone})});
   const result=await res.json();
   if(!res.ok)throw new Error(result.error||'Unable to submit your business page.');
   await refreshAuth();router.push('/dashboard');
  }catch(e){setError(e instanceof Error?e.message:'Please try again.');}finally{setBusy(false);}
 }
 if(!onboarding)return <div className="maker-hero fp-join min-w-0"><div className="maker-hero-copy min-w-0">
 <p className="fp26-label">FreshPick for Business · Free registration</p><h1 className="maker-headline">Good food deserves to be discovered.</h1><p className="my-5 max-w-lg leading-7">{copy.description}</p>
 <div className="fp-onboard-step"><strong>Free to get started.</strong><p className="mt-1 text-sm">No credit card required. Share your offerings and receive direct customer enquiries after review.</p></div>
 <ol className="my-5 grid gap-2 text-sm leading-6"><li><strong>01.</strong> Create your free account.</li><li><strong>02.</strong> Choose what your business does.</li><li><strong>03.</strong> Add your details and submit for review.</li></ol>
 {loading?<p role="status">Loading account…</p>:existing?<Link href="/dashboard" className="fp-onboard-primary">View application or business studio</Link>:<div className="grid gap-4"><div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center"><Link className="fp-onboard-primary" href={user?joinPath:'/auth/signup/customer?redirect='+encodeURIComponent(joinPath)}>{user?'Continue to business setup':'Create a free business account'}<ArrowRight size={18}/></Link>{!user&&<Link className="inline-flex min-h-11 items-center underline" href={'/auth/login?redirect='+encodeURIComponent(joinPath)}>Already registered? Sign in</Link>}</div><Link href="/for-businesses" className="text-sm underline">Explore all business features and categories</Link>{!user&&<Link className="text-sm underline" href="/auth/signup">Looking for a member account? See account options</Link>}</div>}
 </div><div className="maker-hero-photo"><Image fill priority sizes="(max-width:767px) 100vw, 53vw" className="object-cover" src={copy.image} alt={copy.alt}/></div></div>;
 if(loading||!user)return <p role="status" className="editorial-wrap py-12">Opening your account…</p>;
 if(existing)return <div className="editorial-wrap py-10"><Link href="/dashboard" className="fp-onboard-primary">View application or business studio</Link></div>;
 return <div className="editorial-wrap py-6 md:py-10"><section className="mx-auto max-w-3xl fp-onboard-card">
 <p className="fp26-label">FreshPick for Business · Guided setup</p><h1 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">{step===2?'Choose your business type.':'Introduce your business.'}</h1>
 <div className="fp-onboard-step my-5" aria-live="polite"><p className="text-xs font-semibold">Step {step} of 3</p><progress className="mt-2 h-2 w-full accent-[#578349]" value={step} max={3} aria-label="Business setup progress"/><p className="mt-1 text-sm">Account created · {step===2?'Choose your business type':'Add business details'}</p></div>
 {step===2?<div className="grid gap-4"><fieldset className="grid min-w-0 gap-3"><legend className="font-semibold text-lg">What does your business do?</legend><p className="text-sm leading-6 text-muted-foreground">Choose your main activity. Products, gifts and articles are available to every business type.</p><div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{orderedTypes.map(t=>{const Icon=typeIcons[t];return <button key={t} type="button" aria-pressed={selectedType===t} className="fp-onboard-option" onClick={()=>setSelectedType(t)}><span className="flex w-full items-center justify-between gap-2"><Icon size={22} aria-hidden="true"/>{selectedType===t&&<CheckCircle size={18} aria-hidden="true"/>}</span><strong className="text-sm">{businessTypeLabels[t]}</strong><span className="text-xs leading-5">{businessTypeDetails[t].description}</span><span className="text-xs leading-5 opacity-80">Examples: {businessTypeDetails[t].examples}</span></button>})}</div></fieldset><button type="button" className="fp-onboard-primary" disabled={!selectedType} onClick={()=>setStep(3)}>Continue <ArrowRight size={18}/></button></div>:
 <form onSubmit={submit} className="grid gap-4"><button type="button" className="flex items-center gap-2 text-sm underline" onClick={()=>setStep(2)} disabled={busy}><ArrowLeft size={16}/> Change business type</button><p className="text-sm font-semibold">{selectedType?businessTypeLabels[selectedType]:''}</p><p className="text-sm leading-6">{copy.description}</p>
 <label className="grid gap-2 text-sm font-semibold">{copy.name}<input required maxLength={150} name="name" value={name} onChange={e=>setName(e.target.value)} autoComplete="organization" className="block min-h-12 min-w-0 w-full rounded-lg border p-3 text-base font-normal"/></label>
 <label className="grid gap-2 text-sm font-semibold">Country<select name="country" defaultValue="Sri Lanka" required className="block min-h-12 w-full rounded-lg border bg-white p-3"><option>Sri Lanka</option></select></label><p className="text-xs text-muted-foreground">Currently accepting Sri Lankan business applications. <Link href="/countries" className="underline">Suggest another country</Link>.</p>
 <label className="grid gap-2 text-sm font-semibold">{copy.town}<input required minLength={2} maxLength={100} name="town" value={town} onChange={e=>setTown(e.target.value)} autoComplete="address-level2" className="block min-h-12 min-w-0 w-full rounded-lg border p-3 text-base font-normal"/></label>
 {!user.phoneNumber&&<label className="grid gap-2 text-sm font-semibold">Contact phone<input type="tel" name="phone" value={phone} onChange={e=>setPhone(e.target.value)} required autoComplete="tel" className="block min-h-12 w-full rounded-lg border p-3 text-base font-normal"/></label>}
 <SpecialtyPicker value={specialties} onChange={setSpecialties}/>
 {error&&<p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</p>}<button className="fp-onboard-primary" disabled={busy||!selectedType}>{busy?'Submitting…':'Submit business for review'}<ArrowRight size={18}/></button><p className="text-xs text-muted-foreground">We review business applications before publishing. Track your status in your dashboard.</p></form>}
 </section></div>;
}
