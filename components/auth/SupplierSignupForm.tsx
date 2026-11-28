'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

export function SupplierSignupForm({onboarding=false}:{onboarding?:boolean}) {
  const { user, loading, refreshAuth } = useAuth();
  const router = useRouter();
  const params=useSearchParams();
  const requestedType=params.get("type");
  const [selectedType,setSelectedType]=useState<BusinessType|''>(()=>requestedType==='gift_creator'?'maker':selectableBusinessTypes.find(t=>t===requestedType)||'');
  const [specialties,setSpecialties]=useState<BusinessSpecialty[]>(()=>businessSpecialties.filter(s=>params.getAll("specialty").includes(s)||(requestedType==='gift_creator'&&s==='food-hampers')).slice(0,8));
  const joinQuery=new URLSearchParams();
  if(selectedType)joinQuery.set("type",selectedType);
  specialties.forEach(s=>joinQuery.append("specialty",s));
  if(params.get('complete')==='1')joinQuery.set('complete','1');
  const joinPath="/dashboard/business-onboarding"+(joinQuery.size?"?"+joinQuery.toString():"");
  const copy=selectedType?typeCopy[selectedType]:defaultCopy;
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onboarding || !user || busy || !selectedType) return;
    const fields = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try {
      const res = await authenticatedApiFetch('/api/suppliers/register', {method:'POST',body:JSON.stringify({
        businessType:selectedType, businessSpecialties:specialties, companyName: fields.get('name'), town: fields.get('town'), contactName: user.firstName, email: user.email || '', phone: user.phoneNumber || fields.get('phone'),
      })});
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Unable to submit your business page.');
      await refreshAuth(); router.push('/dashboard');
    } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); } finally { setBusy(false); }
  }
  const classification=<div className="grid gap-4"><label className="grid gap-2 text-sm font-semibold">Business type<select name="businessType" required value={selectedType} onChange={e=>setSelectedType(selectableBusinessTypes.find(t=>t===e.target.value)||'')} className="block min-h-11 w-full rounded-md border border-border bg-background p-3 text-base font-normal"><option value="" disabled>Choose your main business type</option>{selectableBusinessTypes.map(t=><option key={t} value={t}>{businessTypeLabels[t]}</option>)}</select></label><p className="text-sm leading-6 text-muted-foreground" aria-live="polite">{selectedType ? businessTypeDetails[selectedType].description+' Examples: '+businessTypeDetails[selectedType].examples : 'Choose what your business primarily does. You can offer products, gifts and articles regardless of type.'}</p><details className="rounded-lg border border-border p-3"><summary className="min-h-11 cursor-pointer font-semibold text-sm">Not sure which category fits?</summary><dl className="grid gap-3 pt-2">{selectableBusinessTypes.map(t=><div key={t}><dt className="font-semibold text-sm">{businessTypeLabels[t]}</dt><dd className="text-sm text-muted-foreground">{businessTypeDetails[t].description} Examples: {businessTypeDetails[t].examples}.</dd></div>)}</dl></details><SpecialtyPicker value={specialties} onChange={setSpecialties}/></div>;
  return <div className="maker-hero fp-join min-w-0"><div className="maker-hero-copy min-w-0">
    <p className="fp26-label">{onboarding ? "Step 2 of 2 · Business details" : "Free business registration"}</p><h1 className="maker-headline">{onboarding ? "Set up your business." : "Your business."}<br/><em>{onboarding ? "Make it yours." : "Your story."}</em></h1>
    <p className="my-5 max-w-lg leading-7">{copy.description}</p>
    {loading ? <p>Loading account…</p> : user?.role === 'supplier' && params.get('complete')!=='1' ? <Link href="/dashboard" className="maker-button">View application or business studio</Link> : !onboarding || !user ? <div className="grid min-w-0 gap-4">
      <ol className="grid gap-2 text-sm leading-6"><li><strong>01.</strong> Create your free account.</li><li><strong>02.</strong> Add your business details and submit for review.</li><li><strong>03.</strong> After approval, manage and publish your profile in Business Studio.</li></ol>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Link className="maker-button" href={user?joinPath:"/auth/signup/customer?redirect="+encodeURIComponent(joinPath)}>{user?"Continue to business setup":"Create a free business account"}</Link>
        {!user&&<Link className="inline-flex min-h-11 items-center underline" href={"/auth/login?redirect="+encodeURIComponent(joinPath)}>Already registered? Sign in</Link>}
      </div>
      {!user&&<Link className="text-sm underline" href="/auth/signup">Looking for a member account? See account options</Link>}
    </div> :
      <form onSubmit={submit} className="grid w-full max-w-lg gap-4">
        {classification}
        <label className="grid gap-2 text-sm font-semibold">{copy.name}<input required maxLength={150} name="name" autoComplete="organization" className="block min-h-12 min-w-0 w-full rounded-lg border p-3 text-base font-normal"/></label>
        <label className="grid gap-2 text-sm font-semibold">{copy.town}<input required minLength={2} maxLength={100} name="town" autoComplete="address-level2" className="block min-h-12 min-w-0 w-full rounded-lg border p-3 text-base font-normal"/></label>
        {!user.phoneNumber && <label>Contact phone<input type="tel" name="phone" required className="block w-full rounded-lg border p-3"/></label>}
        {error && <p role="alert">{error}</p>}<button className="maker-button" disabled={busy||!selectedType}>{busy ? 'Submitting…' : 'Submit business for review'}</button>
      </form>}
  </div><div className="maker-hero-photo"><Image fill priority sizes="(max-width:767px) 100vw, 53vw" className="object-cover" src={copy.image} alt={copy.alt}/></div></div>;
}
