import prisma from '@/lib/prisma';
import type {AtlasDish} from '@/lib/foodAtlas';
export const contentKinds=['dish','tradition','event','guide'] as const;
export type ContentKind=typeof contentKinds[number];
export const publishedContentWhere={published:true,publishedAt:{not:null}} as const;
export const publicContentSelect={slug:true,kind:true,title:true,category:true,summary:true,body:true,aliases:true,variations:true,relatedDishes:true,searchTerm:true,sourceUrl:true,sourceName:true,location:true,startsAt:true,endsAt:true,publishedAt:true,updatedAt:true} as const;
export const readPublishedContent=async(kind:ContentKind)=>prisma.discoveryContent.findMany({where:{...publishedContentWhere,kind},select:publicContentSelect,orderBy:[{publishedAt:'desc'},{slug:'asc'}],take:500});
export const getPublishedDishes=async():Promise<AtlasDish[]>=>{
 const rows=await readPublishedContent('dish');
 return rows.map(r=>({slug:r.slug,name:r.title,aliases:r.aliases,category:r.category,intro:r.summary,detail:r.body,try:r.variations,search:r.searchTerm||r.title,source:r.sourceUrl,sourceName:r.sourceName}));
};
export const getContent=async(kind:ContentKind,slug:string)=>prisma.discoveryContent.findFirst({where:{...publishedContentWhere,kind,slug},select:publicContentSelect});
export const getUpcomingEvents=async()=>prisma.discoveryContent.findMany({where:{...publishedContentWhere,kind:'event',startsAt:{not:null},endsAt:{gte:new Date()}},select:publicContentSelect,orderBy:[{startsAt:'asc'},{slug:'asc'}],take:100});
export const formatEventDate=(date:Date)=>new Intl.DateTimeFormat('en-LK',{timeZone:'Asia/Colombo',dateStyle:'medium',timeStyle:'short'}).format(date);
export function contentPath(kind:string,slug:string){return (kind==='dish'?'/food-atlas/':kind==='tradition'?'/traditions/':kind==='guide'?'/guides/':'/experiences/events/')+slug;}
