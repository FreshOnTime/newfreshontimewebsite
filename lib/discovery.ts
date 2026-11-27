import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const publicProspectWhere = {reviewStatus:'approved',permissionStatus:'cleared',reviewedAt:{not:null}} satisfies Prisma.DiscoveryProspectWhereInput;
export const publicProspectSelect = {id:true,name:true,category:true,area:true,products:true,website:true,instagram:true,facebook:true,tiktok:true,reviewedAt:true} satisfies Prisma.DiscoveryProspectSelect;
export const diningCategories = ['Café','Café / mobile coffee','Restaurant','Home catering','Grazing / catering','Food experiences'];
export type DiscoveryMode='all'|'dining'|'products'|'gifting'|'makers';
export type PublicProspect=Prisma.DiscoveryProspectGetPayload<{select:typeof publicProspectSelect}>;
export function searchText(value: unknown){return typeof value==='string'?value.trim().slice(0,100):''}
export function pageNumber(value: unknown){return typeof value==='string'&&/^\d{1,4}$/.test(value)?Math.max(1,Number(value)):1}
export function publicLink(value:string|null, host?:string){if(!value)return null;try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)return null;if(host&&u.hostname!==host&&!u.hostname.endsWith('.'+host))return null;return u.href;}catch{return null}}
export async function listProspects(mode:DiscoveryMode,q:string,area:string,page:number){
 const search={contains:q,mode:'insensitive' as const};
 const category=mode==='dining'?{category:{in:diningCategories}}:mode==='makers'?{category:{notIn:['Restaurant','Café','Café / mobile coffee','Food experiences']}}:mode==='products'?{category:{notIn:diningCategories}}:mode==='gifting'?{OR:[{category:{in:['Home bakery','Chocolate','Tea','Coffee','Grazing / catering']}},{products:{contains:'gift',mode:'insensitive' as const}}]}:{};
 const where:Prisma.DiscoveryProspectWhereInput={AND:[publicProspectWhere,category,...(q?[{OR:[{name:search},{products:search},{category:search}]}]:[]),...(area?[{area:{contains:area,mode:'insensitive' as const}}]:[])]};
 return prisma.discoveryProspect.findMany({where,select:publicProspectSelect,orderBy:[{name:'asc'},{id:'asc'}],skip:(page-1)*24,take:25});
}
