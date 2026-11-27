import {NextResponse} from 'next/server';
import {Prisma} from '@prisma/client';
import {z} from 'zod';
import prisma from '@/lib/prisma';
import {requireAdminSimple,validateOrigin} from '@/lib/middleware/adminAuth';
import {pageKeys,pageDefaults,validatePageConfig} from '@/lib/sitePageConfig';
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
const input=z.object({key:z.enum(pageKeys),version:z.string().datetime().nullable(),config:z.unknown(),action:z.enum(['draft','publish'])}).strict();
export const GET=requireAdminSimple(async()=>{const rows=await prisma.sitePageContent.findMany();return reply({pages:pageKeys.map(key=>{const row=rows.find(x=>x.key===key);return {key,config:row?validatePageConfig(key,row.draft)||pageDefaults[key]:pageDefaults[key],version:row?.updatedAt.toISOString()||null,publishedAt:row?.publishedAt||null};})});});
export const PATCH=requireAdminSimple(async request=>{
 if(!validateOrigin(request))return reply({error:'Invalid request origin'},403);
 const parsed=input.safeParse(await request.json().catch(()=>null));if(!parsed.success)return reply({error:'Invalid page update'},400);
 const {key,version,action}=parsed.data;const config=validatePageConfig(key,parsed.data.config);if(!config)return reply({error:'Invalid page content or section configuration'},400);
 const publish=action==='publish',updatedBy=request.user!.userId;
 try{
 if(!version){await prisma.sitePageContent.create({data:{key,draft:config,live:publish?config:pageDefaults[key],publishedAt:publish?new Date():null,updatedBy}});}
 else{const result=await prisma.sitePageContent.updateMany({where:{key,updatedAt:new Date(version)},data:{draft:config,updatedBy,...(publish?{live:config,publishedAt:new Date()}:{})}});if(result.count!==1)return reply({error:'Page changed. Reload before editing.'},409);}
 }catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==='P2002')return reply({error:'Page changed. Reload before editing.'},409);throw e;}
 const row=await prisma.sitePageContent.findUniqueOrThrow({where:{key}});return reply({page:{key,config,version:row.updatedAt.toISOString(),publishedAt:row.publishedAt}});
});
