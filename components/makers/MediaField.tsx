'use client';
import BusinessMedia from './BusinessMedia';
import {businessMediaSource} from '@/lib/businessMedia';
export default function MediaField({name,title,current,hint}:{name:string;title:string;current?:string|null;hint:string}){
 const src=businessMediaSource(current);
 return <fieldset className="min-w-0 grid gap-2 rounded-lg border border-border p-3"><legend className="px-1 text-sm font-semibold">{title}</legend>
 {src&&<BusinessMedia src={src} alt={'Current '+title.toLowerCase()} className="aspect-video max-h-36 w-full rounded-md object-contain"/>}
 <label className="grid gap-1 text-sm font-medium">Upload {title.toLowerCase()}<input type="file" name={name} accept="image/jpeg,image/png,image/webp,image/avif" className="min-h-11 w-full text-sm"/></label>
 {src&&<label className="flex items-center gap-2 text-sm"><input type="checkbox" name={name+'Remove'}/>Remove current image</label>}
 <p className="text-xs text-muted-foreground">{hint} JPEG, PNG, WebP or AVIF, up to 4 MB. Uploaded files use public image storage; do not upload private photos. A new upload replaces the current image.</p></fieldset>;
}
