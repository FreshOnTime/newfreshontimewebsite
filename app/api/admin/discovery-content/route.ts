import {NextResponse} from 'next/server';
import {Prisma} from '@prisma/client';
import prisma from '@/lib/prisma';
import {requireAdminSimple,validateOrigin} from '@/lib/middleware/adminAuth';
import {contentInput,type ContentInput} from '@/lib/discoveryContentValidation';
import {z} from 'zod';
const headers={'Cache-Control':'private, no-store'};
const respond=(body:unknown,status=200)=>NextResponse.json(body,{status,headers});
const editEnvelope=z.object({id:z.string().min(1).max(120),version:z.string().datetime(),content:z.unknown()}).strict();
function payload(v:ContentInput,userId:string,publishedAt:Date|null){
 return {kind:v.kind,slug:v.slug,title:v.title,category:v.category,summary:v.summary,body:v.body,aliases:v.aliases,variations:v.variations,relatedDishes:v.relatedDishes,searchTerm:v.searchTerm,sourceUrl:v.sourceUrl,sourceName:v.sourceName,location:v.location,startsAt:v.startsAt?new Date(v.startsAt):null,endsAt:v.endsAt?new Date(v.endsAt):null,published:v.published,publishedAt:v.published?(publishedAt||new Date()):null,updatedBy:userId};
}
export const GET=requireAdminSimple(async()=>respond({records:await prisma.discoveryContent.findMany({orderBy:[{updatedAt:'desc'},{id:'asc'}],take:500})}));
export const POST=requireAdminSimple(async request=>{
 if(!validateOrigin(request))return respond({error:'Invalid request origin'},403);
 const parsed=contentInput.safeParse(await request.json().catch(()=>null));if(!parsed.success)return respond({error:parsed.error.issues[0].message},400);
 try{const record=await prisma.discoveryContent.create({data:payload(parsed.data,request.user!.userId,null)});return respond({record},201)}catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==='P2002')return respond({error:'This content type already has that slug'},409);throw e;}
});
export const PATCH=requireAdminSimple(async request=>{
 if(!validateOrigin(request))return respond({error:'Invalid request origin'},403);
 const envelope=editEnvelope.safeParse(await request.json().catch(()=>null));if(!envelope.success)return respond({error:'Invalid edit request'},400);
 const parsed=contentInput.safeParse(envelope.data.content);if(!parsed.success)return respond({error:parsed.error.issues[0].message},400);
 const {id,version}=envelope.data;const existing=await prisma.discoveryContent.findUnique({where:{id}});if(!existing)return respond({error:'Content not found'},404);
 if(existing.kind!==parsed.data.kind||existing.slug!==parsed.data.slug)return respond({error:'Content type and slug cannot change after creation'},400);
 const result=await prisma.discoveryContent.updateMany({where:{id,updatedAt:new Date(version)},data:payload(parsed.data,request.user!.userId,existing.publishedAt)});
 if(result.count!==1)return respond({error:'Someone edited this entry. Reload before saving.'},409);
 return respond({record:await prisma.discoveryContent.findUniqueOrThrow({where:{id}})});
});
