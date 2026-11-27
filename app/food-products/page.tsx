import {permanentRedirect} from 'next/navigation';
import {searchText,pageNumber} from '@/lib/discovery';
import {makerKinds} from '@/lib/makers';
import type {DirectoryParams} from '@/components/discovery/Directory';
export default async function FoodProducts({searchParams}:{searchParams:Promise<DirectoryParams>}){
 const p=await searchParams,query=new URLSearchParams();const q=searchText(p.q),area=searchText(p.area??p.town),kind=makerKinds.find(k=>k===p.kind);
 if(q)query.set('q',q);if(area)query.set('area',area);if(kind)query.set('kind',kind);const page=pageNumber(p.page);if(page>1)query.set('page',String(page));
 permanentRedirect('/makers'+(query.size?'?'+query.toString():''));
}
