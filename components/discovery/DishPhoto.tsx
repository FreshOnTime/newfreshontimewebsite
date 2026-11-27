'use client';
import Image from 'next/image';
import {useState} from 'react';
import {dishPhotography,dishPhotoLicense} from '@/lib/dishPhotography';
export default function DishPhoto({slug}:{slug:string}){
 const [failedSlug,setFailedSlug]=useState<string|null>(null);const failed=failedSlug===slug;const photo=dishPhotography[slug];
 return <div className="fp-dish-photo">{photo&&!failed?<><Image src={photo.url} alt={photo.alt} fill unoptimized sizes="(max-width:600px) 100vw,33vw" onError={()=>setFailedSlug(slug)}/><span className="fp-dish-photo-credit">{photo.credit} · CC BY-SA 3.0</span></>:<div className="fp-dish-photo-fallback"><span>FreshPick</span><strong>Food Atlas</strong><small>{failed?'Photograph unavailable':'Editorial photograph pending'}</small></div>}</div>;
}
export function DishPhotoCredit({slug}:{slug:string}){const p=dishPhotography[slug];return p?<p className="fp26-meta">Photograph: <a href={p.source} target="_blank" rel="noopener noreferrer">{p.credit} / Wikimedia Commons</a> · <a href={dishPhotoLicense} target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a> · Display crop.</p>:null}
