import {z} from 'zod';
import prisma from '@/lib/prisma';
import {requireAdminSimple,validateOrigin} from '@/lib/middleware/adminAuth';
import {clearedStop} from '@/lib/liveVendor';
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
const schema=z.object({supplierId:z.string().min(1).max(120),version:z.string().datetime(),decision:z.enum(['approved','rejected','suspended']),notes:z.string().trim().min(3).max(1000),confirmed:z.boolean()}).strict();
export const GET=requireAdminSimple(async()=>reply({records:await prisma.liveVendor.findMany({include:{supplier:{select:{name:true,makerHandle:true,status:true,applicationStatus:true,makerPublished:true}}},orderBy:[{updatedAt:'desc'},{supplierId:'asc'}],take:500})}));
export const PATCH=requireAdminSimple(async request=>{
 if(!validateOrigin(request))return reply({error:'Invalid request origin'},403);
 const p=schema.safeParse(await request.json().catch(()=>null));if(!p.success)return reply({error:p.error.issues[0].message},400);const v=p.data;
 if(v.decision==='approved'&&!v.confirmed)return reply({error:'Confirm the mobile vendor and public serving-location consent.'},400);
 const result=await prisma.liveVendor.updateMany({where:{supplierId:v.supplierId,updatedAt:new Date(v.version),...(v.decision==='approved'?{supplier:{status:'active',applicationStatus:'approved',makerPublished:true,makerHandle:{not:null},makerWhatsApp:{not:null},products:{some:{role:'supplier',isBanned:false}}}}:{})},data:{...clearedStop,approval:v.decision,reviewNotes:v.notes,reviewedBy:request.user!.userId,reviewedAt:new Date()}});
 return result.count?reply({ok:true}):reply({error:'Entry changed or profile is ineligible. Refresh and review.'},409);
});
