import prisma from '@/lib/prisma';
import type { BusinessType } from '@/lib/businessTypes';
import type { Prisma } from '@prisma/client';

export const publicProspectWhere = {reviewStatus:'approved',permissionStatus:'cleared',reviewedAt:{not:null}} satisfies Prisma.DiscoveryProspectWhereInput;
export const publicProspectSelect = {id:true,name:true,category:true,area:true,products:true,website:true,instagram:true,facebook:true,tiktok:true,reviewedAt:true} satisfies Prisma.DiscoveryProspectSelect;
export const diningCategories = ['Café','Café / mobile coffee','Restaurant','Home catering','Grazing / catering','Food experiences','Bakery','Home bakery','Home kitchen'];
export type DiscoveryMode='all'|'dining'|'products'|'gifting'|'makers';
export type PublicProspect=Prisma.DiscoveryProspectGetPayload<{select:typeof publicProspectSelect}>;
export function searchText(value: unknown){return typeof value==='string'?value.trim().slice(0,100):''}
export function pageNumber(value: unknown){return typeof value==='string'&&/^\d{1,4}$/.test(value)?Math.max(1,Number(value)):1}
export function publicLink(value:string|null, host?:string){if(!value)return null;try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)return null;if(host&&u.hostname!==host&&!u.hostname.endsWith('.'+host))return null;return u.href;}catch{return null}}
const typeCategories:Record<BusinessType,string[]>={restaurant:['Restaurant'],cafe:['Café','Café / mobile coffee'],bakery:['Home bakery','Bakery'],caterer:['Home catering','Grazing / catering'],maker:['Home kitchen','Home bakery','Pantry goods','Specialty food','Craft beverage','Nut butter'],food_brand:['Pantry goods','Specialty food','Nut butter','Craft beverage','Chocolate','Coffee','Tea'],gift_creator:['Food gifts','Gift hampers'],other:['Food experiences']};
const kindCategories:Record<string,string[]>={Bakery:['Home bakery','Bakery'], 'Prepared food':['Home kitchen','Home catering','Grazing / catering','Restaurant'],Pantry:['Pantry goods','Specialty food','Nut butter','Chocolate','Tea','Coffee'],Produce:['Produce','Grower'], 'Dairy & eggs':['Dairy & eggs'],Drinks:['Craft beverage','Coffee','Tea','Café','Café / mobile coffee'],'Food gifts':['Food gifts','Gift hampers','Chocolate','Tea','Coffee'],Other:['Food experiences']};
export async function listProspects(mode:DiscoveryMode,q:string,area:string,page:number,filters?:{type?:BusinessType;kind?:string}){
 const search={contains:q,mode:'insensitive' as const};
 const category=mode==='dining'?{category:{in:diningCategories}}:mode==='makers'?{category:{notIn:['Café','Café / mobile coffee','Restaurant','Food experiences']}}:mode==='products'?{category:{notIn:diningCategories}}:mode==='gifting'?{OR:[{category:{in:['Food gifts','Gift hampers','Home bakery','Chocolate','Tea','Coffee','Grazing / catering']}},{products:{contains:'gift',mode:'insensitive' as const}}]}:{};
 const where:Prisma.DiscoveryProspectWhereInput={AND:[publicProspectWhere,category,...(filters?.type?[{category:{in:typeCategories[filters.type]}}]:[]),...(filters?.kind?[{category:{in:kindCategories[filters.kind]||[]}}]:[]),...(q?[{OR:[{name:search},{products:search},{category:search}]}]:[]),...(area?[{area:{contains:area,mode:'insensitive' as const}}]:[])]};
 return prisma.discoveryProspect.findMany({where,select:publicProspectSelect,orderBy:[{name:'asc'},{id:'asc'}],skip:(page-1)*24,take:25});
}
