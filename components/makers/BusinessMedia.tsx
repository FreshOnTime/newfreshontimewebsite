'use client';
import {useState} from 'react';
import {businessMediaSource} from '@/lib/businessMedia';
export default function BusinessMedia({src,alt,className}:{src:unknown;alt:string;className?:string}){
 const url=businessMediaSource(src);const [failed,setFailed]=useState<string>();
 if(!url||failed===url)return null;
 // eslint-disable-next-line @next/next/no-img-element -- owner-provided HTTPS media is loaded directly, never fetched by the server.
 return <img src={url} alt={alt} className={className} loading="lazy" referrerPolicy="no-referrer" onError={()=>setFailed(url)}/>;
}
