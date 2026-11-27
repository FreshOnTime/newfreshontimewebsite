'use client';
import {useState} from 'react';
import {makerImageSrc} from '@/lib/makers';
function Photo({source,name}:{source?:string;name:string}){
 const [failed,setFailed]=useState(false);
 if(!source||failed)return <div className="fp-monogram" aria-hidden="true"><span>{name.trim().slice(0,1).toUpperCase()}</span></div>;
 // eslint-disable-next-line @next/next/no-img-element -- Supplier photographs may be hosted on different domains.
 return <img src={source} alt={name} loading="lazy" referrerPolicy="no-referrer" onError={()=>setFailed(true)} className="aspect-[4/3] w-full rounded-xl object-cover"/>;
}
export function MakerPhoto({image,name}:{image:string|null;name:string}){const source=makerImageSrc(image);return <Photo key={source||''} source={source} name={name}/>;}
